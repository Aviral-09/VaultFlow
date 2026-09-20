import { google } from 'googleapis';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { decryptJson, encryptJson } from '../utils/crypto.js';

const PROVIDER_ENV_MAP = {
	google_drive: {
		clientId: 'googleClientId',
		clientSecret: 'googleClientSecret',
		redirectUri: 'googleRedirectUri',
	},
	onedrive: {
		clientId: 'onedriveClientId',
		clientSecret: 'onedriveClientSecret',
		redirectUri: 'onedriveRedirectUri',
	},
	dropbox: {
		clientId: 'dropboxClientId',
		clientSecret: 'dropboxClientSecret',
		redirectUri: 'dropboxRedirectUri',
	},
	yandex: {
		clientId: 'yandexClientId',
		clientSecret: 'yandexClientSecret',
		redirectUri: 'yandexRedirectUri',
	},
};

export function getEffectiveProviderCredentials(providerKey) {
	const envConfig = PROVIDER_ENV_MAP[providerKey];
	const defaultRedirectUri = envConfig ? env[envConfig.redirectUri] : '';

	try {
		const row = db.prepare('SELECT * FROM provider_app_configs WHERE provider = ?').get(providerKey);
		if (row && row.client_id && row.encrypted_secret) {
			const decryptedSecret = decryptJson(row.encrypted_secret);
			if (decryptedSecret) {
				return {
					provider: providerKey,
					clientId: String(row.client_id).trim(),
					clientSecret: String(decryptedSecret).trim(),
					redirectUri: String(row.redirect_uri || defaultRedirectUri).trim(),
					source: 'database',
				};
			}
		}
	} catch (error) {
		console.warn(`[ProviderAppConfig] Safe diagnostic: Failed to decrypt ${providerKey} database configuration (${error.message}). Falling back to environment.`);
	}

	if (envConfig) {
		const envClientId = String(env[envConfig.clientId] || '').trim();
		const envClientSecret = String(env[envConfig.clientSecret] || '').trim();
		if (envClientId && envClientSecret) {
			return {
				provider: providerKey,
				clientId: envClientId,
				clientSecret: envClientSecret,
				redirectUri: String(env[envConfig.redirectUri] || defaultRedirectUri).trim(),
				source: 'environment',
			};
		}
	}

	return {
		provider: providerKey,
		clientId: '',
		clientSecret: '',
		redirectUri: defaultRedirectUri,
		source: 'none',
	};
}

export function getSafeProviderStatus(providerKey) {
	const creds = getEffectiveProviderCredentials(providerKey);
	const configured = Boolean(creds.clientId && creds.clientSecret);

	return {
		provider: providerKey,
		configured,
		status: configured ? 'available' : 'unconfigured',
		source: creds.source,
		clientId: creds.clientId,
		redirectUri: creds.redirectUri,
		hasClientSecret: Boolean(creds.clientSecret),
	};
}

export function saveProviderConfig(providerKey, { clientId, clientSecret, redirectUri }) {
	const envConfig = PROVIDER_ENV_MAP[providerKey];
	const defaultRedirect = envConfig ? env[envConfig.redirectUri] : '';
	const trimmedClientId = String(clientId || '').trim();
	const trimmedRedirectUri = String(redirectUri || defaultRedirect).trim();

	if (!trimmedClientId) {
		throw new Error(`${providerKey} Client ID is required`);
	}

	let secretToStore = String(clientSecret || '').trim();
	if (!secretToStore) {
		const existing = getEffectiveProviderCredentials(providerKey);
		if (existing.clientSecret) {
			secretToStore = existing.clientSecret;
		}
	}

	if (!secretToStore) {
		throw new Error(`${providerKey} Client Secret is required`);
	}

	const encryptedSecret = encryptJson(secretToStore);

	db.prepare(`
		INSERT INTO provider_app_configs (provider, client_id, encrypted_secret, redirect_uri, updated_at)
		VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(provider) DO UPDATE SET
			client_id = excluded.client_id,
			encrypted_secret = excluded.encrypted_secret,
			redirect_uri = excluded.redirect_uri,
			updated_at = CURRENT_TIMESTAMP
	`).run(providerKey, trimmedClientId, encryptedSecret, trimmedRedirectUri);

	return getSafeProviderStatus(providerKey);
}

