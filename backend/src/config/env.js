import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const rawEncryptionSecret =
	process.env.OMNICLOUD_ENCRYPTION_KEY ||
	process.env.OMNICLOUD_SECRET_HALF ||
	'omnicloud-dev-stable-encryption-key';

const encryptionKey = crypto
	.createHash('sha256')
	.update(String(rawEncryptionSecret).trim())
	.digest();

const port = Number(process.env.PORT || 8787);
const defaultApiUrl = process.env.API_URL || `http://localhost:${port}/api`;

export const env = {
	port,
	appMode: process.env.APP_MODE === 'hosted' ? 'hosted' : 'local',
	corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
	syncIntervalMinutes: Number(process.env.SYNC_INTERVAL_MINUTES || 5),
	authCookieName: process.env.AUTH_COOKIE_NAME || 'omnicloud_session',
	authSessionTtlHours: Number(process.env.AUTH_SESSION_TTL_HOURS || 24 * 14),
	authSecret: process.env.AUTH_SECRET || process.env.OMNICLOUD_SECRET_HALF || 'omnicloud-dev-auth-secret',
	encryptionKey,
	frontendUrl: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
	apiUrl: defaultApiUrl,
	get googleClientId() { return String(process.env.GOOGLE_CLIENT_ID || '').trim(); },
	get googleClientSecret() { return String(process.env.GOOGLE_CLIENT_SECRET || '').trim(); },
	get googleRedirectUri() { return String(process.env.GOOGLE_REDIRECT_URI || '').trim() || `${defaultApiUrl}/accounts/google/callback`; },
	get onedriveClientId() { return String(process.env.ONEDRIVE_CLIENT_ID || '').trim(); },
	get onedriveClientSecret() { return String(process.env.ONEDRIVE_CLIENT_SECRET || '').trim(); },
	onedriveTenantId: String(process.env.ONEDRIVE_TENANT_ID || 'common').trim(),
	get onedriveRedirectUri() { return String(process.env.ONEDRIVE_REDIRECT_URI || '').trim() || `${defaultApiUrl}/accounts/onedrive/callback`; },
	get dropboxClientId() { return String(process.env.DROPBOX_CLIENT_ID || '').trim(); },
	get dropboxClientSecret() { return String(process.env.DROPBOX_CLIENT_SECRET || '').trim(); },
	get dropboxRedirectUri() { return String(process.env.DROPBOX_REDIRECT_URI || '').trim() || `${defaultApiUrl}/accounts/dropbox/callback`; },
	get yandexClientId() { return String(process.env.YANDEX_CLIENT_ID || '').trim(); },
	get yandexClientSecret() { return String(process.env.YANDEX_CLIENT_SECRET || '').trim(); },
	get yandexRedirectUri() { return String(process.env.YANDEX_REDIRECT_URI || '').trim() || `${defaultApiUrl}/accounts/yandex/callback`; },
};

export function redactEnv() {
	return {
		port: env.port,
		appMode: env.appMode,
		corsOrigin: env.corsOrigin,
		syncIntervalMinutes: env.syncIntervalMinutes,
		authCookieName: env.authCookieName,
		authSessionTtlHours: env.authSessionTtlHours,
		frontendUrl: env.frontendUrl,
		encryptionKeyConfigured: Boolean(process.env.OMNICLOUD_ENCRYPTION_KEY || process.env.OMNICLOUD_SECRET_HALF),
		googleClientId: env.googleClientId ? '[configured]' : '[missing]',
		googleRedirectUri: env.googleRedirectUri,
		onedriveClientId: env.onedriveClientId ? '[configured]' : '[missing]',
		onedriveTenantId: env.onedriveTenantId,
		onedriveRedirectUri: env.onedriveRedirectUri,
		dropboxClientId: env.dropboxClientId ? '[configured]' : '[missing]',
		dropboxRedirectUri: env.dropboxRedirectUri,
		yandexClientId: env.yandexClientId ? '[configured]' : '[missing]',
		yandexRedirectUri: env.yandexRedirectUri,
	};
}
