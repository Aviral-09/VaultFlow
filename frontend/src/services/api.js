const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== '')
	? import.meta.env.VITE_API_BASE_URL
	: '/api';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || (
	API_BASE_URL.startsWith('http')
		? API_BASE_URL.replace(/^http/, 'ws').replace(/\/api$/, '/ws/uploads')
		: (typeof window !== 'undefined' && window.location
			? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/uploads`
			: 'ws://localhost:8787/ws/uploads')
);

async function request(path, options = {}) {
	let response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...(options.headers || {}),
			},
			...options,
		});
	} catch (err) {
		const networkError = new Error('Unable to connect to the server. Please check your network connection or server setup.');
		networkError.status = 0;
		throw networkError;
	}

	if (!response.ok) {
		const payload = await response.json().catch(() => null);
		let message = payload?.error;
		if (!message) {
			if (response.status === 504 || response.status === 502 || response.status === 503) {
				message = 'Server connection error. Please ensure backend API is running.';
			} else {
				message = `API request failed (${response.status})`;
			}
		}
		const error = new Error(message);
		error.status = response.status;
		throw error;
	}

	return response.json();
}

export const authApi = {
	me() {
		return request('/auth/me');
	},
	login(payload) {
		return request('/auth/login', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	},
	register(payload) {
		return request('/auth/register', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	},
	logout() {
		return request('/auth/logout', {
			method: 'POST',
		});
	},
};

export const adminApi = {
	getGoogleProviderConfig() {
		return request('/admin/providers/google');
	},
	saveGoogleProviderConfig(payload) {
		return request('/admin/providers/google', {
			method: 'PUT',
			body: JSON.stringify(payload),
		});
	},
	testGoogleProviderConfig(payload = {}) {
		return request('/admin/providers/google/test', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	},
	deleteGoogleProviderConfig() {
		return request('/admin/providers/google', {
			method: 'DELETE',
		});
	},
	getProviderConfig(providerKey) {
		return request(`/admin/providers/${providerKey}`);
	},
	saveProviderConfig(providerKey, payload) {
		return request(`/admin/providers/${providerKey}`, {
			method: 'PUT',
			body: JSON.stringify(payload),
		});
	},
	deleteProviderConfig(providerKey) {
		return request(`/admin/providers/${providerKey}`, {
			method: 'DELETE',
		});
	},
	getOneDriveProviderConfig() {
		return request('/admin/providers/onedrive');
	},
	saveOneDriveProviderConfig(payload) {
		return request('/admin/providers/onedrive', {
			method: 'PUT',
			body: JSON.stringify(payload),
		});
	},
	testOneDriveProviderConfig(payload = {}) {
		return request('/admin/providers/onedrive/test', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	},
	deleteOneDriveProviderConfig() {
		return request('/admin/providers/onedrive', {
			method: 'DELETE',
		});
	},
};

export const settingsApi = {
	getSettings() {
		return request('/settings');
	},
	updateSettings(payload) {
		return request('/settings', {
			method: 'PATCH',
			body: JSON.stringify(payload),
		});
	},
};

export const api = {
	listFiles(virtualPath = '/') {
		const query = new URLSearchParams({ path: virtualPath }).toString();
		return request(`/files?${query}`);
	},
	searchFiles(term, limit = 50) {
		const query = new URLSearchParams({ search: term, limit: String(limit) }).toString();
		return request(`/files?${query}`);
	},
	listStarredFiles() {
		return request('/files?starred=1');
	},
	listRecentFiles() {
		return request('/files?recent=1');
	},
	listSharedWithMeFiles() {
		return request('/files?shared=1');
	},
	listSharedFolderChildren(fileId) {
		return request(`/files/${fileId}/shared-children`);
	},
	getFileDetails(fileId) {
		return request(`/files/${fileId}`);
	},
	createFolder(payload) {
		return request('/files/folders', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	},
	renameFile(fileId, payload) {
		return request(`/files/${fileId}/rename`, {
			method: 'PATCH',
			body: JSON.stringify(payload),
		});
	},
	toggleStar(fileId, isStarred = true) {
		return request(`/files/${fileId}/star`, {
			method: 'PATCH',
			body: JSON.stringify({ is_starred: isStarred }),
		});
	},
	deleteFile(fileId) {
		return request(`/files/${fileId}`, {
			method: 'DELETE',
		});
	},
	deleteFiles(fileIds) {
		return request('/files/bulk/delete', {
			method: 'POST',
			body: JSON.stringify({ ids: fileIds }),
		});
	},
	getGoogleIntegrationStatus() {
		return request('/accounts/google/status');
	},
	getGoogleConnectUrl() {
		return request('/accounts/google/connect');
	},
	getOneDriveIntegrationStatus() {
		return request('/accounts/onedrive/status');
	},
	getOneDriveConnectUrl() {
		return request('/accounts/onedrive/connect');
	},
	getDropboxIntegrationStatus() {
		return request('/accounts/dropbox/status');
	},
	getDropboxConnectUrl() {
		return request('/accounts/dropbox/connect');
	},
	getMegaIntegrationStatus() {
		return request('/accounts/mega/status');
	},
	connectMegaAccount(payload) {
		return request('/accounts/mega/connect', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	},
	connectS3Account(payload) {
		return request('/accounts/s3/connect', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	},
	connectPCloudAccount(payload) {
		return request('/accounts/pcloud/connect', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	},
	getYandexConnectUrl() {
		return request('/accounts/yandex/connect');
	},
	listAccounts() {
		return request('/accounts');
	},
	listStorageConnections() {
		return request('/storage/connections');
	},
	listProviders() {
		return request('/storage/providers');
	},
	disconnectAccount(accountId) {
		return request(`/accounts/${accountId}`, {
			method: 'DELETE',
		});
	},
	getHealth() {
		return request('/health');
	},
	runSync() {
		return request('/sync/run', {
			method: 'POST',
		});
	},
	initiateUpload(payload, options = {}) {
		return request('/uploads/initiate', {
			method: 'POST',
			body: JSON.stringify(payload),
			signal: options.signal,
		});
	},
	async uploadFile(uploadId, file, options = {}) {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}/stream`, {
			method: 'POST',
			credentials: 'include',
			body: formData,
			signal: options.signal,
		});

		if (!response.ok) {
			const payload = await response.json().catch(() => ({ error: 'Upload failed' }));
			throw new Error(payload.error || 'Upload failed');
		}

		return response.json();
	},
	createUploadSocket(uploadId) {
		return new WebSocket(`${WS_BASE_URL}?uploadId=${encodeURIComponent(uploadId)}`);
	},
	downloadUrl(fileId) {
		return `${API_BASE_URL}/files/${fileId}/download`;
	},
	previewUrl(fileId) {
		return `${API_BASE_URL}/files/${fileId}/preview`;
	},
	getSettings() {
		return settingsApi.getSettings();
	},
	updateSettings(payload) {
		return settingsApi.updateSettings(payload);
	},
	getAllocation() {
		return request('/allocation');
	},
	updateAllocation(payload) {
		return request('/allocation', {
			method: 'PATCH',
			body: JSON.stringify(payload),
		});
	},
	getGoogleProviderConfig() {
		return adminApi.getGoogleProviderConfig();
	},
	saveGoogleProviderConfig(payload) {
		return adminApi.saveGoogleProviderConfig(payload);
	},
	testGoogleProviderConfig(payload) {
		return adminApi.testGoogleProviderConfig(payload);
	},
	deleteGoogleProviderConfig() {
		return adminApi.deleteGoogleProviderConfig();
	},
	getOneDriveProviderConfig() {
		return adminApi.getOneDriveProviderConfig();
	},
	saveOneDriveProviderConfig(payload) {
		return adminApi.saveOneDriveProviderConfig(payload);
	},
	testOneDriveProviderConfig(payload) {
		return adminApi.testOneDriveProviderConfig(payload);
	},
	deleteOneDriveProviderConfig() {
		return adminApi.deleteOneDriveProviderConfig();
	},
};
