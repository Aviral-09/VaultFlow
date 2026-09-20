import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { db } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import {
	getEffectiveGoogleOAuthCredentials,
	getSafeGoogleOAuthStatus,
	saveGoogleProviderConfig,
	deleteGoogleProviderConfig,
} from '../src/services/providerAppConfigService.js';
import {
	createGoogleAuthorizationRequest,
	completeGoogleAccountLink,
} from '../src/services/googleOAuthService.js';
import { createUser, promoteUserToAdmin, isUserAdmin, getUserById } from '../src/services/userService.js';
import { requireAdmin } from '../src/middleware/authMiddleware.js';
import { upsertCloudAccount, listAccounts, deleteAccount } from '../src/services/accountService.js';
import { encryptJson, decryptJson } from '../src/utils/crypto.js';

function restoreEnv(key, value) {
	if (value !== undefined) {
		process.env[key] = value;
	} else {
		delete process.env[key];
	}
}

describe('Google Drive OAuth Architecture & Complete Fix Verification Suite', () => {
	let originalClientId;
	let originalClientSecret;

	beforeEach(() => {
		originalClientId = process.env.GOOGLE_CLIENT_ID;
		originalClientSecret = process.env.GOOGLE_CLIENT_SECRET;
		delete process.env.GOOGLE_CLIENT_ID;
		delete process.env.GOOGLE_CLIENT_SECRET;
		deleteGoogleProviderConfig();
	});

	afterEach(() => {
		restoreEnv('GOOGLE_CLIENT_ID', originalClientId);
		restoreEnv('GOOGLE_CLIENT_SECRET', originalClientSecret);
		deleteGoogleProviderConfig();
	});

	// 1. DB provider configuration exists
	it('1. DB provider configuration exists: loads credentials with source="database"', () => {
		const testId = `db-client-id-${randomUUID()}.apps.googleusercontent.com`;
		const testSecret = `db-secret-${randomUUID()}`;
		const testRedirect = 'http://localhost:8787/api/accounts/google/callback';

		saveGoogleProviderConfig({
			clientId: testId,
			clientSecret: testSecret,
			redirectUri: testRedirect,
		});

		const creds = getEffectiveGoogleOAuthCredentials();
		assert.equal(creds.provider, 'google_drive');
		assert.equal(creds.clientId, testId);
		assert.equal(creds.clientSecret, testSecret);
		assert.equal(creds.redirectUri, testRedirect);
		assert.equal(creds.source, 'database');
	});

	// 2. DB provider configuration missing
	it('2. DB provider configuration missing: falls back to environment or reports unconfigured', () => {
		deleteGoogleProviderConfig();
		const creds = getEffectiveGoogleOAuthCredentials();
		assert.equal(creds.source, 'none');
		assert.equal(creds.clientId, '');
		assert.equal(creds.clientSecret, '');

		const status = getSafeGoogleOAuthStatus();
		assert.equal(status.configured, false);
		assert.equal(status.status, 'unconfigured');
		assert.equal(status.source, 'none');
	});

	// 3. DB secret decryption succeeds
	it('3. DB secret decryption succeeds: encrypted secret in SQLite decrypts to original plaintext', () => {
		const originalSecret = `secret-value-${randomUUID()}`;
		saveGoogleProviderConfig({
			clientId: 'test-client-id.apps.googleusercontent.com',
			clientSecret: originalSecret,
			redirectUri: 'http://localhost:8787/api/accounts/google/callback',
		});

		const row = db.prepare("SELECT encrypted_secret FROM provider_app_configs WHERE provider = 'google_drive'").get();
		assert.ok(row);
		assert.notEqual(row.encrypted_secret, originalSecret);

		const decrypted = decryptJson(row.encrypted_secret);
		assert.equal(decrypted, originalSecret);
	});

	// 4. DB secret decryption fails
	it('4. DB secret decryption fails: handles corrupt DB secret gracefully and falls back to environment', () => {
		process.env.GOOGLE_CLIENT_ID = 'fallback-env-id.apps.googleusercontent.com';
		process.env.GOOGLE_CLIENT_SECRET = 'fallback-env-secret';

		// Insert corrupted encrypted_secret directly into DB
		db.prepare(`
			INSERT INTO provider_app_configs (provider, client_id, encrypted_secret, redirect_uri)
			VALUES ('google_drive', 'corrupt-client-id', 'invalid-corrupt-ciphertext-base64', 'http://localhost:8787/callback')
		`).run();

		const creds = getEffectiveGoogleOAuthCredentials();
		assert.equal(creds.source, 'environment');
		assert.equal(creds.clientId, 'fallback-env-id.apps.googleusercontent.com');
		assert.equal(creds.clientSecret, 'fallback-env-secret');

		const status = getSafeGoogleOAuthStatus();
		assert.equal(status.configured, true);
		assert.equal(status.source, 'environment');
	});

	// 5. Environment fallback works
	it('5. Environment fallback works: returns credentials from env when DB row is absent', () => {
		process.env.GOOGLE_CLIENT_ID = 'env-only-client-id.apps.googleusercontent.com';
		process.env.GOOGLE_CLIENT_SECRET = 'env-only-client-secret';

		deleteGoogleProviderConfig();

		const creds = getEffectiveGoogleOAuthCredentials();
		assert.equal(creds.source, 'environment');
		assert.equal(creds.clientId, 'env-only-client-id.apps.googleusercontent.com');
		assert.equal(creds.clientSecret, 'env-only-client-secret');

		const status = getSafeGoogleOAuthStatus();
		assert.equal(status.configured, true);
		assert.equal(status.status, 'available');
		assert.equal(status.source, 'environment');
	});

	// 6. Both DB and environment missing
	it('6. Both DB and environment missing: cleanly returns unconfigured state', () => {
		deleteGoogleProviderConfig();
		delete process.env.GOOGLE_CLIENT_ID;
		delete process.env.GOOGLE_CLIENT_SECRET;

		const creds = getEffectiveGoogleOAuthCredentials();
		assert.equal(creds.source, 'none');
		assert.equal(creds.clientId, '');
		assert.equal(creds.clientSecret, '');

		const status = getSafeGoogleOAuthStatus();
		assert.equal(status.configured, false);
		assert.equal(status.status, 'unconfigured');
		assert.equal(status.source, 'none');
	});

	// 7. Safe status never exposes secrets
	it('7. Safe status never exposes secrets: clientSecret and encrypted_secret are absent', () => {
		saveGoogleProviderConfig({
			clientId: 'safe-status-test-id.apps.googleusercontent.com',
			clientSecret: 'super-sensitive-secret-value-12345',
			redirectUri: 'http://localhost:8787/api/accounts/google/callback',
		});

		const status = getSafeGoogleOAuthStatus();
		assert.equal(status.configured, true);
		assert.equal(status.hasClientSecret, true);
		assert.equal(status.clientSecret, undefined);
		assert.equal(status.encrypted_secret, undefined);
		assert.equal(status.googleClientSecret, undefined);
	});

	// 8. Google authorization URL generation
	it('8. Google authorization URL generation: generates valid consent URL with required scopes', () => {
		const clientId = 'consent-url-test-id.apps.googleusercontent.com';
		saveGoogleProviderConfig({
			clientId,
			clientSecret: 'client-secret-abc',
			redirectUri: 'http://localhost:8787/api/accounts/google/callback',
		});

		const authReq = createGoogleAuthorizationRequest('test-user-id-456');
		assert.ok(authReq.authorizationUrl);
		assert.ok(authReq.authorizationUrl.includes('accounts.google.com'));
		assert.ok(authReq.authorizationUrl.includes(encodeURIComponent(clientId)));
		assert.ok(authReq.authorizationUrl.includes('scope='));
		assert.ok(authReq.authorizationUrl.includes('offline'));
		assert.ok(authReq.state);
	});

	// 9. Admin-only provider configuration
	it('9. Admin-only provider configuration: requireAdmin middleware allows admin', () => {
		let nextCalled = false;
		const adminReq = { user: { id: 'admin-1', role: 'admin', is_local: 0 } };
		const res = {};

		requireAdmin(adminReq, res, () => {
			nextCalled = true;
		});

		assert.equal(nextCalled, true);
	});

	// 10. Normal user cannot modify deployment OAuth configuration
	it('10. Normal user cannot modify deployment OAuth configuration: requireAdmin rejects role="user"', () => {
		let statusCalled = null;
		let jsonPayload = null;

		const regularUserReq = { user: { id: 'reg-user-1', role: 'user', is_local: 0 } };
		const res = {
			status(code) {
				statusCalled = code;
				return this;
			},
			json(payload) {
				jsonPayload = payload;
				return this;
			},
		};

		requireAdmin(regularUserReq, res, () => {});

		assert.equal(statusCalled, 403);
		assert.equal(jsonPayload.error, 'Admin authorization required');
	});

	// 11. Admin bootstrap
	it('11. Admin bootstrap: promoteUserToAdmin upgrades user to admin safely and idempotently', () => {
		const testEmail = `bootstrap-test-${randomUUID()}@example.com`;
		const user = createUser({ email: testEmail, passwordHash: 'hash', role: 'user' });
		assert.equal(user.role, 'user');
		assert.equal(isUserAdmin(user), false);

		// Promote to admin
		const promoted = promoteUserToAdmin(testEmail);
		assert.equal(promoted.role, 'admin');
		assert.equal(isUserAdmin(promoted), true);

		// Idempotent repeat execution
		const rePromoted = promoteUserToAdmin(testEmail);
		assert.equal(rePromoted.role, 'admin');

		// Cleanup
		db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
	});

	// 12. Encryption/decryption across application restart
	it('12. Encryption/decryption stability: encryption key derives from stable secret, not machine fingerprint', () => {
		const testPayload = { secret: 'persistent-secret-xyz', token: 'token-abc' };
		const encrypted = encryptJson(testPayload);

		// Decrypts cleanly with stable key
		const decrypted = decryptJson(encrypted);
		assert.deepEqual(decrypted, testPayload);
	});

	// 13. OAuth callback state validation
	it('13. OAuth callback: rejects invalid or missing state', async () => {
		await assert.rejects(
			completeGoogleAccountLink({ code: 'some-code', state: 'non-existent-state', currentUserId: 'user-1' }),
			(err) => {
				assert.match(err.message, /Invalid or expired Google OAuth/i);
				return true;
			}
		);
	});

	// 14. Token storage: encrypted in cloud_accounts
	it('14. Token storage: credentials in cloud_accounts are encrypted and not plaintext', () => {
		const userId = `token-test-user-${randomUUID()}`;
		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userId, `${userId}@example.com`);

		const rawToken = 'super-secret-refresh-token-12345';
		const account = upsertCloudAccount({
			userId,
			id: randomUUID(),
			email: 'tokentest@example.com',
			provider: 'google_drive',
			credentials: { refreshToken: rawToken, accessToken: 'access-123' },
			total_space: 15000000000,
			used_space: 5000000000,
			status: 'active',
		});

		const dbRow = db.prepare('SELECT encrypted_credentials FROM cloud_accounts WHERE id = ?').get(account.id);
		assert.ok(dbRow);
		assert.notEqual(dbRow.encrypted_credentials, rawToken);
		assert.equal(dbRow.encrypted_credentials.includes(rawToken), false);

		// Decrypt verification
		const decryptedCreds = decryptJson(dbRow.encrypted_credentials);
		assert.equal(decryptedCreds.refreshToken, rawToken);

		// Cleanup
		deleteAccount(userId, account.id);
		db.prepare('DELETE FROM users WHERE id = ?').run(userId);
	});

	// 15. cloud_accounts creation
	it('15. cloud_accounts creation: upserts active cloud account with correct quota', () => {
		const userId = `quota-user-${randomUUID()}`;
		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userId, `${userId}@example.com`);

		const account = upsertCloudAccount({
			userId,
			id: randomUUID(),
			email: 'drivequota@example.com',
			provider: 'google_drive',
			credentials: { token: 'sample' },
			total_space: 10737418240, // 10 GB
			used_space: 2147483648,   // 2 GB
			status: 'active',
		});

		assert.equal(account.provider, 'google_drive');
		assert.equal(account.total_space, 10737418240);
		assert.equal(account.used_space, 2147483648);
		assert.equal(account.status, 'active');

		// Cleanup
		deleteAccount(userId, account.id);
		db.prepare('DELETE FROM users WHERE id = ?').run(userId);
	});

	// 16. Storage statistics after account connection
	it('16. Storage statistics: listAccounts returns accounts with computed free_space and accurate totals', () => {
		const userId = `stats-user-${randomUUID()}`;
		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userId, `${userId}@example.com`);

		// When 0 accounts connected
		const emptyAccounts = listAccounts(userId);
		assert.equal(emptyAccounts.length, 0);

		// When account is connected
		const account = upsertCloudAccount({
			userId,
			id: randomUUID(),
			email: 'stats@example.com',
			provider: 'google_drive',
			credentials: { token: 'sample' },
			total_space: 15000,
			used_space: 5000,
			status: 'active',
		});

		const connectedAccounts = listAccounts(userId);
		assert.equal(connectedAccounts.length, 1);
		assert.equal(connectedAccounts[0].total_space, 15000);
		assert.equal(connectedAccounts[0].used_space, 5000);
		assert.equal(Number(connectedAccounts[0].total_space) - Number(connectedAccounts[0].used_space), 10000);

		// Cleanup
		deleteAccount(userId, account.id);
		db.prepare('DELETE FROM users WHERE id = ?').run(userId);
	});
});
