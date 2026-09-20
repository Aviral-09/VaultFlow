<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import {
	IconChevronDown,
	IconCloud,
	IconLinkPlus,
	IconPlugConnected,
	IconPlugConnectedX,
	IconRefresh,
	IconArrowUp,
	IconArrowDown,
	IconGripVertical,
	IconDeviceFloppy,
	IconCheck,
	IconChartPie,
	IconAdjustments,
	IconBrandGoogleDrive,
} from '@tabler/icons-vue';
import DriveShell from '../components/DriveShell.vue';
import GoogleDriveSetupModal from '../components/GoogleDriveSetupModal.vue';
import OneDriveSetupModal from '../components/OneDriveSetupModal.vue';
import MegaConnectModal from '../components/MegaConnectModal.vue';
import PCloudConnectModal from '../components/PCloudConnectModal.vue';
import S3ConnectModal from '../components/S3ConnectModal.vue';
import TruncateMarquee from '../components/TruncateMarquee.vue';
import { useAccountManagementStore } from '../stores/accountManagement';
import { useAuthStore } from '../stores/auth';
import { api } from '../services/api';
import { formatBytesStrict, providerIcon, providerLabel } from '../composables/useFormatFile.js';
import { useStorageStats } from '../composables/useStorageStats.js';

const { t } = useI18n();
const accountStore = useAccountManagementStore();
const authStore = useAuthStore();
const { accounts, isLoading, error, isDisconnectingId } = storeToRefs(accountStore);
const route = useRoute();
const router = useRouter();
const { totalUsed, totalSpace, totalFree, usedFormatted, totalFormatted, freeFormatted, usedTotalLabel } = useStorageStats();

const connectingProvider = ref('');
const actionError = ref('');
const actionSuccess = ref('');
const isSyncing = ref(false);
const isConnectMenuOpen = ref(false);
const isGoogleSetupModalOpen = ref(false);
const isOneDriveSetupModalOpen = ref(false);
const isMegaModalOpen = ref(false);
const isPCloudModalOpen = ref(false);
const isS3ModalOpen = ref(false);

const ALLOCATION_STRATEGIES = ['round_robin', 'weighted_round_robin', 'least_used', 'most_free', 'manual'];
const activeTab = ref('overview');
const selectedStrategy = ref('round_robin');
const allocationOrder = ref([]);
const isAllocationLoading = ref(false);
const isSavingAllocation = ref(false);
const allocationError = ref('');
const allocationSaved = ref(false);
const dragIndex = ref(null);

const allocationStrategyOptions = computed(() =>
	ALLOCATION_STRATEGIES.map((key) => ({
		key,
		label: t(`allocation.strategies.${key}`),
		description: t(`allocation.strategies.${key}_desc`),
	})),
);

const orderedAllocationAccounts = computed(() => {
	const byId = new Map(accounts.value.map((account) => [account.id, account]));
	const ordered = [];
	allocationOrder.value.forEach((id) => {
		if (byId.has(id)) {
			ordered.push(byId.get(id));
			byId.delete(id);
		}
	});
	[...byId.values()].forEach((account) => ordered.push(account));
	return ordered;
});

const accountPalette = [
	{
		used: 'bg-[#1a73e8]',
		free: 'bg-[#d2e3fc]',
		surface: 'bg-[#e8f0fe]',
		text: 'text-[#1a73e8]',
	},
	{
		used: 'bg-[#188038]',
		free: 'bg-[#ceead6]',
		surface: 'bg-[#e6f4ea]',
		text: 'text-[#188038]',
	},
	{
		used: 'bg-[#c26401]',
		free: 'bg-[#fce8b2]',
		surface: 'bg-[#fef7e0]',
		text: 'text-[#c26401]',
	},
	{
		used: 'bg-[#9334e6]',
		free: 'bg-[#e9d7fe]',
		surface: 'bg-[#f3e8ff]',
		text: 'text-[#9334e6]',
	},
];