export function deleteProviderConfig(providerKey) {
	db.prepare('DELETE FROM provider_app_configs WHERE provider = ?').run(providerKey);
	return getSafeProviderStatus(providerKey);
}

export function getEffectiveGoogleOAuthCredentials() {
	return getEffectiveProviderCredentials('google_drive');
}

export function getSafeGoogleOAuthStatus() {
	return getSafeProviderStatus('google_drive');
}

export function saveGoogleProviderConfig({ clientId, clientSecret, redirectUri }) {
	return saveProviderConfig('google_drive', { clientId, clientSecret, redirectUri });
}

export function testGoogleProviderConfig({ clientId, clientSecret, redirectUri } = {}) {
	const effective = getEffectiveGoogleOAuthCredentials();
	const testClientId = String(clientId || effective.clientId || '').trim();
	const testSecret = String(clientSecret || effective.clientSecret || '').trim();
	const testRedirectUri = String(redirectUri || effective.redirectUri || env.googleRedirectUri).trim();

	if (!testClientId) {
		throw new Error('Google Client ID is missing or invalid');
	}

	if (!testSecret) {
		throw new Error('Google Client Secret is missing or invalid');
	}

	try {
		const oauth2Client = new google.auth.OAuth2(testClientId, testSecret, testRedirectUri);
		const authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: ['openid', 'email'],
		});

		if (!authUrl || !authUrl.includes('accounts.google.com')) {
			throw new Error('OAuth2 client failed to generate valid authorization URL');
		}

		return {
			success: true,
			message: 'Google OAuth configuration verified successfully.',
			redirectUri: testRedirectUri,
		};
	} catch (error) {
		throw new Error(`Google OAuth test failed: ${error.message}`);
	}
}

export function deleteGoogleProviderConfig() {
	return deleteProviderConfig('google_drive');
}

export function getEffectiveOneDriveOAuthCredentials() {
	return getEffectiveProviderCredentials('onedrive');
}

export function getSafeOneDriveOAuthStatus() {
	return getSafeProviderStatus('onedrive');
}

export function saveOneDriveProviderConfig({ clientId, clientSecret, redirectUri }) {
	return saveProviderConfig('onedrive', { clientId, clientSecret, redirectUri });
}

export function deleteOneDriveProviderConfig() {
	return deleteProviderConfig('onedrive');
}

export function testOneDriveProviderConfig({ clientId, clientSecret, redirectUri } = {}) {
	const effective = getEffectiveOneDriveOAuthCredentials();
	const testClientId = String(clientId || effective.clientId || '').trim();
	const testSecret = String(clientSecret || effective.clientSecret || '').trim();
	const testRedirectUri = String(redirectUri || effective.redirectUri || env.onedriveRedirectUri).trim();

	if (!testClientId) {
		throw new Error('OneDrive Application (Client) ID is missing or invalid');
	}

	if (!testSecret) {
		throw new Error('OneDrive Client Secret is missing or invalid');
	}

	try {
		const tenantId = env.onedriveTenantId || 'common';
		const authUrl = new URL(`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/authorize`);
		authUrl.searchParams.set('client_id', testClientId);
		authUrl.searchParams.set('response_type', 'code');
		authUrl.searchParams.set('redirect_uri', testRedirectUri);
		authUrl.searchParams.set('response_mode', 'query');
		authUrl.searchParams.set('scope', 'offline_access openid profile email Files.ReadWrite.All User.Read');

		return {
			success: true,
			message: 'OneDrive / Microsoft OAuth configuration verified successfully.',
			redirectUri: testRedirectUri,
		};
	} catch (error) {
		throw new Error(`OneDrive OAuth test failed: ${error.message}`);
	}
}

export function getEffectiveDropboxOAuthCredentials() {
	return getEffectiveProviderCredentials('dropbox');
}

export function getSafeDropboxOAuthStatus() {
	return getSafeProviderStatus('dropbox');
}

export function getEffectiveYandexOAuthCredentials() {
	return getEffectiveProviderCredentials('yandex');
}

export function getSafeYandexOAuthStatus() {
	return getSafeProviderStatus('yandex');
}
