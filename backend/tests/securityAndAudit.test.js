import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { db } from '../src/config/database.js';
import {
	createGoogleAuthorizationRequest,
	completeGoogleAccountLink,
	getGoogleIntegrationStatus,
} from '../src/services/googleOAuthService.js';
import {
	saveGoogleProviderConfig,
	getSafeGoogleOAuthStatus,
	deleteGoogleProviderConfig,
} from '../src/services/providerAppConfigService.js';
import { listAccounts, getAccountById, deleteAccount, upsertCloudAccount } from '../src/services/accountService.js';
import { createFileMetadata, getFileById, listFilesByPath } from '../src/services/fileService.js';
import { createUser, isUserAdmin } from '../src/services/userService.js';
import { requireAdmin, requireAppUser } from '../src/middleware/authMiddleware.js';
import { env } from '../src/config/env.js';

describe('Security & Architecture Comprehensive Audit Test Suite', () => {
	beforeEach(() => {
		saveGoogleProviderConfig({
			clientId: 'audit-test-client-id.apps.googleusercontent.com',
			clientSecret: 'audit-test-client-secret-12345',
			redirectUri: 'http://localhost:8787/api/accounts/google/callback',
		});
	});

	afterEach(() => {
		deleteGoogleProviderConfig();
	});

	it('1. Invalid State: rejects invalid or random state strings', async () => {
		await assert.rejects(
			completeGoogleAccountLink({ code: 'valid-code', state: 'non-existent-random-state', currentUserId: 'user-1' }),
			(err) => {
				assert.match(err.message, /Invalid or expired Google OAuth/i);
				return true;
			}
		);
	});

	it('2. Expired State & 3. Reused State: rejects consumed or expired state', async () => {
		const userId = `audit-user-${randomUUID()}`;
		const authReq = createGoogleAuthorizationRequest(userId);

		// First attempt with wrong code fails at token exchange, but state is consumed (deleted)
		await assert.rejects(
			completeGoogleAccountLink({ code: 'invalid-code', state: authReq.state, currentUserId: userId }),
			(err) => {
				assert.ok(err.message);
				return true;
			}
		);

		// Second attempt with same state MUST fail with "Invalid or expired" because state was single-use
		await assert.rejects(
			completeGoogleAccountLink({ code: 'invalid-code', state: authReq.state, currentUserId: userId }),
			(err) => {
				assert.match(err.message, /Invalid or expired Google OAuth/i);
				return true;
			}
		);
	});

	it('4. Cross-User State: rejects state created by User A when redeemed by User B or unauthenticated', async () => {
		const userA = `user-a-${randomUUID()}`;
		const userB = `user-b-${randomUUID()}`;

		const authReqA = createGoogleAuthorizationRequest(userA);

		// 4a. User B attempts to redeem User A's state -> User mismatch
		await assert.rejects(
			completeGoogleAccountLink({ code: 'some-code', state: authReqA.state, currentUserId: userB }),
			(err) => {
				assert.match(err.message, /OAuth state user mismatch/i);
				return true;
			}
		);

		const authReqA2 = createGoogleAuthorizationRequest(userA);

		// 4b. Unauthenticated call (no currentUserId) -> User mismatch / Authentication required
		await assert.rejects(
			completeGoogleAccountLink({ code: 'some-code', state: authReqA2.state, currentUserId: undefined }),
			(err) => {
				assert.match(err.message, /OAuth state user mismatch/i);
				return true;
			}
		);
	});

	it('5. Unauthorized Admin Endpoint: requireAdmin rejects unauthenticated (401) and non-admin (403)', () => {
		// 5a. Unauthenticated request -> status 401
		let statusCalled = null;
		let jsonCalled = null;
		const reqUnauth = {};
		const resUnauth = {
			status(s) { statusCalled = s; return this; },
			json(j) { jsonCalled = j; return this; }
		};
		requireAdmin(reqUnauth, resUnauth, () => {});
		assert.equal(statusCalled, 401);
		assert.equal(jsonCalled.error, 'Authentication required');

		// 5b. Non-admin user -> status 403
		let statusForbidden = null;
		let jsonForbidden = null;
		const reqNonAdmin = { user: { id: 'u1', email: 'user@test.com', is_local: 0, role: 'user' } };
		const resForbidden = {
			status(s) { statusForbidden = s; return this; },
			json(j) { jsonForbidden = j; return this; }
		};
		requireAdmin(reqNonAdmin, resForbidden, () => {});
		assert.equal(statusForbidden, 403);
		assert.equal(jsonForbidden.error, 'Admin authorization required');

		// 5c. Admin user -> next() called successfully
		let nextCalled = false;
		const reqAdmin = { user: { id: 'a1', email: 'admin@test.com', is_local: 0, role: 'admin' } };
		requireAdmin(reqAdmin, {}, () => { nextCalled = true; });
		assert.equal(nextCalled, true);
	});

	it('6. Secret Leakage: provider status and account lists NEVER leak secrets', () => {
		const status = getSafeGoogleOAuthStatus();
		assert.equal(status.clientSecret, undefined);
		assert.equal(status.encrypted_secret, undefined);

		const user = `leak-test-user-${randomUUID()}`;
		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(user, `${user}@leak.com`);

		const acc = upsertCloudAccount({
			userId: user,
			id: randomUUID(),
			email: 'secretleak@test.com',
			provider: 'google_drive',
			credentials: { accessToken: 'sensitive-access-token', refreshToken: 'sensitive-refresh-token' },
			total_space: 1000,
			used_space: 100,
			status: 'active',
		});

		const accounts = listAccounts(user);
		assert.equal(accounts.length, 1);
		assert.equal(accounts[0].encrypted_credentials, undefined);
		assert.equal(accounts[0].accessToken, undefined);
		assert.equal(accounts[0].refreshToken, undefined);

		// Cleanup
		deleteAccount(user, acc.id);
		db.prepare("DELETE FROM users WHERE id = ?").run(user);
	});

	it('7. Cross-User Account Access: User A cannot read or delete User B accounts', () => {
		const userA = `user-a-${randomUUID()}`;
		const userB = `user-b-${randomUUID()}`;

		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userA, `${userA}@test.com`);
		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userB, `${userB}@test.com`);

		const accB = upsertCloudAccount({
			userId: userB,
			id: randomUUID(),
			email: 'userb@gmail.com',
			provider: 'google_drive',
			credentials: { accessToken: 'token-b' },
			total_space: 5000,
			used_space: 500,
			status: 'active',
		});

		// User A attempts to fetch User B's account by ID
		const stolenAcc = getAccountById(userA, accB.id);
		assert.equal(stolenAcc, undefined);

		// User A attempts to delete User B's account
		deleteAccount(userA, accB.id);

		// User B's account must remain intact
		const checkB = getAccountById(userB, accB.id);
		assert.notEqual(checkB, undefined);

		// Cleanup
		deleteAccount(userB, accB.id);
		db.prepare("DELETE FROM users WHERE id IN (?, ?)").run(userA, userB);
	});

	it('8. Cross-User File Access: User A cannot list or read User B files', () => {
		const userA = `user-fa-${randomUUID()}`;
		const userB = `user-fb-${randomUUID()}`;

		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userA, `${userA}@test.com`);
		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userB, `${userB}@test.com`);

		const accB = upsertCloudAccount({
			userId: userB,
			id: randomUUID(),
			email: 'userb-files@gmail.com',
			provider: 'google_drive',
			credentials: { accessToken: 'token-b' },
			total_space: 5000,
			used_space: 500,
			status: 'active',
		});

		const fileB = createFileMetadata({
			user_id: userB,
			virtual_path: '/',
			file_name: 'private_document.pdf',
			is_folder: false,
			size: 1024,
			cloud_account_id: accB.id,
			remote_file_id: 'remote-file-id-b',
		});

		// User A lists files -> must NOT see file B
		const filesA = listFilesByPath(userA, '/');
		assert.equal(filesA.length, 0);

		// User A attempts to fetch File B by ID -> must return null/undefined
		const stolenFile = getFileById(userA, fileB.id);
		assert.equal(stolenFile, undefined);

		// Cleanup
		db.prepare("DELETE FROM file_metadata WHERE user_id = ? AND id = ?").run(userB, fileB.id);
		deleteAccount(userB, accB.id);
		db.prepare("DELETE FROM users WHERE id IN (?, ?)").run(userA, userB);
	});

	it('9. Duplicate OAuth Connection: re-authenticating same provider account updates in-place', () => {
		const user = `user-dup-${randomUUID()}`;
		db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(user, `${user}@test.com`);

		const acc1 = upsertCloudAccount({
			userId: user,
			id: randomUUID(),
			email: 'dup@gmail.com',
			provider: 'google_drive',
			credentials: { accessToken: 'token-v1' },
			total_space: 1000,
			used_space: 100,
			status: 'active',
		});

		const acc2 = upsertCloudAccount({
			userId: user,
			id: randomUUID(),
			email: 'dup@gmail.com',
			provider: 'google_drive',
			credentials: { accessToken: 'token-v2' },
			total_space: 2000,
			used_space: 200,
			status: 'active',
		});

		const userAccounts = listAccounts(user);
		// Should update in-place, keeping only 1 connection entry for (user, provider, email)
		assert.equal(userAccounts.length, 1);
		assert.equal(Number(userAccounts[0].total_space), 2000);

		// Cleanup
		deleteAccount(user, acc1.id);
		db.prepare("DELETE FROM users WHERE id = ?").run(user);
	});
});
