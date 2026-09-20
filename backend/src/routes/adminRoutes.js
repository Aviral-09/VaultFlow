import { Router } from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import {
	getSafeGoogleOAuthStatus,
	saveGoogleProviderConfig,
	testGoogleProviderConfig,
	deleteGoogleProviderConfig,
	getSafeProviderStatus,
	saveProviderConfig,
	deleteProviderConfig,
	testOneDriveProviderConfig,
} from '../services/providerAppConfigService.js';

const router = Router();

router.use(requireAdmin);

router.get('/admin/providers/google', (_req, res) => {
	res.json({ data: getSafeGoogleOAuthStatus() });
});

router.put('/admin/providers/google', (req, res, next) => {
	try {
		const data = saveGoogleProviderConfig(req.body || {});
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

router.post('/admin/providers/google/test', (req, res, next) => {
	try {
		const data = testGoogleProviderConfig(req.body || {});
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

router.delete('/admin/providers/google', (_req, res, next) => {
	try {
		const data = deleteGoogleProviderConfig();
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

router.post('/admin/providers/onedrive/test', (req, res, next) => {
	try {
		const data = testOneDriveProviderConfig(req.body || {});
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

router.get('/admin/providers/:provider', (req, res) => {
	res.json({ data: getSafeProviderStatus(req.params.provider) });
});

router.put('/admin/providers/:provider', (req, res, next) => {
	try {
		const data = saveProviderConfig(req.params.provider, req.body || {});
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

router.delete('/admin/providers/:provider', (req, res, next) => {
	try {
		const data = deleteProviderConfig(req.params.provider);
		res.json({ data });
	} catch (error) {
		next(error);
	}
});

export default router;
