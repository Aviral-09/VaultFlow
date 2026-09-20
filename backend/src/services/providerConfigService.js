import { getEffectiveProviderCredentials } from './providerAppConfigService.js';

const PROVIDER_METADATA = [
	{
		key: 'google_drive',
		name: 'Google Drive',
		authType: 'oauth',
		capabilities: ['list', 'upload', 'download', 'delete', 'starred', 'rename'],
		checkConfigured: () => {
			const creds = getEffectiveProviderCredentials('google_drive');
			return Boolean(creds.clientId && creds.clientSecret);
		},
	},
	{
		key: 'onedrive',
		name: 'OneDrive',
		authType: 'oauth',
		capabilities: ['list', 'upload', 'download', 'delete', 'rename'],
		checkConfigured: () => {
			const creds = getEffectiveProviderCredentials('onedrive');
			return Boolean(creds.clientId && creds.clientSecret);
		},
	},
	{
		key: 'dropbox',
		name: 'Dropbox',
		authType: 'oauth',
		capabilities: ['list', 'upload', 'download', 'delete', 'rename'],
		checkConfigured: () => {
			const creds = getEffectiveProviderCredentials('dropbox');
			return Boolean(creds.clientId && creds.clientSecret);
		},
	},
	{
		key: 'mega',
		name: 'MEGA',
		authType: 'credential',
		capabilities: ['list', 'upload', 'download', 'delete', 'rename'],
		checkConfigured: () => true,
	},
	{
		key: 's3',
		name: 'Amazon S3',
		authType: 'credential',
		capabilities: ['list', 'upload', 'download', 'delete', 'rename'],
		checkConfigured: () => true,
	},
	{
		key: 'pcloud',
		name: 'pCloud',
		authType: 'credential',
		capabilities: ['list', 'upload', 'download', 'delete', 'rename'],
		checkConfigured: () => true,
	},
	{
		key: 'yandex',
		name: 'Yandex Disk',
		authType: 'oauth',
		capabilities: ['list', 'upload', 'download', 'delete', 'rename'],
		checkConfigured: () => {
			const creds = getEffectiveProviderCredentials('yandex');
			return Boolean(creds.clientId && creds.clientSecret);
		},
	},
];

export function listProviderConfigurations() {
	return PROVIDER_METADATA.map((provider) => {
		const configured = provider.checkConfigured();
		return {
			key: provider.key,
			name: provider.name,
			authType: provider.authType,
			configured,
			status: configured ? 'available' : 'unconfigured',
			capabilities: provider.capabilities,
		};
	});
}

export function getProviderConfiguration(providerKey) {
	const found = PROVIDER_METADATA.find((p) => p.key === providerKey);
	if (!found) return null;
	const configured = found.checkConfigured();
	return {
		key: found.key,
		name: found.name,
		authType: found.authType,
		configured,
		status: configured ? 'available' : 'unconfigured',
		capabilities: found.capabilities,
	};
}