const providerConnectOptions = computed(() => [
	{
		key: 'google_drive',
		label: t('providers.googleDrive'),
		busyLabel: t('storage.connectingProvider', { provider: 'Google' }),
		icon: providerIcon('google_drive'),
		configured: true,
		action: connectGoogleDrive,
	},
	{
		key: 'onedrive',
		label: t('providers.oneDrive'),
		busyLabel: t('storage.connectingProvider', { provider: 'OneDrive' }),
		icon: providerIcon('onedrive'),
		configured: true,
		action: connectOneDrive,
	},
	{
		key: 'mega',
		label: t('providers.mega'),
		busyLabel: t('storage.connectingProvider', { provider: 'MEGA' }),
		icon: providerIcon('mega'),
		configured: true,
		action: openMegaModal,
	},
	{
		key: 'pcloud',
		label: t('providers.pcloud'),
		busyLabel: t('storage.connectingProvider', { provider: 'pCloud' }),
		icon: providerIcon('pcloud'),
		configured: true,
		action: openPCloudModal,
	},
	{
		key: 's3',
		label: t('providers.s3'),
		busyLabel: t('storage.connectingProvider', { provider: 'S3' }),
		icon: providerIcon('s3'),
		configured: true,
		action: openS3Modal,
	},
]);

const storageSegments = computed(() => {
	const total = totalSpace.value || 1;

	const accountSegments = accounts.value.flatMap((account, index) => {
		const used = Math.max(0, Number(account.used_space || 0));
		const capacity = Math.max(0, Number(account.total_space || 0));
		const free = Math.max(0, capacity - used);
		const palette = accountPalette[index % accountPalette.length];

		return [
			{
				key: `${account.id}-used`,
				width: `${(used / total) * 100}%`,
				className: palette.used,
			},
			{
				key: `${account.id}-free`,
				width: `${(free / total) * 100}%`,
				className: palette.free,
			},
		].filter((segment) => Number.parseFloat(segment.width) > 0);
	});

	if (!accounts.value.length && totalFree.value > 0) {
		return [
			{
				key: 'empty-free',
				width: '100%',
				className: 'bg-[#eef2f7] dark:bg-slate-700',
			},
		];
	}

	return accountSegments;
});

const accountLegends = computed(() =>
	accounts.value.map((account, index) => {
		const used = Math.max(0, Number(account.used_space || 0));
		const total = Math.max(0, Number(account.total_space || 0));
		const free = Math.max(0, total - used);
		return {
			...account,
			used,
			free,
			palette: accountPalette[index % accountPalette.length],
		};
	}),
);

function providerBadgeClass(status) {
	return status === 'active'
		? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
		: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
}

function isReconnectable(account) {
	return ['suspended', 'invalid_token'].includes(account?.status);
}

function isAccountActionBusy(account) {
	if (isReconnectable(account)) {
		return connectingProvider.value === account.provider;
	}

	return isDisconnectingId.value === account.id;
}

function accountActionLabel(account) {
	if (isReconnectable(account)) {
		return connectingProvider.value === account.provider ? t('storage.connecting') : t('storage.connect');
	}

	return isDisconnectingId.value === account.id ? t('storage.disconnecting') : t('storage.disconnect');
}

async function reconnectAccount(account) {
	if (account.provider === 'google_drive') {
		await connectGoogleDrive();
		return;
	}

	if (account.provider === 'onedrive') {
		await connectOneDrive();
		return;
	}

	if (account.provider === 'dropbox') {
		await connectDropbox();
		return;
	}

	if (account.provider === 'mega') {
		openMegaModal();
		return;
	}

	actionError.value = t('storage.reconnectNotSupported', { provider: providerLabel(account.provider) });
}

async function handleAccountAction(account) {
	if (isReconnectable(account)) {
		await reconnectAccount(account);
		return;
	}

	await disconnectAccount(account);
}

const providerConfigs = ref([]);

async function loadProviders() {
	try {
		const { data } = await api.listProviders();
		providerConfigs.value = data || [];
	} catch (err) {
		console.warn('[QuotaView] Failed to load provider status:', err);
	}
}

function getProviderStatus(providerKey) {
	const found = providerConfigs.value.find((p) => p.key === providerKey);
	if (!found) return { configured: true, status: 'available' };
	return found;
}

async function loadPage() {
	await Promise.all([
		accountStore.loadAccounts(),
		loadAllocation(),
		loadProviders(),
	]);
}

