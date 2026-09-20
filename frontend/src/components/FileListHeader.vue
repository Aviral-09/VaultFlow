<script setup>
import { useI18n } from 'vue-i18n';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-vue';

const { t } = useI18n();

const props = defineProps({
	sortable: { type: Boolean, default: false },
	sortBy: { type: String, default: 'file_name' },
	sortDirection: { type: String, default: 'desc' },
});

const emit = defineEmits(['sort']);

function handleSort(field) {
	if (!props.sortable) return;
	emit('sort', field);
}

function sortIndicator(field) {
	if (props.sortBy !== field) return null;
	return props.sortDirection === 'asc' ? IconChevronUp : IconChevronDown;
}

function indicatorFor(field) {
	return sortIndicator(field);
}
</script>

<template>
	<div class="sticky top-0 z-10 grid min-h-11 grid-cols-[minmax(260px,2fr)_minmax(180px,1.1fr)_minmax(150px,1fr)_140px] items-center gap-3 border-b border-[rgba(245,225,205,0.08)] bg-[#17120e] px-[18px] text-[13px] font-semibold text-[#b8a693] backdrop-blur-md">
		<template v-if="sortable">
			<button type="button" class="flex items-center gap-1 text-left transition hover:text-[#f97316]" @click="handleSort('file_name')">
				<span>{{ t('drive.sortByName') }}</span>
				<component :is="indicatorFor('file_name')" v-if="indicatorFor('file_name')" :size="14" :stroke="2" class="text-[#f97316]" />
			</button>
			<button type="button" class="flex items-center gap-1 text-left transition hover:text-[#f97316]" @click="handleSort('email')">
				<span>{{ t('home.fileOwner') }}</span>
				<component :is="indicatorFor('email')" v-if="indicatorFor('email')" :size="14" :stroke="2" class="text-[#f97316]" />
			</button>
			<button type="button" class="flex items-center gap-1 text-left transition hover:text-[#f97316]" @click="handleSort('updated_at')">
				<span>{{ t('home.fileModified') }}</span>
				<component :is="indicatorFor('updated_at')" v-if="indicatorFor('updated_at')" :size="14" :stroke="2" class="text-[#f97316]" />
			</button>
			<button type="button" class="flex items-center gap-1 text-left transition hover:text-[#f97316]" @click="handleSort('size')">
				<span>{{ t('drive.size') }}</span>
				<component :is="indicatorFor('size')" v-if="indicatorFor('size')" :size="14" :stroke="2" class="text-[#f97316]" />
			</button>
		</template>
		<template v-else>
			<span>{{ t('drive.sortByName') }}</span>
			<span>{{ t('home.fileOwner') }}</span>
			<span>{{ t('home.fileModified') }}</span>
			<span>{{ t('drive.size') }}</span>
		</template>
	</div>
</template>
