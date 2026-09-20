<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconBrandGoogleDrive, IconSettings } from '@tabler/icons-vue';
import { formatBytesStrict } from '../composables/useFormatFile.js';
import { useGoogleDriveConnection } from '../composables/useGoogleDriveConnection.js';
import GoogleDriveSetupModal from './GoogleDriveSetupModal.vue';

const { t } = useI18n();

const props = defineProps({
	accounts: { type: Array, required: true },
});

const googleConnection = useGoogleDriveConnection();

function usagePercent(account) {
	if (!Number(account.total_space)) return 0;
	return Math.min(100, Math.round((Number(account.used_space) / Number(account.total_space)) * 100));
}

onMounted(() => {
	googleConnection.checkStatus();
});
</script>

<template>
	<section class="rounded-[28px] border border-[#e6ebf2] bg-white p-6 shadow-sm">
		<div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a73e8]">{{ t('storagePanel.integratedAccounts') }}</p>
				<h2 class="mt-2 text-2xl font-semibold text-[#202124]">{{ t('storagePanel.quotaOverview') }}</h2>
			</div>
			<div class="flex items-center gap-2">
				<button v-if="googleConnection.isAdmin.value && !googleConnection.isConfigured.value" type="button" class="inline-flex items-center gap-1.5 rounded-full border border-[#dfe6ef] bg-[#f8faff] px-3.5 py-2.5 text-xs font-semibold text-[#1a73e8] hover:bg-[#e8f0fe]" title="Configure Google Drive Setup" @click="googleConnection.openSetupModal">
					<IconSettings :size="16" />
					<span>Configure</span>
				</button>
				<button type="button" class="inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" :disabled="googleConnection.isConnecting.value" @click="googleConnection.connect">
					<IconBrandGoogleDrive :size="18" :stroke="2" />
					{{ googleConnection.isConnecting.value ? t('storagePanel.connecting') : t('storagePanel.connectGoogle') }}
				</button>
			</div>
		</div>

		<p v-if="googleConnection.connectionError.value" class="mb-4 rounded-2xl bg-[#fce8e6] px-4 py-3 text-sm text-[#c5221f]">
			{{ googleConnection.connectionError.value }}
		</p>

		<GoogleDriveSetupModal v-if="googleConnection.isSetupModalOpen.value" :is-admin="googleConnection.isAdmin.value" @close="googleConnection.closeSetupModal" @configured="googleConnection.onConfigured" @connect="googleConnection.closeSetupModal(); googleConnection.connect()" />

		<div class="grid gap-4">
			<article v-for="account in props.accounts" :key="account.id" class="rounded-3xl border border-[#e6ebf2] bg-[#fbfcff] p-5">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<strong class="block text-base font-semibold text-[#202124]">{{ account.email }}</strong>
						<p class="mt-1 text-sm text-[#5f6368]">{{ account.provider }}</p>
					</div>
					<span class="rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-semibold capitalize text-[#188038]">{{ account.status }}</span>
				</div>

				<div class="mt-4 h-2 overflow-hidden rounded-full bg-[#dfe6ef]">
					<span class="block h-full rounded-full bg-[#1a73e8]" :style="{ width: `${usagePercent(account)}%` }"></span>
				</div>

				<div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[#5f6368]">
					<span>{{ formatBytesStrict(account.used_space) }} {{ t('storagePanel.used') }}</span>
					<span>{{ formatBytesStrict(account.free_space) }} {{ t('storagePanel.free') }}</span>
				</div>
			</article>

			<div v-if="!props.accounts.length" class="rounded-3xl border border-[#e6ebf2] bg-[#fbfcff] p-5 text-sm text-[#5f6368] space-y-1">
				<p class="font-medium text-[#202124]">{{ t('storagePanel.noAccounts') }}</p>
				<p class="text-xs text-[#5f6368]">Connect Google Drive to see your storage usage.</p>
			</div>
		</div>
	</section>
</template>
