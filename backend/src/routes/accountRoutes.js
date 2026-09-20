import { Router } from 'express';
import { deleteAccount, getAccountById, listAccounts } from '../services/accountService.js';
import { env } from '../config/env.js';
import { requireAppUser } from '../middleware/authMiddleware.js';
import {
	createGoogleAuthorizationRequest,
	completeGoogleAccountLink,
	getGoogleIntegrationStatus,
} from '../services/googleOAuthService.js';
import {
	createOneDriveAuthorizationRequest,
	completeOneDriveAccountLink,
	getOneDriveIntegrationStatus,
} from '../services/oneDriveOAuthService.js';
import {
	createDropboxAuthorizationRequest,
	completeDropboxAccountLink,
	getDropboxIntegrationStatus,
} from '../services/dropboxOAuthService.js';
import { connectMegaAccount, getMegaIntegrationStatus } from '../services/megaAccountService.js';
import {
	createYandexAuthorizationRequest,
	completeYandexAccountLink,
	getYandexIntegrationStatus,
} from '../services/yandexOAuthService.js';
import {
	connectS3Account,
	connectPCloudAccount,
} from '../services/externalAccountService.js';
import { listProviderConfigurations, getProviderConfiguration } from '../services/providerConfigService.js';
import { clearFilesForAccount } from '../services/fileService.js';

const router = Router();

router.use(requireAppUser);

const handleListAccounts = (req, res) => {
	const accounts = listAccounts(req.user.id).map((account) => ({
		...account,
		free_space: Number(account.total_space) - Number(account.used_space),
	}));

	res.json({ data: accounts });
};

router.get('/accounts', handleListAccounts);
router.get('/storage/connections', handleListAccounts);

const handleListProviders = (_req, res) => {
	res.json({ data: listProviderConfigurations() });
};

router.get('/accounts/providers', handleListProviders);
router.get('/storage/providers', handleListProviders);

router.get('/accounts/google/status', (_req, res) => {
	res.json({ data: getGoogleIntegrationStatus() });
});

router.get('/accounts/onedrive/status', (_req, res) => {
	res.json({ data: getOneDriveIntegrationStatus() });
});

router.get('/accounts/dropbox/status', (_req, res) => {
	res.json({ data: getDropboxIntegrationStatus() });
});

router.get('/accounts/yandex/status', (_req, res) => {
	res.json({ data: getYandexIntegrationStatus() });
});

router.get('/accounts/mega/status', (_req, res) => {
	res.json({ data: getMegaIntegrationStatus() });
});

router.get('/accounts/google/connect', (req, res, next) => {
	try {
		const data = createGoogleAuthorizationRequest(req.user.id);
		res.json({ data: { ...data, url: data.authorizationUrl } });
	} catch (error) {
		next(error);
	}
});

router.get('/accounts/onedrive/connect', (req, res, next) => {
	try {
		const data = createOneDriveAuthorizationRequest(req.user.id);
		res.json({ data: { ...data, url: data.authorizationUrl } });
	} catch (error) {
		next(error);
	}
});

router.get('/accounts/dropbox/connect', (req, res, next) => {
	try {
		const data = createDropboxAuthorizationRequest(req.user.id);
		res.json({ data: { ...data, url: data.authorizationUrl } });
	} catch (error) {
		next(error);
	}
});

