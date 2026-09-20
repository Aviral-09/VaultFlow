import { ref, computed } from 'vue';
import { api } from '../services/api';
import { useAuthStore } from '../stores/auth';

export function useGoogleDriveConnection() {
	const authStore = useAuthStore();

	const isConfigured = ref(false);
	const configStatus = ref('unconfigured');
	const configSource = ref('none');
	const isConnecting = ref(false);
	const isCheckingStatus = ref(false);
	const connectionError = ref('');
	const isSetupModalOpen = ref(false);

	const isAdmin = computed(() => {
		if (authStore.mode === 'local' || !authStore.requiresAuth) return true;
		return Boolean(authStore.user?.isAdmin);
	});

	async function checkStatus() {
		isCheckingStatus.value = true;
		try {
			const { data } = await api.getGoogleIntegrationStatus();
			isConfigured.value = Boolean(data?.configured);
			configStatus.value = data?.status || (isConfigured.value ? 'available' : 'unconfigured');
			configSource.value = data?.source || 'none';
			return data;
		} catch (err) {
			console.warn('[useGoogleDriveConnection] Failed to check status:', err);
			return null;
		} finally {
			isCheckingStatus.value = false;
		}
	}

	async function connect() {
		connectionError.value = '';

		const status = await checkStatus();
		const configured = status ? Boolean(status.configured) : isConfigured.value;

		if (!configured) {
			if (isAdmin.value) {
				connectionError.value = '';
				isSetupModalOpen.value = true;
			} else {
				connectionError.value =
					'Google Drive is not currently configured by the administrator. Please contact your OmniCloud administrator.';
			}
			return;
		}

		isConnecting.value = true;
		try {
			const { data } = await api.getGoogleConnectUrl();
			if (data?.authorizationUrl) {
				window.location.href = data.authorizationUrl;
			} else {
				throw new Error('No authorization URL received');
			}
		} catch (err) {
			connectionError.value =
				err.message || 'Unable to start Google Drive connection. Please try again.';
		} finally {
			isConnecting.value = false;
		}
	}

	function openSetupModal() {
		if (isAdmin.value) {
			connectionError.value = '';
			isSetupModalOpen.value = true;
		}
	}

	function closeSetupModal() {
		isSetupModalOpen.value = false;
	}

	function onConfigured() {
		checkStatus();
	}

	return {
		isConfigured,
		configStatus,
		configSource,
		isConnecting,
		isCheckingStatus,
		connectionError,
		isSetupModalOpen,
		isAdmin,
		checkStatus,
		connect,
		openSetupModal,
		closeSetupModal,
		onConfigured,
	};
}
