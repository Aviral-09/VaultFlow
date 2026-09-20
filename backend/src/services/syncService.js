import cron from 'node-cron';
import { env } from '../config/env.js';
import { db, LOCAL_USER_ID } from '../config/database.js';
import { getActiveAccounts, markAccountStatus, updateAccountStorage } from './accountService.js';
import { createAdapter } from './adapterRegistry.js';
import { clearFilesForAccount, replaceFilesForAccount } from './fileService.js';
import { isAuthError, withRetry } from '../utils/providerErrors.js';

async function fetchAccountSnapshot(account) {
	return withRetry(
		async () => {
			const adapter = createAdapter(account);
			const remoteFiles = await adapter.fetchStructure();
			const storage = await adapter.getStorageSummary();
			return { remoteFiles, storage };
		},
		{
			retries: 3,
			onRetry: (error, attempt) => {
				console.warn(
					`Transient sync error for ${account.email} (attempt ${attempt}), retrying:`,
					error?.message || error,
				);
			},
		},
	);
}

function handleSyncFailure(account, error) {
	if (isAuthError(error)) {
		clearFilesForAccount(account.user_id, account.id);
		markAccountStatus(account.user_id, account.id, 'invalid_token');
		console.error(`Auth error for account ${account.email}, marked invalid_token:`, error.message);
		return;
	}

	console.error(
		`Transient sync failure for account ${account.email} (kept connected):`,
		error.message,
	);
}

const lastSyncReportByUser = new Map();
const activeSyncPromisesByUser = new Map();

function createDefaultReport(userId) {
	return {
		lastRunAt: null,
		userId: userId || null,
		scannedAccounts: 0,
		changesDetected: 0,
		isRunning: false,
	};
}

export async function runDeltaSync(userId) {
	if (!userId) {
		throw new Error('userId is required for runDeltaSync');
	}

	const existingPromise = activeSyncPromisesByUser.get(userId);
	if (existingPromise) {
		return existingPromise;
	}

	const syncPromise = (async () => {
		const accounts = getActiveAccounts(userId);
		let changesDetected = 0;

		for (const account of accounts) {
			try {
				const { remoteFiles, storage } = await fetchAccountSnapshot(account);

				replaceFilesForAccount(userId, account.id, remoteFiles);
				updateAccountStorage(userId, account.id, storage.totalSpace, storage.usedSpace);
				changesDetected += remoteFiles.length;
			} catch (error) {
				handleSyncFailure(account, error);
			}
		}

		const report = {
			lastRunAt: new Date().toISOString(),
			userId,
			scannedAccounts: accounts.length,
			changesDetected,
		};

		lastSyncReportByUser.set(userId, report);
		return report;
	})();

	activeSyncPromisesByUser.set(userId, syncPromise);

	try {
		return await syncPromise;
	} finally {
		activeSyncPromisesByUser.delete(userId);
	}
}

function getActiveUserIdsWithAccounts() {
	const rows = db.prepare("SELECT DISTINCT user_id FROM cloud_accounts WHERE status = 'active'").all();
	return rows.map((r) => r.user_id);
}

export function scheduleSync() {
	const interval = Math.max(1, env.syncIntervalMinutes);
	cron.schedule(`*/${interval} * * * *`, async () => {
		try {
			if (env.appMode === 'local') {
				await runDeltaSync(LOCAL_USER_ID);
			} else {
				const userIds = getActiveUserIdsWithAccounts();
				for (const userId of userIds) {
					try {
						await runDeltaSync(userId);
					} catch (error) {
						console.error(`Scheduled sync error for user ${userId}:`, error?.message || error);
					}
				}
			}
		} catch (error) {
			console.error('Scheduled sync tick error:', error?.message || error);
		}
	});
}

export function getLastSyncReport(userId) {
	if (!userId) {
		return createDefaultReport(null);
	}

	const report = lastSyncReportByUser.get(userId) || createDefaultReport(userId);
	return {
		...report,
		isRunning: activeSyncPromisesByUser.has(userId),
	};
}

export async function syncAccount(userId, account) {
	try {
		const { remoteFiles, storage } = await fetchAccountSnapshot(account);

		replaceFilesForAccount(userId, account.id, remoteFiles);
		updateAccountStorage(userId, account.id, storage.totalSpace, storage.usedSpace);

		return {
			accountId: account.id,
			filesSynced: remoteFiles.length,
			totalSpace: storage.totalSpace,
			usedSpace: storage.usedSpace,
		};
	} catch (error) {
		handleSyncFailure(account, error);
		throw error;
	}
}
