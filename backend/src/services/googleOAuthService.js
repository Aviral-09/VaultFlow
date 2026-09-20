import { randomUUID } from 'crypto';
import { google } from 'googleapis';
import { upsertCloudAccount } from './accountService.js';
import { syncAccount } from './syncService.js';
import {
	getEffectiveGoogleOAuthCredentials,
	getSafeGoogleOAuthStatus,
} from './providerAppConfigService.js';

const oauthStates = new Map();
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function cleanupExpiredStates() {
	const now = Date.now();
	for (const [state, data] of oauthStates.entries()) {
		if (now - data.createdAt > OAUTH_STATE_TTL_MS) {
			oauthStates.delete(state);
		}
	}
}

function readGoogleCredentials() {
	const creds = getEffectiveGoogleOAuthCredentials();
	if (!creds.clientId || !creds.clientSecret) {
		console.error('[Google OAuth] Configuration missing: Client ID or Client Secret is not configured in DB or environment.');
		throw new Error('Google Drive is not configured for this OmniCloud deployment.');
	}

	return {
		client_id: creds.clientId,
		client_secret: creds.clientSecret,
		redirect_uri: creds.redirectUri,
	};
}

function createOAuthClient() {
	const config = readGoogleCredentials();
	return new google.auth.OAuth2(config.client_id, config.client_secret, config.redirect_uri);
}

async function fetchDriveProfile(oauthClient) {
	const drive = google.drive({ version: 'v3', auth: oauthClient });
	const about = await drive.about.get({
		fields: 'user(emailAddress,displayName),storageQuota(limit,usage)',
	});

	const user = about.data.user || {};
	const quota = about.data.storageQuota || {};

	return {
		email: user.emailAddress,
		displayName: user.displayName,
		totalSpace: Number(quota.limit || 0),
		usedSpace: Number(quota.usage || 0),
	};
}

export function getGoogleIntegrationStatus() {
	return getSafeGoogleOAuthStatus();
}

export function createGoogleAuthorizationRequest(userId) {
	if (!userId) {
		throw new Error('Authentication required to connect Google Drive');
	}

	cleanupExpiredStates();
	const oauthClient = createOAuthClient();
	const state = randomUUID();
	oauthStates.set(state, { userId, createdAt: Date.now() });

	const authorizationUrl = oauthClient.generateAuthUrl({
		access_type: 'offline',
		prompt: 'consent',
		scope: [
			'openid',
			'email',
			'profile',
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/drive.metadata',
		],
		state,
	});

	return {
		authorizationUrl,
		state,
		redirectUri: oauthClient._redirectUri || readGoogleCredentials().redirect_uri,
	};
}

export async function completeGoogleAccountLink({ code, state, currentUserId }) {
	if (!code || !state) {
		throw new Error('Missing Google OAuth code or state');
	}

	cleanupExpiredStates();
	const authState = oauthStates.get(state);
	if (!authState || (Date.now() - authState.createdAt > OAUTH_STATE_TTL_MS)) {
		if (state) oauthStates.delete(state);
		throw new Error('Invalid or expired Google OAuth authorization request');
	}

	if (!currentUserId || authState.userId !== currentUserId) {
		oauthStates.delete(state);
		throw new Error('OAuth state user mismatch. Please initiate authorization from your active session.');
	}

	const targetUserId = authState.userId;
	oauthStates.delete(state);

	const oauthClient = createOAuthClient();
	const { tokens } = await oauthClient.getToken(code);
	oauthClient.setCredentials(tokens);

	const profile = await fetchDriveProfile(oauthClient);
	if (!profile.email) {
		throw new Error('Unable to read Google account email');
	}

	const account = upsertCloudAccount({
		userId: targetUserId,
		id: randomUUID(),
		email: profile.email,
		provider: 'google_drive',
		credentials: {
			provider: 'google_drive',
			clientId: oauthClient._clientId,
			clientSecret: oauthClient._clientSecret,
			redirectUri: readGoogleCredentials().redirect_uri,
			refreshToken: tokens.refresh_token || null,
			accessToken: tokens.access_token || null,
			expiryDate: tokens.expiry_date || null,
			scope: tokens.scope || null,
			tokenType: tokens.token_type || null,
		},
		total_space: profile.totalSpace,
		used_space: profile.usedSpace,
		status: 'active',
	});

	await syncAccount(targetUserId, account);

	return {
		account,
		profile,
	};
}