async function loadAllocation() {
	isAllocationLoading.value = true;
	allocationError.value = '';
	try {
		const { data } = await api.getAllocation();
		if (data?.strategy && ALLOCATION_STRATEGIES.includes(data.strategy)) {
			selectedStrategy.value = data.strategy;
		}
		allocationOrder.value = Array.isArray(data?.accounts)
			? data.accounts.map((account) => account.id)
			: [];
	} catch (error) {
		allocationError.value = error.message;
	} finally {
		isAllocationLoading.value = false;
	}
}

function selectStrategy(key) {
	if (!ALLOCATION_STRATEGIES.includes(key)) return;
	selectedStrategy.value = key;
	allocationSaved.value = false;
}

function syncOrderFromAccounts() {
	allocationOrder.value = orderedAllocationAccounts.value.map((account) => account.id);
}

function moveAccount(index, direction) {
	syncOrderFromAccounts();
	const target = index + direction;
	if (target < 0 || target >= allocationOrder.value.length) return;
	const next = [...allocationOrder.value];
	[next[index], next[target]] = [next[target], next[index]];
	allocationOrder.value = next;
	allocationSaved.value = false;
}

function onDragStart(index) {
	syncOrderFromAccounts();
	dragIndex.value = index;
}

function onDragOver(index, event) {
	event.preventDefault();
	if (dragIndex.value === null || dragIndex.value === index) return;
	const next = [...allocationOrder.value];
	const [moved] = next.splice(dragIndex.value, 1);
	next.splice(index, 0, moved);
	allocationOrder.value = next;
	dragIndex.value = index;
	allocationSaved.value = false;
}

function onDragEnd() {
	dragIndex.value = null;
}

async function saveAllocation() {
	isSavingAllocation.value = true;
	allocationError.value = '';
	allocationSaved.value = false;
	syncOrderFromAccounts();
	try {
		const { data } = await api.updateAllocation({
			strategy: selectedStrategy.value,
			order: allocationOrder.value,
		});
		if (data?.strategy) selectedStrategy.value = data.strategy;
		allocationOrder.value = Array.isArray(data?.accounts)
			? data.accounts.map((account) => account.id)
			: allocationOrder.value;
		allocationSaved.value = true;
	} catch (error) {
		allocationError.value = error.message;
	} finally {
		isSavingAllocation.value = false;
	}
}

async function connectGoogleDrive() {
	connectingProvider.value = 'google_drive';
	isConnectMenuOpen.value = false;
	actionError.value = '';
	try {
		const { data } = await api.getGoogleConnectUrl();
		window.location.href = data.authorizationUrl;
	} catch (error) {
		if (authStore.mode === 'local' || !authStore.requiresAuth || authStore.user?.isAdmin) {
			actionError.value = '';
			isGoogleSetupModalOpen.value = true;
		} else {
			actionError.value = error.message;
		}
	} finally {
		connectingProvider.value = '';
	}
}

async function connectOneDrive() {
	connectingProvider.value = 'onedrive';
	isConnectMenuOpen.value = false;
	actionError.value = '';
	try {
		const { data } = await api.getOneDriveConnectUrl();
		window.location.href = data.authorizationUrl;
	} catch (error) {
		if (authStore.mode === 'local' || !authStore.requiresAuth || authStore.user?.isAdmin) {
			actionError.value = '';
			isOneDriveSetupModalOpen.value = true;
		} else {
			actionError.value = error.message;
		}
	} finally {
		connectingProvider.value = '';
	}
}

function openOneDriveSetupModal() {
	isConnectMenuOpen.value = false;
	actionError.value = '';
	isOneDriveSetupModalOpen.value = true;
}

async function connectDropbox() {
	connectingProvider.value = 'dropbox';
	isConnectMenuOpen.value = false;
	actionError.value = '';
	try {
		const { data } = await api.getDropboxConnectUrl();
		window.location.href = data.authorizationUrl;
	} catch (error) {
		actionError.value = error.message;
	} finally {
		connectingProvider.value = '';
	}
}

function openMegaModal() {
	isConnectMenuOpen.value = false;
	actionError.value = '';
	isMegaModalOpen.value = true;
}

