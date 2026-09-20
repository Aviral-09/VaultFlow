import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { db } from '../src/config/database.js';
import {
	listAccounts,
	getAccountById,
	deleteAccount,
	upsertCloudAccount,
} from '../src/services/accountService.js';
import { createGoogleAuthorizationRequest, completeGoogleAccountLink } from '../src/services/googleOAuthService.js';
import { createOneDriveAuthorizationRequest } from '../src/services/oneDriveOAuthService.js';
import { createDropboxAuthorizationRequest } from '../src/services/dropboxOAuthService.js';
import { createYandexAuthorizationRequest } from '../src/services/yandexOAuthService.js';

describe('Cloud Accounts & OAuth Production Security Suite', () => {
	it('should return safe user error when Google OAuth credentials are not configured', () => {
		assert.throws(
			() => createGoogleAuthorizationRequest('test-user-1'),
			(err) => {
				assert.match(err.message, /Google Drive is not configured/i);
				assert.equal(/GOOGLE_CLIENT_SECRET.*=/i.test(err.message), false);
				return true;
			}
		);
	});

	it('should return safe user error when OneDrive OAuth credentials are not configured', () => {
		assert.throws(
			() => createOneDriveAuthorizationRequest('test-user-1'),
			(err) => {
				assert.match(err.message, /OneDrive is not configured for this (VaultFlow|OmniCloud) deployment\./);
				assert.equal(/ONEDRIVE_CLIENT_ID|\.env/i.test(err.message), false);
				return true;
			}
		);
	});

	it('should return safe user error when Dropbox OAuth credentials are not configured', () => {
		assert.throws(
			() => createDropboxAuthorizationRequest('test-user-1'),
			(err) => {
				assert.match(err.message, /Dropbox is not configured for this (VaultFlow|OmniCloud) deployment\./);
				assert.equal(/DROPBOX_CLIENT_ID|\.env/i.test(err.message), false);
				return true;
			}
		);
	});

	it('should return safe user error when Yandex OAuth credentials are not configured', () => {
		assert.throws(
			() => createYandexAuthorizationRequest('test-user-1'),
			(err) => {
				assert.match(err.message, /Yandex is not configured for this (VaultFlow|OmniCloud) deployment\./);
				assert.equal(/YANDEX_CLIENT_ID|\.env/i.test(err.message), false);
				return true;
			}
		);
	});

	it('should reject invalid or expired OAuth states on callback', async () => {
		await assert.rejects(
			completeGoogleAccountLink({ code: 'dummy-code', state: 'invalid-state-123' }),
			(err) => {
				assert.equal(err.message, 'Invalid or expired Google OAuth authorization request');
				return true;
			}
		);
	});

	it('should enforce multi-tenant isolation and never expose sensitive tokens in listAccounts', () => {
		const userA = `test-user-a-${randomUUID()}`;
		const userB = `test-user-b-${randomUUID()}`;

		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userA, `${userA}@test.com`);
		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userB, `${userB}@test.com`);

		const accountA = upsertCloudAccount({
			userId: userA,
			id: randomUUID(),
			email: 'usera@gmail.com',
			provider: 'google_drive',
			credentials: { accessToken: 'secret-token-a', refreshToken: 'secret-refresh-a' },
			total_space: 1000,
			used_space: 100,
			status: 'active',
		});

		const accountB = upsertCloudAccount({
			userId: userB,
			id: randomUUID(),
			email: 'userb@gmail.com',
			provider: 'google_drive',
			credentials: { accessToken: 'secret-token-b', refreshToken: 'secret-refresh-b' },
			total_space: 2000,
			used_space: 200,
			status: 'active',
		});

		// 1. User A lists accounts - must see accountA and NOT accountB
		const accountsUserA = listAccounts(userA);
		assert.equal(accountsUserA.length, 1);
		assert.equal(accountsUserA[0].id, accountA.id);
		assert.equal(accountsUserA[0].email, 'usera@gmail.com');

		// Verify tokens/credentials are stripped from listAccounts payload
		assert.equal(accountsUserA[0].encrypted_credentials, undefined);
		assert.equal(accountsUserA[0].accessToken, undefined);

		// 2. User A attempts to read User B's account by ID - must return undefined
		const unauthorizedGet = getAccountById(userA, accountB.id);
		assert.equal(unauthorizedGet, undefined);

		// 3. User A attempts to delete User B's account - must not affect User B
		deleteAccount(userA, accountB.id);
		const userBStillExists = getAccountById(userB, accountB.id);
		assert.notEqual(userBStillExists, undefined);
		assert.equal(userBStillExists.id, accountB.id);

		// Cleanup
		deleteAccount(userA, accountA.id);
		deleteAccount(userB, accountB.id);
		db.prepare("DELETE FROM users WHERE id IN (?, ?)").run(userA, userB);
	});
});
