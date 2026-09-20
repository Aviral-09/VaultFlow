import { randomUUID } from 'crypto';
import { env } from '../config/env.js';
import { upsertCloudAccount } from './accountService.js';
import { syncAccount } from './syncService.js';
import {
	getEffectiveYandexOAuthCredentials,
	getSafeYandexOAuthStatus,
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

function readYandexCredentials() {
	const creds = getEffectiveYandexOAuthCredentials();
	if (!creds.clientId || !creds.clientSecret) {
		console.error('[Yandex OAuth] Configuration missing: Client ID or Client Secret is not configured in DB or environment.');
		throw new Error('Yandex is not configured for this OmniCloud deployment.');
	}

	return {
		clientId: creds.clientId,
		clientSecret: creds.clientSecret,
		redirectUri: creds.redirectUri,
	};
}

async function exchangeCodeForTokens(code, config) {
	const response = await fetch('https://oauth.yandex.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			client_id: config.clientId,
			client_secret: config.clientSecret,
		}),
	});

	const payload = await response.json().catch(() => null);
	if (!response.ok || !payload?.access_token) {
		throw new Error(payload?.error_description || payload?.error || 'Failed to exchange Yandex OAuth code');
	}

	return payload;
}

async function fetchYandexProfile(accessToken) {
	const response = await fetch('https://cloud-api.yandex.net/v1/disk/', {
		headers: { Authorization: `OAuth ${accessToken}` },
	});
	const disk = await response.json().catch(() => null);
	if (!response.ok || !disk) {
		throw new Error(disk?.message || 'Unable to read Yandex Disk profile');
	}

	const login = disk.user?.login || disk.user?.display_name || 'yandex-user';
	return {
		email: disk.user?.email || `${login}@yandex`,
		displayName: disk.user?.display_name || login,
		totalSpace: Number(disk.total_space || 0),
		usedSpace: Number(disk.used_space || 0),
	};
}

export function getYandexIntegrationStatus() {
	return getSafeYandexOAuthStatus();
}

export function createYandexAuthorizationRequest(userId) {
	if (!userId) {
		throw new Error('Authentication required to connect Yandex');
	}

	cleanupExpiredStates();
	const config = readYandexCredentials();

	const state = randomUUID();
	oauthStates.set(state, { userId, createdAt: Date.now() });

	const authorizationUrl = new URL('https://oauth.yandex.com/authorize');
	authorizationUrl.searchParams.set('response_type', 'code');
	authorizationUrl.searchParams.set('client_id', config.clientId);
	authorizationUrl.searchParams.set('redirect_uri', config.redirectUri);
	authorizationUrl.searchParams.set('scope', 'cloud_api:disk.read cloud_api:disk.write cloud_api:disk.info');
	authorizationUrl.searchParams.set('state', state);

	return {
		authorizationUrl: authorizationUrl.toString(),
		state,
		redirectUri: config.redirectUri,
	};
}

export async function completeYandexAccountLink({ code, state, currentUserId }) {
	const config = readYandexCredentials();

	if (!code || !state) {
		throw new Error('Missing Yandex OAuth code or state');
	}

	cleanupExpiredStates();
	const authState = oauthStates.get(state);
	if (!authState || (Date.now() - authState.createdAt > OAUTH_STATE_TTL_MS)) {
		if (state) oauthStates.delete(state);
		throw new Error('Invalid or expired Yandex OAuth state');
	}

	if (!currentUserId || authState.userId !== currentUserId) {
		oauthStates.delete(state);
		throw new Error('OAuth state user mismatch. Please initiate authorization from your active session.');
	}

	const targetUserId = authState.userId;
	oauthStates.delete(state);

	const tokens = await exchangeCodeForTokens(code, config);
	const profile = await fetchYandexProfile(tokens.access_token);

	const account = upsertCloudAccount({
		userId: targetUserId,
		id: randomUUID(),
		email: profile.email,
		provider: 'yandex',
		credentials: {
			provider: 'yandex',
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token || null,
			clientId: config.clientId,
			clientSecret: config.clientSecret,
			expiresIn: tokens.expires_in || null,
			tokenType: tokens.token_type || 'bearer',
			displayName: profile.displayName,
		},
		total_space: profile.totalSpace,
		used_space: profile.usedSpace,
		status: 'active',
	});

	await syncAccount(targetUserId, account).catch((error) => {
		console.warn('[yandex] initial sync failed:', error.message);
	});

	return { account, profile };
}