function closeMegaModal() {
	if (connectingProvider.value === 'mega') return;
	isMegaModalOpen.value = false;
}

async function connectMega(payload) {
	connectingProvider.value = 'mega';
	actionError.value = '';
	try {
		await api.connectMegaAccount(payload);
		await accountStore.loadAccounts();
		isMegaModalOpen.value = false;
	} catch (error) {
		actionError.value = error.message;
	} finally {
		connectingProvider.value = '';
	}
}

function openPCloudModal() {
	isConnectMenuOpen.value = false;
	actionError.value = '';
	isPCloudModalOpen.value = true;
}

function closePCloudModal() {
	if (connectingProvider.value === 'pcloud') return;
	isPCloudModalOpen.value = false;
}

async function connectPCloud(payload) {
	connectingProvider.value = 'pcloud';
	actionError.value = '';
	try {
		await api.connectPCloudAccount(payload);
		await accountStore.loadAccounts();
		isPCloudModalOpen.value = false;
	} catch (error) {
		actionError.value = error.message;
	} finally {
		connectingProvider.value = '';
	}
}

async function connectYandex() {
	connectingProvider.value = 'yandex';
	isConnectMenuOpen.value = false;
	actionError.value = '';
	try {
		const { data } = await api.getYandexConnectUrl();
		window.location.href = data.authorizationUrl;
	} catch (error) {
		actionError.value = error.message;
		connectingProvider.value = '';
	}
}


function openS3Modal() {
	isConnectMenuOpen.value = false;
	actionError.value = '';
	isS3ModalOpen.value = true;
}

function closeS3Modal() {
	if (connectingProvider.value === 's3') return;
	isS3ModalOpen.value = false;
}

async function connectS3(payload) {
	connectingProvider.value = 's3';
	actionError.value = '';
	try {
		await api.connectS3Account(payload);
		await accountStore.loadAccounts();
		isS3ModalOpen.value = false;
	} catch (error) {
		actionError.value = error.message;
	} finally {
		connectingProvider.value = '';
	}
}

async function disconnectAccount(account) {
	const providerName = providerLabel(account.provider);
	const confirmed = window.confirm(
		`Disconnecting removes OmniCloud's access. Your files remain in ${providerName}.\n\nAre you sure you want to disconnect ${account.email}?`
	);
	if (!confirmed) return;

	actionError.value = '';
	try {
		await accountStore.disconnectAccount(account.id);
		actionSuccess.value = `${providerName} account (${account.email}) disconnected successfully.`;
	} catch (error) {
		actionError.value = error.message;
	}
}

async function syncNow() {
	isSyncing.value = true;
	actionError.value = '';
	try {
		await api.runSync();
		await accountStore.loadAccounts();
	} catch (error) {
		actionError.value = error.message;
	} finally {
		isSyncing.value = false;
	}
}

function handleProviderSelect(provider) {
	if (!provider.configured) {
		isConnectMenuOpen.value = false;
		if (provider.key === 'google_drive') {
			if (authStore.mode === 'local' || !authStore.requiresAuth || authStore.user?.isAdmin) {
				actionError.value = '';
				isGoogleSetupModalOpen.value = true;
			} else {
				actionError.value = 'Google Drive is not currently configured by the administrator. Please contact your OmniCloud administrator.';
			}
		} else {
			actionError.value = `${provider.label} is not configured on this OmniCloud deployment. Please contact your administrator or check docs/provider-setup.md.`;
		}
		return;
	}
	provider.action();
}

function openGoogleSetupModal() {
	isConnectMenuOpen.value = false;
	actionError.value = '';
	isGoogleSetupModalOpen.value = true;
}

function toggleConnectMenu() {
	isConnectMenuOpen.value = !isConnectMenuOpen.value;
}

const OAUTH_PROVIDERS = ['yandex', 'google', 'onedrive', 'dropbox'];

