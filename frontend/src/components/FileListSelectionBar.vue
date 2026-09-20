<script setup>
import { IconX, IconEye, IconStar, IconStarFilled, IconDownload, IconEdit, IconInfoCircle, IconTrash } from '@tabler/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
	selectedCount: { type: Number, required: true },
	canPreview: { type: Boolean, default: false },
	canToggleStar: { type: Boolean, default: false },
	isPrimaryStarred: { type: Boolean, default: false },
	canDownload: { type: Boolean, default: false },
	canRename: { type: Boolean, default: false },
	canShowDetails: { type: Boolean, default: true },
	canDelete: { type: Boolean, default: true },
	primaryFile: { type: Object, default: null },
});

const emit = defineEmits([
	'clear',
	'preview',
	'toggle-star',
	'download',
	'rename',
	'show-details',
	'delete',
]);
</script>

<template>
	<div class="flex flex-wrap items-center gap-1.5 rounded-full border border-[rgba(245,225,205,0.14)] bg-[#261d17] px-2 py-1 text-[#fcf7f0] shadow-lg">
		<button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0]" :title="t('drive.deselectAll')" @click="emit('clear')">
			<IconX :size="18" :stroke="2" />
		</button>
		<span class="pr-2 text-sm font-bold text-[#f97316]">{{ selectedCount }} {{ t('drive.selected') }}</span>

		<slot name="prefix" :primary="primaryFile" />

		<button v-if="selectedCount === 1" type="button" class="inline-flex size-9 items-center justify-center rounded-full text-[#b8a693] transition disabled:cursor-not-allowed disabled:opacity-45 enabled:hover:bg-[#30241c] enabled:hover:text-[#fcf7f0]" :title="t('drive.preview')" :disabled="!canPreview" @click="emit('preview', primaryFile)">
			<IconEye :size="18" :stroke="2" />
		</button>

		<button v-if="canToggleStar" type="button" class="inline-flex size-9 items-center justify-center rounded-full text-[#b8a693] transition enabled:hover:bg-[#30241c] enabled:hover:text-[#fcf7f0]" :title="isPrimaryStarred ? t('drive.unstar') : t('drive.star')" @click="emit('toggle-star')">
			<component :is="isPrimaryStarred ? IconStarFilled : IconStar" :size="18" :stroke="isPrimaryStarred ? 0 : 2" :class="isPrimaryStarred ? 'text-amber-400' : ''" />
		</button>

		<button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-[#b8a693] transition disabled:cursor-not-allowed disabled:opacity-45 enabled:hover:bg-[#30241c] enabled:hover:text-[#fcf7f0]" :title="t('common.download')" :disabled="!canDownload" @click="emit('download')">
			<IconDownload :size="18" :stroke="2" />
		</button>

		<button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-[#b8a693] transition disabled:cursor-not-allowed disabled:opacity-45 enabled:hover:bg-[#30241c] enabled:hover:text-[#fcf7f0]" :title="t('common.rename')" :disabled="!canRename" @click="emit('rename')">
			<IconEdit :size="18" :stroke="2" />
		</button>

		<button type="button" class="inline-flex size-9 items-center justify-center rounded-full text-[#b8a693] transition disabled:cursor-not-allowed disabled:opacity-45 enabled:hover:bg-[#30241c] enabled:hover:text-[#fcf7f0]" :title="t('drive.details')" :disabled="!canShowDetails || selectedCount !== 1" @click="emit('show-details')">
			<IconInfoCircle :size="18" :stroke="2" />
		</button>

		<slot name="suffix" :primary="primaryFile" />

		<button v-if="canDelete" type="button" class="inline-flex size-9 items-center justify-center rounded-full text-red-400 transition hover:bg-red-500/20 hover:text-red-300" :title="t('common.delete')" @click="emit('delete')">
			<IconTrash :size="18" :stroke="2" />
		</button>
	</div>
</template>
