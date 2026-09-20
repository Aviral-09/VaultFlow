import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { db } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { createUser } from '../src/services/userService.js';
import {
	getEffectiveGoogleOAuthCredentials,
	getSafeGoogleOAuthStatus,
	saveGoogleProviderConfig,
	testGoogleProviderConfig,
	deleteGoogleProviderConfig,
} from '../src/services/providerAppConfigService.js';
import { createGoogleAuthorizationRequest } from '../src/services/googleOAuthService.js';

function restoreEnv(key, value) {
	if (value !== undefined) {
		process.env[key] = value;
	} else {
		delete process.env[key];
	}
}

describe('In-App Google Drive Provider Setup & Security Suite', () => {
	it('should save encrypted Google provider credentials in SQLite and return safe status without secret leakage', () => {
		const dummyClientId = `admin-client-id-${randomUUID()}.apps.googleusercontent.com`;
		const dummySecret = `admin-secret-key-${randomUUID()}`;
		const dummyRedirect = 'https://omnicloud.example.com/api/accounts/google/callback';

		try {
			// 1. Save provider config
			const savedStatus = saveGoogleProviderConfig({
				clientId: dummyClientId,
				clientSecret: dummySecret,
				redirectUri: dummyRedirect,
			});

			assert.equal(savedStatus.configured, true);
			assert.equal(savedStatus.clientId, dummyClientId);
			assert.equal(savedStatus.redirectUri, dummyRedirect);
			assert.equal(savedStatus.hasClientSecret, true);
			assert.equal(savedStatus.source, 'database');
			assert.equal(savedStatus.status, 'available');
			assert.equal(savedStatus.clientSecret, undefined);
			assert.equal(savedStatus.encryptedSecret, undefined);

			// 2. Direct database inspection to ensure secret is NOT stored in plaintext
			const dbRow = db.prepare('SELECT * FROM provider_app_configs WHERE provider = ?').get('google_drive');
			assert.ok(dbRow);
			assert.equal(dbRow.client_id, dummyClientId);
			assert.notEqual(dbRow.encrypted_secret, dummySecret);
			assert.equal(dbRow.encrypted_secret.includes(dummySecret), false);

			// 3. Verify getEffectiveGoogleOAuthCredentials decrypts secret correctly on backend
			const effective = getEffectiveGoogleOAuthCredentials();
			assert.equal(effective.clientId, dummyClientId);
			assert.equal(effective.clientSecret, dummySecret);
			assert.equal(effective.redirectUri, dummyRedirect);
			assert.equal(effective.source, 'database');

			// 4. Verify getSafeGoogleOAuthStatus NEVER exposes secret
			const safe = getSafeGoogleOAuthStatus();
			assert.equal(safe.configured, true);
			assert.equal(safe.clientSecret, undefined);

			// 5. Verify OAuth authorization request uses DB credentials and custom redirect URI
			const authReq = createGoogleAuthorizationRequest('admin-user-id');
			assert.ok(authReq.authorizationUrl.includes(encodeURIComponent(dummyClientId)));
			assert.equal(authReq.redirectUri, dummyRedirect);
		} finally {
			deleteGoogleProviderConfig();
		}
	});

	it('should support testing Google provider configuration', () => {
		const testClientId = '123456789-test.apps.googleusercontent.com';
		const testSecret = 'secret-test-key-12345';
		const testRedirect = 'https://test.omnicloud.com/api/accounts/google/callback';

		const res = testGoogleProviderConfig({
			clientId: testClientId,
			clientSecret: testSecret,
			redirectUri: testRedirect,
		});

		assert.equal(res.success, true);
		assert.match(res.message, /verified successfully/i);
		assert.equal(res.redirectUri, testRedirect);
	});

	it('should fallback cleanly to environment variables when DB config is deleted', () => {
		const origId = process.env.GOOGLE_CLIENT_ID;
		const origSecret = process.env.GOOGLE_CLIENT_SECRET;

		try {
			process.env.GOOGLE_CLIENT_ID = 'env-client-id.apps.googleusercontent.com';
			process.env.GOOGLE_CLIENT_SECRET = 'env-client-secret-999';

			deleteGoogleProviderConfig();

			const effective = getEffectiveGoogleOAuthCredentials();
			assert.equal(effective.clientId, 'env-client-id.apps.googleusercontent.com');
			assert.equal(effective.clientSecret, 'env-client-secret-999');
			assert.equal(effective.source, 'environment');

			const status = getSafeGoogleOAuthStatus();
			assert.equal(status.configured, true);
			assert.equal(status.source, 'environment');
		} finally {
			restoreEnv('GOOGLE_CLIENT_ID', origId);
			restoreEnv('GOOGLE_CLIENT_SECRET', origSecret);
			deleteGoogleProviderConfig();
		}
	});

	it('should distinguish admin vs regular user roles accurately', () => {
		const adminUser = createUser({ email: `admin-${randomUUID()}@test.com`, passwordHash: 'hash', role: 'admin' });
		const regularUser = createUser({ email: `user-${randomUUID()}@test.com`, passwordHash: 'hash', role: 'user' });

		assert.equal(adminUser.role, 'admin');
		assert.equal(regularUser.role, 'user');

		db.prepare('DELETE FROM users WHERE id IN (?, ?)').run(adminUser.id, regularUser.id);
	});
});
