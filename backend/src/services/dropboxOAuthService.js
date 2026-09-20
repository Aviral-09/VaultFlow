import { randomUUID } from 'crypto';
import { env } from '../config/env.js';
import { upsertCloudAccount } from './accountService.js';
import { syncAccount } from './syncService.js';
import {
	getEffectiveDropboxOAuthCredentials,
	getSafeDropboxOAuthStatus,
} from './providerAppConfigService.js';

const oauthStates = new Map();
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

const DROPBOX_SCOPES = [
	'account_info.read',
	'files.metadata.read',
	'files.content.read',
	'files.content.write',
];

function cleanupExpiredStates() {
	const now = Date.now();
	for (const [state, data] of oauthStates.entries()) {
		if (now - data.createdAt > OAUTH_STATE_TTL_MS) {
			oauthStates.delete(state);
		}
	}
}

function readDropboxCredentials() {
	const creds = getEffectiveDropboxOAuthCredentials();
	if (!creds.clientId || !creds.clientSecret) {
		console.error('[Dropbox OAuth] Configuration missing: Client ID or Client Secret is not configured in DB or environment.');
		throw new Error('Dropbox is not configured for this VaultFlow deployment.');
	}

	return {
		clientId: creds.clientId,
		clientSecret: creds.clientSecret,
		redirectUri: creds.redirectUri,
	};
}

function parseDropboxError(payload, fallback) {
	return payload?.error_description || payload?.error_summary || payload?.error || fallback;
}

async function exchangeCodeForTokens(code, config) {
	const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
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
		}),
	});

	const payload = await response.json();
	if (!response.ok) {
		throw new Error(parseDropboxError(payload, 'Failed to exchange Dropbox OAuth code'));
	}

	return payload;
}

async function dropboxRpc(accessToken, path, body = {}) {
	const response = await fetch(`https://api.dropboxapi.com/2${path}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	const payload = await response.json().catch(() => null);
	if (!response.ok) {
		throw new Error(parseDropboxError(payload, 'Dropbox API request failed'));
	}

	return payload;
}

async function fetchDropboxProfile(accessToken) {
	const [account, space] = await Promise.all([
		dropboxRpc(accessToken, '/users/get_current_account'),
		dropboxRpc(accessToken, '/users/get_space_usage'),
	]);

	return {
		email: account.email || null,
		displayName: account.name?.display_name || account.name?.familiar_name || null,
		accountId: account.account_id || null,
		totalSpace: Number(space.allocation?.allocated || space.allocation?.individual?.allocated || space.allocation?.team?.allocated || 0),
		usedSpace: Number(space.used || 0),
	};
}

export function getDropboxIntegrationStatus() {
	return getSafeDropboxOAuthStatus();
}

export function createDropboxAuthorizationRequest(userId) {
	if (!userId) {
		throw new Error('Authentication required to connect Dropbox');
	}

	cleanupExpiredStates();
	const config = readDropboxCredentials();

	const state = randomUUID();
	oauthStates.set(state, { userId, createdAt: Date.now() });

	const authorizationUrl = new URL('https://www.dropbox.com/oauth2/authorize');
	authorizationUrl.searchParams.set('client_id', config.clientId);
	authorizationUrl.searchParams.set('response_type', 'code');
	authorizationUrl.searchParams.set('redirect_uri', config.redirectUri);
	authorizationUrl.searchParams.set('token_access_type', 'offline');
	authorizationUrl.searchParams.set('scope', DROPBOX_SCOPES.join(' '));
	authorizationUrl.searchParams.set('state', state);

	return {
		authorizationUrl: authorizationUrl.toString(),
		state,
		redirectUri: config.redirectUri,
	};
}

export async function completeDropboxAccountLink({ code, state, currentUserId }) {
	const config = readDropboxCredentials();

	if (!code || !state) {
		throw new Error('Missing Dropbox OAuth code or state');
	}

	cleanupExpiredStates();
	const authState = oauthStates.get(state);
	if (!authState || (Date.now() - authState.createdAt > OAUTH_STATE_TTL_MS)) {
		if (state) oauthStates.delete(state);
		throw new Error('Invalid or expired Dropbox OAuth state');
	}

	if (!currentUserId || authState.userId !== currentUserId) {
		oauthStates.delete(state);
		throw new Error('OAuth state user mismatch. Please initiate authorization from your active session.');
	}

	const targetUserId = authState.userId;
	oauthStates.delete(state);

	const tokens = await exchangeCodeForTokens(code, config);
	const profile = await fetchDropboxProfile(tokens.access_token);

	if (!profile.email) {
		throw new Error('Unable to read Dropbox account email');
	}

	if (!tokens.refresh_token) {
		throw new Error('Dropbox did not return a refresh token. Reconnect with offline access enabled.');
	}

	const account = upsertCloudAccount({
		userId: targetUserId,
		id: randomUUID(),
		email: profile.email,
		provider: 'dropbox',
		credentials: {
			provider: 'dropbox',
			clientId: config.clientId,
			clientSecret: config.clientSecret,
			redirectUri: config.redirectUri,
			refreshToken: tokens.refresh_token,
			accessToken: tokens.access_token || null,
			expiresIn: tokens.expires_in || null,
			scope: tokens.scope || DROPBOX_SCOPES.join(' '),
			tokenType: tokens.token_type || 'bearer',
			accountId: profile.accountId,
			displayName: profile.displayName,
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
