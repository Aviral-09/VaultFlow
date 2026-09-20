import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../src/config/env.js';
import {
	getGoogleIntegrationStatus,
	createGoogleAuthorizationRequest,
	completeGoogleAccountLink,
} from '../src/services/googleOAuthService.js';

function restoreEnv(key, value) {
	if (value !== undefined) {
		process.env[key] = value;
	} else {
		delete process.env[key];
	}
}

describe('Google OAuth Integration & Config Suite', () => {
	it('should return correct integration status without exposing client secrets', () => {
		const status = getGoogleIntegrationStatus();
		assert.equal(typeof status.configured, 'boolean');
		assert.ok(status.redirectUri);
		assert.equal(status.clientSecret, undefined);
		assert.equal(status.googleClientSecret, undefined);
	});

	it('should throw clear unconfigured error when credentials are missing', () => {
		const originalId = process.env.GOOGLE_CLIENT_ID;
		const originalSecret = process.env.GOOGLE_CLIENT_SECRET;
		delete process.env.GOOGLE_CLIENT_ID;
		delete process.env.GOOGLE_CLIENT_SECRET;

		try {
			assert.throws(
				() => createGoogleAuthorizationRequest('test-user-id'),
				(err) => {
					assert.match(err.message, /Google Drive is not configured/i);
					return true;
				}
			);
		} finally {
			restoreEnv('GOOGLE_CLIENT_ID', originalId);
			restoreEnv('GOOGLE_CLIENT_SECRET', originalSecret);
		}
	});

	it('should generate valid authorization URL when credentials are provided', () => {
		const originalId = process.env.GOOGLE_CLIENT_ID;
		const originalSecret = process.env.GOOGLE_CLIENT_SECRET;
		process.env.GOOGLE_CLIENT_ID = 'dummy-client-id.apps.googleusercontent.com';
		process.env.GOOGLE_CLIENT_SECRET = 'dummy-client-secret';

		try {
			const req = createGoogleAuthorizationRequest('test-user-id');
			assert.ok(req.authorizationUrl);
			assert.ok(req.authorizationUrl.includes('accounts.google.com'));
			assert.ok(req.authorizationUrl.includes('dummy-client-id'));
			assert.ok(req.state);
			assert.equal(req.redirectUri, env.googleRedirectUri);
		} finally {
			restoreEnv('GOOGLE_CLIENT_ID', originalId);
			restoreEnv('GOOGLE_CLIENT_SECRET', originalSecret);
		}
	});

	it('should reject invalid or missing OAuth states on callback', async () => {
		await assert.rejects(
			completeGoogleAccountLink({ code: '', state: '' }),
			(err) => {
				assert.match(err.message, /Missing Google OAuth code or state/i);
				return true;
			}
		);

		await assert.rejects(
			completeGoogleAccountLink({ code: 'some-code', state: 'nonexistent-state' }),
			(err) => {
				assert.match(err.message, /Invalid or expired Google OAuth/i);
				return true;
			}
		);
	});
});
