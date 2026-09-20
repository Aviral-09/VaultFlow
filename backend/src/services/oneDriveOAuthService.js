import { randomUUID } from 'crypto';
import { env } from '../config/env.js';
import { upsertCloudAccount } from './accountService.js';
import { syncAccount } from './syncService.js';
import {
	getEffectiveOneDriveOAuthCredentials,
	getSafeOneDriveOAuthStatus,
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

function readOneDriveCredentials() {
	const creds = getEffectiveOneDriveOAuthCredentials();
	if (!creds.clientId || !creds.clientSecret) {
		console.error('[OneDrive OAuth] Configuration missing: Client ID or Client Secret is not configured in DB or environment.');
		throw new Error('OneDrive is not configured for this OmniCloud deployment.');
	}

	return {
		clientId: creds.clientId,
		clientSecret: creds.clientSecret,
		redirectUri: creds.redirectUri,
		tenantId: env.onedriveTenantId || 'common',
	};
}

function getAuthorityBase(tenantId) {
	return `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0`;
}

async function exchangeCodeForTokens(code, config) {
	const response = await fetch(`${getAuthorityBase(config.tenantId)}/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: config.clientId,
			client_secret: config.clientSecret,
			code,
			redirect_uri: config.redirectUri,
			grant_type: 'authorization_code',
			scope: 'offline_access openid profile email Files.ReadWrite.All User.Read',
		}),
	});

	const payload = await response.json();
	if (!response.ok) {
		throw new Error(payload.error_description || payload.error || 'Failed to exchange OneDrive OAuth code');
	}

	return payload;
}

async function fetchGraphProfile(accessToken) {
	const [meResponse, driveResponse] = await Promise.all([
		fetch('https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}),
		fetch('https://graph.microsoft.com/v1.0/me/drive?$select=id,driveType,quota', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}),
	]);

	const me = await meResponse.json();
	const drive = await driveResponse.json();

	if (!meResponse.ok) {
		throw new Error(me.error?.message || 'Unable to read OneDrive user profile');
	}

	if (!driveResponse.ok) {
		throw new Error(drive.error?.message || 'Unable to read OneDrive drive profile');
	}

	return {
		email: me.mail || me.userPrincipalName || null,
		displayName: me.displayName || null,
		driveId: drive.id || null,
		driveType: drive.driveType || 'personal',
		totalSpace: Number(drive.quota?.total || 0),
		usedSpace: Number(drive.quota?.used || 0),
	};
}

export function getOneDriveIntegrationStatus() {
	return getSafeOneDriveOAuthStatus();
}

export function createOneDriveAuthorizationRequest(userId) {
	if (!userId) {
		throw new Error('Authentication required to connect OneDrive');
	}

	cleanupExpiredStates();
	const config = readOneDriveCredentials();

	const state = randomUUID();
	oauthStates.set(state, { userId, createdAt: Date.now() });

	const authorizationUrl = new URL(`${getAuthorityBase(config.tenantId)}/authorize`);
	authorizationUrl.searchParams.set('client_id', config.clientId);
	authorizationUrl.searchParams.set('response_type', 'code');
	authorizationUrl.searchParams.set('redirect_uri', config.redirectUri);
	authorizationUrl.searchParams.set('response_mode', 'query');
	authorizationUrl.searchParams.set('scope', 'offline_access openid profile email Files.ReadWrite.All User.Read');
	authorizationUrl.searchParams.set('state', state);

	return {
		authorizationUrl: authorizationUrl.toString(),
		state,
		redirectUri: config.redirectUri,
	};
}

export async function completeOneDriveAccountLink({ code, state, currentUserId }) {
	const config = readOneDriveCredentials();

	if (!code || !state) {
		throw new Error('Missing OneDrive OAuth code or state');
	}

	cleanupExpiredStates();
	const authState = oauthStates.get(state);
	if (!authState || (Date.now() - authState.createdAt > OAUTH_STATE_TTL_MS)) {
		if (state) oauthStates.delete(state);
		throw new Error('Invalid or expired OneDrive OAuth state');
	}

	if (!currentUserId || authState.userId !== currentUserId) {
		oauthStates.delete(state);
		throw new Error('OAuth state user mismatch. Please initiate authorization from your active session.');
	}

	const targetUserId = authState.userId;
	oauthStates.delete(state);

	const tokens = await exchangeCodeForTokens(code, config);
	const profile = await fetchGraphProfile(tokens.access_token);

	if (!profile.email) {
		throw new Error('Unable to read OneDrive account email');
	}

	const account = upsertCloudAccount({
		userId: targetUserId,
		id: randomUUID(),
		email: profile.email,
		provider: 'onedrive',
		credentials: {
			provider: 'onedrive',
			clientId: config.clientId,
			clientSecret: config.clientSecret,
			redirectUri: config.redirectUri,
			tenantId: config.tenantId,
			refreshToken: tokens.refresh_token || null,
			accessToken: tokens.access_token || null,
			expiresIn: tokens.expires_in || null,
			scope: tokens.scope || null,
			tokenType: tokens.token_type || null,
			driveId: profile.driveId,
			driveType: profile.driveType,
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