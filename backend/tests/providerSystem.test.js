import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { db } from '../src/config/database.js';
import { listProviderConfigurations, getProviderConfiguration } from '../src/services/providerConfigService.js';
import { deleteProviderConfig } from '../src/services/providerAppConfigService.js';
import { listAccounts, upsertCloudAccount, deleteAccount, getAccountById } from '../src/services/accountService.js';
import { createGoogleAuthorizationRequest, completeGoogleAccountLink } from '../src/services/googleOAuthService.js';

describe('Centralized Provider System & Multi-Tenant Isolation Suite', () => {
	it('should register and discover all supported storage providers safely', () => {
		const providers = listProviderConfigurations();
		assert.equal(providers.length, 7);

		const expectedKeys = ['google_drive', 'onedrive', 'dropbox', 'mega', 's3', 'pcloud', 'yandex'];
		const keys = providers.map((p) => p.key);
		assert.deepEqual(keys.sort(), expectedKeys.sort());

		// Verify every provider object has safe attributes
		for (const provider of providers) {
			assert.ok(provider.key);
			assert.ok(provider.name);
			assert.ok(provider.authType);
			assert.equal(typeof provider.configured, 'boolean');
			assert.ok(['available', 'unconfigured', 'temporarily_unavailable'].includes(provider.status));
			assert.ok(Array.isArray(provider.capabilities));
		}
	});

	it('should classify OAuth vs Credential providers correctly', () => {
		const megaConfig = getProviderConfiguration('mega');
		assert.equal(megaConfig.authType, 'credential');
		assert.equal(megaConfig.configured, true);
		assert.equal(megaConfig.status, 'available');

		const s3Config = getProviderConfiguration('s3');
		assert.equal(s3Config.authType, 'credential');
		assert.equal(s3Config.configured, true);
		assert.equal(s3Config.status, 'available');

		const pcloudConfig = getProviderConfiguration('pcloud');
		assert.equal(pcloudConfig.authType, 'credential');
		assert.equal(pcloudConfig.configured, true);
		assert.equal(pcloudConfig.status, 'available');
	});

	it('should return safe user error and log structured error when unconfigured OAuth provider is invoked', () => {
		deleteProviderConfig('google_drive');
		delete process.env.GOOGLE_CLIENT_ID;
		delete process.env.GOOGLE_CLIENT_SECRET;
		assert.throws(
			() => createGoogleAuthorizationRequest('user-test-id'),
			(err) => {
				assert.match(err.message, /Google Drive is not configured/i);
				assert.equal(/GOOGLE_CLIENT_SECRET.*=/i.test(err.message), false);
				return true;
			}
		);
	});

	it('should enforce multi-tenant isolation across user accounts and token storage', () => {
		const userA = `saas-user-a-${randomUUID()}`;
		const userB = `saas-user-b-${randomUUID()}`;

		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userA, `${userA}@saas.com`);
		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userB, `${userB}@saas.com`);

		const accA = upsertCloudAccount({
			userId: userA,
			id: randomUUID(),
			email: 'alice@gmail.com',
			provider: 'google_drive',
			credentials: { accessToken: 'secret-a', refreshToken: 'refresh-a' },
			total_space: 15 * 1024 * 1024 * 1024,
			used_space: 1 * 1024 * 1024 * 1024,
			status: 'active',
		});

		const accB = upsertCloudAccount({
			userId: userB,
			id: randomUUID(),
			email: 'bob@outlook.com',
			provider: 'onedrive',
			credentials: { accessToken: 'secret-b', refreshToken: 'refresh-b' },
			total_space: 10 * 1024 * 1024 * 1024,
			used_space: 2 * 1024 * 1024 * 1024,
			status: 'active',
		});

		// 1. User A lists connections - must see accA and NOT accB
		const listA = listAccounts(userA);
		assert.equal(listA.length, 1);
		assert.equal(listA[0].email, 'alice@gmail.com');
		assert.equal(listA[0].encrypted_credentials, undefined);

		// 2. User B lists connections - must see accB and NOT accA
		const listB = listAccounts(userB);
		assert.equal(listB.length, 1);
		assert.equal(listB[0].email, 'bob@outlook.com');
		assert.equal(listB[0].encrypted_credentials, undefined);

		// 3. User B attempts unauthorized access to User A's connection
		const unauthorizedGet = getAccountById(userB, accA.id);
		assert.equal(unauthorizedGet, undefined);

		// 4. User B attempts to delete User A's connection
		deleteAccount(userB, accA.id);
		const checkAStillExists = getAccountById(userA, accA.id);
		assert.notEqual(checkAStillExists, undefined);
		assert.equal(checkAStillExists.id, accA.id);

		// Cleanup
		deleteAccount(userA, accA.id);
		deleteAccount(userB, accB.id);
		db.prepare("DELETE FROM users WHERE id IN (?, ?)").run(userA, userB);
	});
});