async function handleOAuthRedirect() {
	const query = route.query;
	const providerKey = OAUTH_PROVIDERS.find((key) => query[key]);
	if (!providerKey) return;

	const status = String(query[providerKey]);
	const message = query.message ? String(query.message) : '';

	const providerName = providerLabel(providerKey === 'google' ? 'google_drive' : providerKey);

	if (status === 'connected') {
		await accountStore.loadAccounts();
		await loadAllocation();
		actionSuccess.value = `${providerName} connected successfully.`;
		actionError.value = '';
	} else if (status === 'error') {
		actionError.value = message || `Unable to connect ${providerName}. Please try again.`;
		actionSuccess.value = '';
	}

	const nextQuery = { ...query };
	delete nextQuery[providerKey];
	delete nextQuery.message;
	router.replace({ query: nextQuery });
}

onMounted(async () => {
	await loadPage();
	await handleOAuthRedirect();
});
</script>

<template>
	<DriveShell current-section="storage">
		<div class="min-h-[calc(100vh-84px)] rounded-3xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-6 text-[#fcf7f0] shadow-xl sm:p-8">
			<!-- Header Title & Action Buttons -->
			<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 class="text-2xl font-bold text-[#fcf7f0]">{{ t('storage.title') }}</h1>
					<p class="mt-1 text-sm text-[#b8a693]">{{ t('storage.subtitle') }}</p>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<button type="button" class="inline-flex items-center gap-2 rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] px-4 py-2.5 text-sm font-semibold text-[#fcf7f0] transition hover:bg-[#30241c] disabled:opacity-60" :disabled="isSyncing" @click="syncNow">
						<IconRefresh :size="18" :stroke="2" :class="isSyncing ? 'animate-spin' : ''" />
						<span>{{ isSyncing ? t('storage.syncing') : t('storage.syncNow') }}</span>
					</button>

					<div class="relative">
						<button type="button" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-4.5 py-2.5 text-sm font-semibold text-[#fcf7f0] shadow-[0_4px_14px_-2px_rgba(249,115,22,0.4)] transition hover:brightness-110 disabled:opacity-60" :disabled="Boolean(connectingProvider)" @click="toggleConnectMenu">
							<IconLinkPlus :size="18" :stroke="2" />
							<span>{{ connectingProvider ? t('storage.connecting') : t('storage.connect') }}</span>
							<IconChevronDown :size="16" :stroke="2" class="transition" :class="isConnectMenuOpen ? 'rotate-180' : ''" />
						</button>

						<div v-if="isConnectMenuOpen" class="absolute right-0 top-[calc(100%+8px)] z-30 min-w-[260px] overflow-hidden rounded-2xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] py-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
							<button v-for="provider in providerConnectOptions" :key="provider.key" type="button" class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[#fcf7f0] transition hover:bg-[#30241c] disabled:opacity-60" :disabled="Boolean(connectingProvider)" @click="handleProviderSelect(provider)">
								<div class="flex items-center gap-3 min-w-0">
									<img :src="provider.icon" :alt="provider.label" class="size-[18px] shrink-0 object-contain" />
									<span class="truncate">{{ connectingProvider === provider.key ? provider.busyLabel : provider.label }}</span>
								</div>
								<span v-if="!provider.configured" class="shrink-0 rounded-full bg-[#1e1712] px-2 py-0.5 text-[10px] font-semibold text-[#857362]">Unavailable</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Tab Switcher -->
			<div class="mb-6 flex items-center gap-1 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#120e0b] p-1.5 sm:w-fit">
				<button type="button" class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition" :class="activeTab === 'overview'
					? 'bg-[#f97316] text-[#fcf7f0] shadow-md'
					: 'text-[#b8a693] hover:text-[#fcf7f0]'" @click="activeTab = 'overview'">
					<IconChartPie :size="18" :stroke="1.9" />
					<span>{{ t('storage.tabOverview') }}</span>
				</button>
				<button type="button" class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition" :class="activeTab === 'allocation'
					? 'bg-[#f97316] text-[#fcf7f0] shadow-md'
					: 'text-[#b8a693] hover:text-[#fcf7f0]'" @click="activeTab = 'allocation'">
					<IconAdjustments :size="18" :stroke="1.9" />
					<span>{{ t('storage.tabAllocation') }}</span>
				</button>
			</div>

			<!-- Overview Tab -->
			<section v-show="activeTab === 'overview'" class="mb-6 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#261d17] p-6 shadow-lg">
				<div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
					<div class="flex items-center gap-3">
						<div class="grid size-12 place-items-center rounded-2xl bg-[#f97316]/15 text-[#f97316]">
							<IconCloud :size="24" :stroke="1.8" />
						</div>
						<div>
							<p class="text-sm text-[#b8a693]">{{ t('storage.totalStorage') }}</p>
							<strong class="text-xl text-[#fcf7f0]">{{ usedTotalLabel }}</strong>
						</div>
					</div>

					<div class="min-w-[220px] rounded-2xl border border-[rgba(245,225,205,0.08)] bg-[#1e1712] px-4 py-3 text-sm">
						<div class="flex items-center justify-between gap-3">
							<span class="text-[#b8a693]">{{ t('storage.usedSpace') }}</span>
							<strong class="text-[#fcf7f0]">{{ usedFormatted }}</strong>
						</div>
						<div class="mt-2 flex items-center justify-between gap-3">
							<span class="text-[#b8a693]">{{ t('storage.freeSpace') }}</span>
							<strong class="text-[#f97316]">{{ freeFormatted }}</strong>
						</div>
					</div>
				</div>

				<div class="mt-5 overflow-hidden rounded-full bg-[#120e0b]">
					<div class="flex h-5 w-full overflow-hidden rounded-full">
						<div v-for="segment in storageSegments" :key="segment.key" class="h-full" :class="segment.className" :style="{ width: segment.width }" />
					</div>
				</div>

				<div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					<div v-for="account in accountLegends" :key="account.id" class="min-w-0 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-4.5">
						<div class="flex items-start justify-between gap-3">
							<div class="flex min-w-0 items-start gap-3">
								<div class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(245,225,205,0.1)] bg-[#120e0b]">
									<img v-if="providerIcon(account.provider)" :src="providerIcon(account.provider)" :alt="providerLabel(account.provider)" class="size-5 object-contain" />
								</div>
								<div class="min-w-0">
									<TruncateMarquee as="p" class="text-sm font-semibold text-[#fcf7f0]" :text="account.email" />
									<TruncateMarquee as="p" class="text-xs text-[#b8a693]" :text="providerLabel(account.provider)" />
								</div>
							</div>
							<div class="grid gap-1 text-xs">
								<span class="inline-flex items-center gap-2 text-[#fcf7f0]">
									<span class="size-2.5 rounded-full" :class="account.palette.used" />
									{{ t('storage.used') }}
								</span>
								<span class="inline-flex items-center gap-2 text-[#b8a693]">
									<span class="size-2.5 rounded-full" :class="account.palette.free" />
									{{ t('storage.free') }}
								</span>
							</div>
						</div>

						<div class="mt-4 h-3 overflow-hidden rounded-full bg-[#120e0b]">
							<div class="flex h-full w-full overflow-hidden rounded-full">
								<div class="h-full" :class="account.palette.used" :style="{ width: `${account.total_space ? Math.min(100, (account.used / account.total_space) * 100) : 0}%` }" />
								<div class="h-full" :class="account.palette.free" :style="{ width: `${account.total_space ? Math.min(100, (account.free / account.total_space) * 100) : 0}%` }" />
							</div>
						</div>

						<div class="mt-3 flex items-center justify-between gap-3 text-sm">
							<span class="text-[#b8a693]">{{ formatBytesStrict(account.used) }} / {{ formatBytesStrict(account.total_space) }}</span>
							<span class="font-semibold text-[#f97316]">{{ formatBytesStrict(account.free) }} {{ t('storage.empty') }}</span>
						</div>

						<div class="mt-4 flex items-center justify-between gap-3">
							<button type="button" class="inline-flex h-9 items-center gap-2 rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] px-3.5 text-xs font-semibold text-[#fcf7f0] transition hover:bg-[#30241c] disabled:opacity-60" :disabled="isAccountActionBusy(account)" @click="handleAccountAction(account)">
								<IconPlugConnected v-if="isReconnectable(account)" :size="16" :stroke="2" />
								<IconPlugConnectedX v-else :size="16" :stroke="2" />
								<span>{{ accountActionLabel(account) }}</span>
							</button>

							<span class="inline-flex rounded-full bg-[#f97316]/15 px-3 py-0.5 text-xs font-semibold capitalize text-[#f97316]">{{ account.status }}</span>
						</div>
					</div>
				</div>
			</section>

			<!-- Allocation Tab -->
			<section v-show="activeTab === 'allocation'" class="mb-6 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#261d17] p-6 shadow-lg">
				<div class="flex flex-col gap-1">
					<h2 class="text-lg font-bold text-[#fcf7f0]">{{ t('allocation.title') }}</h2>
					<p class="text-sm text-[#b8a693]">{{ t('allocation.subtitle') }}</p>
				</div>

				<div v-if="!accounts.length" class="mt-4 rounded-2xl border border-dashed border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 py-6 text-center text-sm text-[#b8a693]">
					{{ t('allocation.noAccounts') }}
				</div>

				<template v-else>
					<div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
						<button v-for="option in allocationStrategyOptions" :key="option.key" type="button" class="flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition" :class="selectedStrategy === option.key
							? 'border-[#f97316] bg-[#f97316]/15 text-[#fcf7f0] shadow-md'
							: 'border-[rgba(245,225,205,0.09)] bg-[#1e1712] text-[#e8dbcc] hover:border-[#f97316]/40 hover:bg-[#261d17]'" @click="selectStrategy(option.key)">
							<span class="flex items-center justify-between gap-2">
								<span class="text-sm font-bold" :class="selectedStrategy === option.key ? 'text-[#f97316]' : 'text-[#fcf7f0]'">{{ option.label }}</span>
								<IconCheck v-if="selectedStrategy === option.key" :size="18" :stroke="2.5" class="text-[#f97316]" />
							</span>
							<span class="text-xs leading-relaxed text-[#b8a693]">{{ option.description }}</span>
						</button>
					</div>

					<div class="mt-6 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-4" :class="selectedStrategy === 'manual' ? '' : 'opacity-80'">
						<div class="flex items-center justify-between gap-3">
							<h3 class="text-sm font-bold text-[#fcf7f0]">{{ t('allocation.orderTitle') }}</h3>
						</div>
						<p class="mt-1 text-xs text-[#b8a693]">{{ t('allocation.reorderHint') }}</p>

						<ul class="mt-3 grid gap-2">
							<li v-for="(account, index) in orderedAllocationAccounts" :key="account.id" draggable="true" class="flex items-center gap-3 rounded-xl border border-[rgba(245,225,205,0.09)] bg-[#261d17] px-3.5 py-3 text-[#fcf7f0]" :class="dragIndex === index ? 'ring-2 ring-[#f97316]' : ''" @dragstart="onDragStart(index)" @dragover="onDragOver(index, $event)" @dragend="onDragEnd">
								<span class="cursor-grab text-[#b8a693] active:cursor-grabbing"><IconGripVertical :size="18" :stroke="1.8" /></span>
								<span class="grid size-7 shrink-0 place-items-center rounded-full bg-[#f97316]/15 text-xs font-bold text-[#f97316]">{{ index + 1 }}</span>
								<div class="flex size-8 shrink-0 items-center justify-center rounded-xl border border-[rgba(245,225,205,0.1)] bg-[#120e0b]">
									<img v-if="providerIcon(account.provider)" :src="providerIcon(account.provider)" :alt="providerLabel(account.provider)" class="size-4 object-contain" />
								</div>
								<div class="min-w-0 flex-1">
									<TruncateMarquee as="p" class="text-sm font-semibold text-[#fcf7f0]" :text="account.email" />
									<p class="text-xs text-[#b8a693]">{{ providerLabel(account.provider) }} · {{ formatBytesStrict(Number(account.total_space) - Number(account.used_space)) }} {{ t('storage.free').toLowerCase() }}</p>
								</div>
								<div class="flex shrink-0 items-center gap-1">
									<button type="button" class="grid size-8 place-items-center rounded-xl text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0] disabled:opacity-40" :disabled="index === 0" :title="t('allocation.moveUp')" @click="moveAccount(index, -1)"><IconArrowUp :size="16" :stroke="2" /></button>
									<button type="button" class="grid size-8 place-items-center rounded-xl text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0] disabled:opacity-40" :disabled="index === orderedAllocationAccounts.length - 1" :title="t('allocation.moveDown')" @click="moveAccount(index, 1)"><IconArrowDown :size="16" :stroke="2" /></button>
								</div>
							</li>
						</ul>
					</div>

					<div class="mt-5 flex flex-wrap items-center justify-end gap-3">
						<span v-if="allocationSaved" class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400"><IconCheck :size="16" :stroke="2.2" />{{ t('allocation.saved') }}</span>
						<button type="button" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 py-2.5 text-sm font-semibold text-[#fcf7f0] shadow-[0_4px_14px_-2px_rgba(249,115,22,0.4)] transition hover:brightness-110 disabled:opacity-60" :disabled="isSavingAllocation || isAllocationLoading" @click="saveAllocation">
							<IconDeviceFloppy :size="18" :stroke="2" />
							<span>{{ isSavingAllocation ? t('allocation.saving') : t('allocation.save') }}</span>
						</button>
					</div>

					<p v-if="allocationError" class="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{{ allocationError }}</p>
				</template>
			</section>

			<p v-if="actionError || error" class="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{{ actionError || error }}</p>
			<p v-if="actionSuccess" class="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{{ actionSuccess }}</p>

			<div v-if="!accounts.length && !isLoading" class="rounded-3xl border border-dashed border-[rgba(245,225,205,0.14)] bg-[#1e1712] p-8 text-center text-[#b8a693] space-y-3">
				<div class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316]">
					<IconCloud :size="28" :stroke="1.8" />
				</div>
				<p class="font-medium text-[#fcf7f0]">{{ t('storage.noAccounts') }}</p>
				<p class="text-xs text-[#b8a693]">Connect cloud accounts to start aggregating and managing your storage.</p>
				<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
					<button type="button" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-4 py-2 text-xs font-semibold text-[#fcf7f0] shadow-md transition hover:brightness-110" @click="toggleConnectMenu">
						<IconLinkPlus :size="16" :stroke="2" />
						<span>{{ t('storage.connect') }}</span>
					</button>
					<button v-if="authStore.mode === 'local' || !authStore.requiresAuth || authStore.user?.isAdmin" type="button" class="inline-flex items-center gap-2 rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] px-4 py-2 text-xs font-semibold text-[#fcf7f0] transition hover:bg-[#30241c]" @click="openGoogleSetupModal">
						<IconBrandGoogleDrive :size="16" />
						<span>Configure Google Drive</span>
					</button>
					<button v-if="authStore.mode === 'local' || !authStore.requiresAuth || authStore.user?.isAdmin" type="button" class="inline-flex items-center gap-2 rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] px-4 py-2 text-xs font-semibold text-[#fcf7f0] transition hover:bg-[#30241c]" @click="openOneDriveSetupModal">
						<img :src="providerIcon('onedrive')" alt="OneDrive" class="size-4 object-contain" />
						<span>Configure OneDrive</span>
					</button>
				</div>
			</div>

			<GoogleDriveSetupModal v-if="isGoogleSetupModalOpen" :is-admin="authStore.user?.isAdmin !== false" @close="isGoogleSetupModalOpen = false" @configured="loadProviders" @connect="isGoogleSetupModalOpen = false; connectGoogleDrive()" />
			<OneDriveSetupModal v-if="isOneDriveSetupModalOpen" :is-admin="authStore.user?.isAdmin !== false" @close="isOneDriveSetupModalOpen = false" @configured="loadProviders" @connect="isOneDriveSetupModalOpen = false; connectOneDrive()" />
			<MegaConnectModal v-if="isMegaModalOpen" :is-connecting="connectingProvider === 'mega'" :error="actionError" @close="closeMegaModal" @connect="connectMega" />
			<PCloudConnectModal v-if="isPCloudModalOpen" :is-connecting="connectingProvider === 'pcloud'" :error="actionError" @close="closePCloudModal" @connect="connectPCloud" />
			<S3ConnectModal v-if="isS3ModalOpen" :is-connecting="connectingProvider === 's3'" :error="actionError" @close="closeS3Modal" @connect="connectS3" />
		</div>
	</DriveShell>
</template>