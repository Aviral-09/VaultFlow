<script setup>
import { computed } from 'vue';
import { IconStarFilled } from '@tabler/icons-vue';
import TruncateMarquee from './TruncateMarquee.vue';
import { formatBytes, formatDate, getModifiedTime, providerIcon, providerLabel } from '../composables/useFormatFile.js';
import { getFileIcon } from '../composables/useFileType.js';

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
	<div class="group grid min-h-[52px] cursor-default select-none grid-cols-[minmax(260px,2fr)_minmax(180px,1.1fr)_minmax(150px,1fr)_140px] items-center gap-3 border-t border-[rgba(245,225,205,0.06)] px-[18px] transition first:border-t-0" :class="selected ? 'bg-[#f97316]/15 text-[#fcf7f0] shadow-[inset_4px_0_0_#f97316]' : highlighted ? 'bg-amber-500/15 text-[#fcf7f0] shadow-[inset_4px_0_0_#f59e0b]' : 'hover:bg-[#261d17] text-[#e8dbcc]'" :data-file-id="item.id" @click="handleClick" @dblclick="handleDblClick" @contextmenu="handleContextMenu">
		<div class="flex min-w-0 items-center gap-2.5 text-[#fcf7f0]">
			<component :is="getFileIcon(item, selected || highlighted)" :size="18" :stroke="selected || highlighted ? 0 : 1.8" class="transition-transform duration-200 group-hover:scale-110" :class="selected ? 'text-[#f97316] drop-shadow-sm' : highlighted ? 'text-amber-400 drop-shadow-sm' : 'text-[#f97316]'" />
			<TruncateMarquee :text="displayName" />
			<IconStarFilled v-if="showStar && item.is_starred && item.capabilities?.starred" :size="14" :stroke="0" class="shrink-0 text-amber-400" />
		</div>
		<div class="flex min-w-0 items-center gap-2 text-[#b8a693]">
			<div v-if="providerIcon(item.provider)" class="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#120e0b]">
				<img :src="providerIcon(item.provider)" :alt="providerLabel(item.provider)" class="size-3.5 object-contain" />
			</div>
			<TruncateMarquee class="min-w-0 text-xs" :text="item.email" />
		</div>
		<span class="text-xs text-[#b8a693]">{{ formatDate(getModifiedTime(item)) }}</span>
		<span class="text-xs text-[#b8a693]">{{ item.is_folder ? '—' : formatBytes(item.size) }}</span>
	</div>
</template>
