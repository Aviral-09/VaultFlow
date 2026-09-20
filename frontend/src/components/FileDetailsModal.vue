<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconX } from '@tabler/icons-vue';
import {
	formatBytes,
	formatDate,
	getCreatedTime,
	getModifiedTime,
	providerLabel as defaultProviderLabel,
} from '../composables/useFormatFile.js';

const props = defineProps({
	file: { type: Object, default: null },
	isOpen: { type: Boolean, default: false },
	isLoading: { type: Boolean, default: false },
	locationFallback: { type: String, default: '' },
	providerLabelFn: { type: Function, default: null },
	isFolder: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);

const { t } = useI18n();

const isVisible = computed(() => Boolean(props.isOpen && props.file));
const providerLabel = computed(() => {
	const fn = typeof props.providerLabelFn === 'function' ? props.providerLabelFn : defaultProviderLabel;
	return fn(props.file?.provider) || props.file?.provider || '—';
});
const fileName = computed(() => props.file?.name || props.file?.file_name || '—');
const mimeType = computed(() => props.file?.mime_type || props.file?.mimeType || '—');
const owner = computed(() => props.file?.owner_email || props.file?.email || '—');
const remoteId = computed(() => props.file?.remote_file_id || props.file?.id || '—');
const location = computed(() => props.file?.virtual_path || props.locationFallback || '—');
const title = computed(() => (props.isFolder ? `${t('drive.details')} ${t('drive.folder')}` : t('drive.details')));

function onBackdropClick() {
	emit('close');
}
</script>

<template>
	<div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-[#120e0b]/80 px-4 backdrop-blur-md" @click="onBackdropClick">
		<div class="w-full max-w-lg rounded-3xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] p-6 text-[#fcf7f0] shadow-[0_24px_60px_rgba(0,0,0,0.9)]" @click.stop>
			<div class="flex items-start justify-between gap-4">
				<div>
					<h3 class="text-xl font-bold text-[#fcf7f0]">{{ title }}</h3>
					<p class="mt-1 text-sm text-[#b8a693]">{{ t('drive.metadataDescription') }}</p>
				</div>
				<button type="button" class="grid size-9 place-items-center rounded-xl text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0]" :title="t('common.close')" @click="emit('close')">
					<IconX :size="18" :stroke="2" />
				</button>
			</div>

			<div v-if="props.isLoading" class="mt-6 text-sm text-[#b8a693]">
				{{ t('common.loading') }}
			</div>

			<dl v-else class="mt-6 grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 text-sm">
				<dt class="text-[#b8a693]">{{ t('common.name') }}</dt>
				<dd class="font-semibold text-[#fcf7f0]">{{ fileName }}</dd>
				<dt class="text-[#b8a693]">{{ t('drive.type') }}</dt>
				<dd class="text-[#fcf7f0]">{{ mimeType }}</dd>
				<dt class="text-[#b8a693]">{{ t('drive.size') }}</dt>
				<dd class="text-[#fcf7f0]">
					<span v-if="props.isFolder">—</span>
					<span v-else>{{ formatBytes(props.file?.size) }}</span>
				</dd>
				<dt class="text-[#b8a693]">{{ t('drive.owner') }}</dt>
				<dd class="text-[#fcf7f0]">{{ owner }}</dd>
				<dt class="text-[#b8a693]">{{ t('drive.provider') || 'Provider' }}</dt>
				<dd class="text-[#fcf7f0]">{{ providerLabel }}</dd>
				<dt class="text-[#b8a693]">{{ t('drive.created') }}</dt>
				<dd class="text-[#fcf7f0]">{{ formatDate(getCreatedTime(props.file)) }}</dd>
				<dt class="text-[#b8a693]">{{ t('drive.modified') }}</dt>
				<dd class="text-[#fcf7f0]">{{ formatDate(getModifiedTime(props.file)) }}</dd>
				<dt class="text-[#b8a693]">{{ t('drive.location') }}</dt>
				<dd class="break-all text-[#fcf7f0]">{{ location }}</dd>
				<dt class="text-[#b8a693]">{{ t('drive.remoteId') || 'Remote ID' }}</dt>
				<dd class="break-all text-[#b8a693]">{{ remoteId }}</dd>
			</dl>
		</div>
	</div>
</template>