router.post('/accounts/mega/connect', async (req, res, next) => {
	try {
		const data = await connectMegaAccount(req.user.id, req.body || {});
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

router.post('/accounts/s3/connect', async (req, res, next) => {
	try {
		const data = await connectS3Account(req.user.id, req.body || {});
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

router.post('/accounts/pcloud/connect', async (req, res, next) => {
	try {
		const data = await connectPCloudAccount(req.user.id, req.body || {});
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

router.get('/accounts/yandex/connect', (req, res, next) => {
	try {
		const data = createYandexAuthorizationRequest(req.user.id);
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

router.get('/accounts/google/callback', async (req, res) => {
	const frontendUrl = new URL(env.frontendUrl);
	frontendUrl.pathname = '/quota';

	try {
		const { code, state, error } = req.query;

		if (error) {
			console.warn('[Google OAuth Callback] User cancelled or access denied:', error);
			frontendUrl.searchParams.set('google', 'error');
			frontendUrl.searchParams.set('message', 'Google authorization was cancelled.');
			return res.redirect(frontendUrl.toString());
		}

		await completeGoogleAccountLink({ code: String(code || ''), state: String(state || ''), currentUserId: req.user?.id });
		frontendUrl.searchParams.set('google', 'connected');
		return res.redirect(frontendUrl.toString());
	} catch (error) {
		console.error('[Google OAuth Callback Error]:', error);
		const safeMessage = error.message && !/GOOGLE_CLIENT|config|env/i.test(error.message)
			? error.message
			: 'Unable to connect Google Drive. Please try again.';
		frontendUrl.searchParams.set('google', 'error');
		frontendUrl.searchParams.set('message', safeMessage);
		return res.redirect(frontendUrl.toString());
	}
});

router.get('/accounts/onedrive/callback', async (req, res) => {
	const frontendUrl = new URL(env.frontendUrl);
	frontendUrl.pathname = '/quota';

	try {
		const { code, state, error } = req.query;

		if (error) {
			console.warn('[OneDrive OAuth Callback] User cancelled or access denied:', error);
			frontendUrl.searchParams.set('onedrive', 'error');
			frontendUrl.searchParams.set('message', 'OneDrive authorization was cancelled.');
			return res.redirect(frontendUrl.toString());
		}

		await completeOneDriveAccountLink({ code: String(code || ''), state: String(state || ''), currentUserId: req.user?.id });
		frontendUrl.searchParams.set('onedrive', 'connected');
		return res.redirect(frontendUrl.toString());
	} catch (error) {
		console.error('[OneDrive OAuth Callback Error]:', error);
		const safeMessage = error.message && !/ONEDRIVE_CLIENT|config|env/i.test(error.message)
			? error.message
			: 'Unable to connect OneDrive. Please try again.';
		frontendUrl.searchParams.set('onedrive', 'error');
		frontendUrl.searchParams.set('message', safeMessage);
		return res.redirect(frontendUrl.toString());
	}
});

router.get('/accounts/dropbox/callback', async (req, res) => {
	const frontendUrl = new URL(env.frontendUrl);
	frontendUrl.pathname = '/quota';

	try {
		const { code, state, error, error_description } = req.query;

		if (error) {
			console.warn('[Dropbox OAuth Callback] User cancelled or access denied:', error, error_description);
			frontendUrl.searchParams.set('dropbox', 'error');
			frontendUrl.searchParams.set('message', 'Dropbox authorization was cancelled.');
			return res.redirect(frontendUrl.toString());
		}

		await completeDropboxAccountLink({ code: String(code || ''), state: String(state || ''), currentUserId: req.user?.id });
		frontendUrl.searchParams.set('dropbox', 'connected');
		return res.redirect(frontendUrl.toString());
	} catch (error) {
		console.error('[Dropbox OAuth Callback Error]:', error);
		const safeMessage = error.message && !/DROPBOX_CLIENT|config|env/i.test(error.message)
			? error.message
			: 'Unable to connect Dropbox. Please try again.';
		frontendUrl.searchParams.set('dropbox', 'error');
		frontendUrl.searchParams.set('message', safeMessage);
		return res.redirect(frontendUrl.toString());
	}
});

router.get('/accounts/yandex/callback', async (req, res) => {
	const frontendUrl = new URL(env.frontendUrl);
	frontendUrl.pathname = '/quota';

	try {
		const { code, state, error, error_description } = req.query;

		if (error) {
			console.warn('[Yandex OAuth Callback] User cancelled or access denied:', error, error_description);
			frontendUrl.searchParams.set('yandex', 'error');
			frontendUrl.searchParams.set('message', 'Yandex authorization was cancelled.');
			return res.redirect(frontendUrl.toString());
		}

		await completeYandexAccountLink({ code: String(code || ''), state: String(state || ''), currentUserId: req.user?.id });
		frontendUrl.searchParams.set('yandex', 'connected');
		return res.redirect(frontendUrl.toString());
	} catch (error) {
		console.error('[Yandex OAuth Callback Error]:', error);
		const safeMessage = error.message && !/YANDEX_CLIENT|config|env/i.test(error.message)
			? error.message
			: 'Unable to connect Yandex. Please try again.';
		frontendUrl.searchParams.set('yandex', 'error');
		frontendUrl.searchParams.set('message', safeMessage);
		return res.redirect(frontendUrl.toString());
	}
});

router.delete('/accounts/:id', (req, res) => {
	const account = getAccountById(req.user.id, req.params.id);
	if (!account) {
		return res.status(404).json({ error: 'Account not found' });
	}

	clearFilesForAccount(req.user.id, account.id);
	deleteAccount(req.user.id, account.id);

	return res.json({ data: { success: true } });
});

export default router;
