<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconStarFilled } from '@tabler/icons-vue';
import TruncateMarquee from './TruncateMarquee.vue';
import { formatBytes, formatDate, getModifiedTime, providerIcon, providerLabel } from '../composables/useFormatFile.js';
import { getFileIcon } from '../composables/useFileType.js';

const { t } = useI18n();

const props = defineProps({
	item: { type: Object, required: true },
	selected: { type: Boolean, default: false },
	nameField: { type: String, default: 'file_name' },
	showStar: { type: Boolean, default: true },
	highlighted: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'open', 'contextmenu']);

const displayName = computed(() => {
	if (props.nameField === 'display_name') {
		return props.item.display_name || props.item.file_name || '';
	}
	return props.item[props.nameField] || '';
});

function handleClick(event) {
	emit('select', event);
}

function handleDblClick(event) {
	emit('open', event);
}

function handleContextMenu(event) {
	emit('contextmenu', event);
}
</script>

<template>
	<div class="group select-none rounded-2xl border p-4.5 transition hover:-translate-y-0.5" :class="selected ? 'border-[#f97316] bg-[#f97316]/15 shadow-[0_8px_24px_rgba(249,115,22,0.2)]' : highlighted ? 'border-amber-400 bg-amber-500/15 shadow-md' : 'border-[rgba(245,225,205,0.09)] bg-[#261d17] hover:border-[#f97316]/40 hover:bg-[#30241c]'" :data-file-id="item.id" @click="handleClick" @dblclick="handleDblClick" @contextmenu="handleContextMenu">
		<button type="button" class="flex w-full flex-col items-start gap-4 text-left">
			<div class="flex w-full items-start justify-between gap-3">
				<div class="grid size-11 place-items-center rounded-xl transition" :class="selected ? 'bg-[#f97316]/30 text-[#f97316]' : highlighted ? 'bg-amber-400/30 text-amber-300' : 'bg-[#120e0b] text-[#f97316]'">
					<component :is="getFileIcon(item, selected || highlighted)" :size="22" :stroke="selected || highlighted ? 0 : 1.8" class="transition-transform duration-200 group-hover:scale-110" />
				</div>
				<IconStarFilled v-if="showStar && item.is_starred && item.capabilities?.starred" :size="16" :stroke="0" class="shrink-0 text-amber-400" />
			</div>
			<div class="min-w-0">
				<TruncateMarquee as="p" class="text-sm font-semibold text-[#fcf7f0]" :text="displayName" />
				<div class="mt-1 flex min-w-0 items-center gap-2 text-xs text-[#b8a693]">
					<div v-if="providerIcon(item.provider)" class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#120e0b]">
						<img :src="providerIcon(item.provider)" :alt="providerLabel(item.provider)" class="size-3.5 object-contain" />
					</div>
					<TruncateMarquee as="p" class="min-w-0" :text="item.email || t('drive.noOwner')" />
				</div>
			</div>
			<div class="flex w-full items-center justify-between text-xs text-[#b8a693]">
				<span>{{ formatDate(getModifiedTime(item)) }}</span>
				<span>{{ item.is_folder ? t('drive.folder') : formatBytes(item.size) }}</span>
			</div>
		</button>
	</div>
</template>
