<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconFolder, IconStar, IconStarFilled, IconEye, IconDownload, IconEdit, IconInfoCircle, IconTrash } from '@tabler/icons-vue';

const { t } = useI18n();

const props = defineProps({
	contextMenuRef: { type: Object, default: null },
	contextMenu: { type: Object, required: true },
	selectedCount: { type: Number, required: true },
	primarySelectedFile: { type: Object, default: null },
	canPreview: { type: Boolean, default: false },
	canToggleStar: { type: Boolean, default: false },
	isPrimaryStarred: { type: Boolean, default: false },
	canDownload: { type: Boolean, default: false },
	canRename: { type: Boolean, default: false },
	canShowDetails: { type: Boolean, default: true },
	canOpenFolder: { type: Boolean, default: false },
	canDelete: { type: Boolean, default: true },
});

const emit = defineEmits(['open-folder', 'preview', 'toggle-star', 'download', 'rename', 'show-details', 'delete', 'close']);

const showOpen = computed(() => props.canOpenFolder && props.selectedCount === 1 && Boolean(props.primarySelectedFile?.is_folder));
const showPreview = computed(() => props.selectedCount === 1 && !props.primarySelectedFile?.is_folder);
const showStar = computed(() => props.canToggleStar);

function handleOpen() {
	emit('open-folder');
}
function handlePreview() {
	emit('preview', props.primarySelectedFile);
}
function handleStar() {
	emit('toggle-star');
}
function handleDownload() {
	emit('download');
}
function handleRename() {
	emit('rename');
}
function handleDetails() {
	emit('show-details');
}
function handleDelete() {
	emit('delete');
}
</script>

<template>
	<div v-if="contextMenu.visible" ref="contextMenuRef" class="fixed z-50 min-w-[220px] overflow-hidden rounded-2xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] py-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl" :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }" @click.stop @contextmenu.stop>
		<button v-if="showOpen" type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c]" @click="handleOpen">
			<IconFolder :size="17" :stroke="2" class="text-[#f97316]" />
			<span>{{ t('common.open') }}</span>
		</button>
		<button v-if="showPreview" type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c] disabled:cursor-not-allowed disabled:opacity-50" :disabled="!canPreview" @click="handlePreview">
			<IconEye :size="17" :stroke="2" class="text-[#f97316]" />
			<span>{{ t('drive.preview') }}</span>
		</button>
		<button v-if="showStar" type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c]" @click="handleStar">
			<component :is="isPrimaryStarred ? IconStarFilled : IconStar" :size="17" :stroke="isPrimaryStarred ? 0 : 2" :class="isPrimaryStarred ? 'text-amber-400' : 'text-[#b8a693]'" />
			<span>{{ isPrimaryStarred ? t('drive.unstar') : t('drive.star') }}</span>
		</button>
		<button type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c] disabled:cursor-not-allowed disabled:opacity-50" :disabled="!canDownload" @click="handleDownload">
			<IconDownload :size="17" :stroke="2" class="text-[#b8a693]" />
			<span>{{ t('common.download') }}</span>
		</button>
		<button v-if="canRename" type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c] disabled:cursor-not-allowed disabled:opacity-50" :disabled="!canRename" @click="handleRename">
			<IconEdit :size="17" :stroke="2" class="text-[#b8a693]" />
			<span>{{ t('common.rename') }}</span>
		</button>
		<button type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c] disabled:cursor-not-allowed disabled:opacity-50" :disabled="!canShowDetails" @click="handleDetails">
			<IconInfoCircle :size="17" :stroke="2" class="text-[#b8a693]" />
			<span>{{ t('drive.details') }}</span>
		</button>
		<button v-if="canDelete" type="button" class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/20 hover:text-red-300" @click="handleDelete">
			<IconTrash :size="17" :stroke="2" />
			<span>{{ t('common.delete') }}</span>
		</button>
	</div>
</template>
