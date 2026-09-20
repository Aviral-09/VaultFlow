import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { env } from '../src/config/env.js';
import { db } from '../src/config/database.js';
import {
	registerHostedUser,
	loginHostedUser,
	createSession,
	resolveSession,
	destroySession,
	getAuthSummary,
} from '../src/services/authService.js';

describe('Hosted Mode Authentication & Session Lifecycle Suite', () => {
	it('should support hosted user registration, duplicate detection, login, session persistence, and logout', () => {
		const originalAppMode = env.appMode;
		env.appMode = 'hosted';

		const testEmail = `hosted.user.${randomUUID()}@omnicloud.test`;
		const testPassword = 'StrongPassword123!';

		let userId = null;
		let sessionToken = null;

		try {
			// A. Register new user
			const newUser = registerHostedUser({ email: testEmail, password: testPassword });
			assert.ok(newUser.id);
			assert.equal(newUser.email, testEmail);
			userId = newUser.id;

			// B. Verify duplicate registration fails with clear error
			assert.throws(
				() => registerHostedUser({ email: testEmail, password: testPassword }),
				(err) => {
					assert.equal(err.message, 'Email is already registered');
					return true;
				}
			);

			// C. Login user
			const loggedInUser = loginHostedUser({ email: testEmail, password: testPassword });
			assert.equal(loggedInUser.id, userId);

			// D. Create session (cookie generation simulation)
			const session = createSession(userId);
			assert.ok(session.token);
			sessionToken = session.token;

			// E. Verify session resolution (GET /api/auth/me)
			const resolvedUser = resolveSession(sessionToken);
			assert.ok(resolvedUser);
			assert.equal(resolvedUser.id, userId);
			assert.equal(resolvedUser.email, testEmail);

			// F. Verify auth summary formatting
			const summary = getAuthSummary(resolvedUser);
			assert.equal(summary.mode, 'hosted');
			assert.equal(summary.requiresAuth, true);
			assert.equal(summary.authenticated, true);
			assert.equal(summary.user.email, testEmail);

			// G. Logout (destroy session)
			destroySession(sessionToken);
			const afterLogoutUser = resolveSession(sessionToken);
			assert.equal(afterLogoutUser, null);

			// H. Login again after logout
			const reloggedUser = loginHostedUser({ email: testEmail, password: testPassword });
			assert.equal(reloggedUser.id, userId);
			const newSession = createSession(userId);
			const reResolvedUser = resolveSession(newSession.token);
			assert.equal(reResolvedUser.id, userId);

			// Cleanup session
			destroySession(newSession.token);
		} finally {
			env.appMode = originalAppMode;
			if (userId) {
				db.prepare('DELETE FROM auth_sessions WHERE user_id = ?').run(userId);
				db.prepare('DELETE FROM users WHERE id = ?').run(userId);
			}
		}
	});

	it('should reject invalid password or non-existent email on login', () => {
		const originalAppMode = env.appMode;
		env.appMode = 'hosted';

		try {
			assert.throws(
				() => loginHostedUser({ email: 'nonexistent@omnicloud.test', password: 'password123' }),
				(err) => {
					assert.equal(err.message, 'Invalid email or password');
					return true;
				}
			);
		} finally {
			env.appMode = originalAppMode;
		}
	});
});
