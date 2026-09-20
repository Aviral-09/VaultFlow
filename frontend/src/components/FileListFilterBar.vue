<script setup>
import { IconChevronDown, IconCloud, IconCloudFilled, IconCheck, IconSearch, IconX } from '@tabler/icons-vue';
import { useI18n } from 'vue-i18n';
import { getTypeFilterIcon } from '../composables/useFileType.js';
import { providerIcon, providerLabel } from '../composables/useFormatFile.js';

const { t } = useI18n();

const props = defineProps({
	typeOptions: { type: Array, required: true },
	ownerOptions: { type: Array, required: true },
	updatedOptions: { type: Array, required: true },
	selectedTypeFilter: { type: String, required: true },
	selectedOwnerFilter: { type: String, required: true },
	selectedUpdatedFilter: { type: String, required: true },
	activeFilterMenu: { type: [String, null], default: null },
	searchTerm: { type: String, default: '' },
});

const emit = defineEmits([
	'toggle-filter-menu',
	'apply-filter',
	'clear-filter',
	'update:searchTerm',
]);

function getFilterLabel(type, value) {
	if (type === 'type') return props.typeOptions.find((o) => o.value === value)?.label || t('filters.type');
	if (type === 'updated') return props.updatedOptions.find((o) => o.value === value)?.label || t('filters.modified');
	return value;
}

function renderOwnerLabel(value) {
	if (value === 'all') return t('filters.allOwners');
	const owner = props.ownerOptions.find((o) => o.key === value);
	if (!owner) return t('filters.allOwners');
	return `${owner.email} · ${providerLabel(owner.provider)}`;
}

function isFilterActive(type) {
	if (type === 'type') return props.selectedTypeFilter !== 'all';
	if (type === 'owner') return props.selectedOwnerFilter !== 'all';
	if (type === 'updated') return props.selectedUpdatedFilter !== 'all';
	return false;
}
</script>

<template>
	<div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
		<div class="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
			<div class="relative">
				<button type="button" class="inline-flex items-center gap-2 rounded-2xl border border-[rgba(245,225,205,0.12)] bg-[#261d17] px-3.5 py-2 text-sm font-medium text-[#fcf7f0] transition hover:bg-[#30241c]" @click.stop="emit('toggle-filter-menu', 'type')">
					<span>{{ getFilterLabel('type', selectedTypeFilter) }}</span>
					<IconX v-if="isFilterActive('type')" :size="16" :stroke="2" class="text-[#b8a693] transition hover:text-[#f97316]" @click.stop="emit('clear-filter', 'type')" />
					<IconChevronDown v-else :size="16" :stroke="2" class="text-[#b8a693]" />
				</button>
				<div v-if="activeFilterMenu === 'type'" class="absolute left-0 top-full z-30 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
					<button v-for="option in typeOptions" :key="option.value" type="button" class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c]" @click="emit('apply-filter', 'type', option.value)">
						<span class="flex items-center gap-2">
							<component :is="getTypeFilterIcon(option.value, selectedTypeFilter === option.value)" :size="16" :stroke="selectedTypeFilter === option.value ? 0 : 1.8" :class="selectedTypeFilter === option.value ? 'text-[#f97316]' : 'text-[#b8a693]'" />
							<span>{{ option.label }}</span>
						</span>
						<IconCheck v-if="selectedTypeFilter === option.value" :size="16" :stroke="2" class="text-[#f97316]" />
					</button>
				</div>
			</div>

			<div class="relative">
				<button type="button" class="inline-flex items-center gap-2 rounded-2xl border border-[rgba(245,225,205,0.12)] bg-[#261d17] px-3.5 py-2 text-sm font-medium text-[#fcf7f0] transition hover:bg-[#30241c]" @click.stop="emit('toggle-filter-menu', 'owner')">
					<span>{{ renderOwnerLabel(selectedOwnerFilter) }}</span>
					<IconX v-if="isFilterActive('owner')" :size="16" :stroke="2" class="text-[#b8a693] transition hover:text-[#f97316]" @click.stop="emit('clear-filter', 'owner')" />
					<IconChevronDown v-else :size="16" :stroke="2" class="text-[#b8a693]" />
				</button>
				<div v-if="activeFilterMenu === 'owner'" class="absolute left-0 top-full z-30 mt-2 min-w-[260px] overflow-hidden rounded-2xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
					<button type="button" class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c]" @click="emit('apply-filter', 'owner', 'all')">
						<span class="flex min-w-0 items-center gap-2">
							<span class="flex size-5 shrink-0 items-center justify-center">
								<component :is="selectedOwnerFilter === 'all' ? IconCloudFilled : IconCloud" :size="16" :stroke="selectedOwnerFilter === 'all' ? 0 : 1.8" :class="selectedOwnerFilter === 'all' ? 'text-[#f97316]' : 'text-[#b8a693]'" />
							</span>
							<span>{{ t('filters.allOwners') }}</span>
						</span>
						<IconCheck v-if="selectedOwnerFilter === 'all'" :size="16" :stroke="2" class="text-[#f97316]" />
					</button>
					<button v-for="owner in ownerOptions" :key="owner.key" type="button" class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c]" @click="emit('apply-filter', 'owner', owner.key)">
						<span class="flex min-w-0 items-center gap-2">
							<div v-if="providerIcon(owner.provider)" class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#120e0b]">
								<img :src="providerIcon(owner.provider)" :alt="providerLabel(owner.provider)" class="size-3.5 object-contain" />
							</div>
							<div v-else class="size-5 shrink-0"></div>
							<span class="flex min-w-0 flex-col">
								<span class="truncate">{{ owner.email }}</span>
							</span>
						</span>
						<IconCheck v-if="selectedOwnerFilter === owner.key" :size="16" :stroke="2" class="text-[#f97316]" />
					</button>
				</div>
			</div>

			<div class="relative">
				<button type="button" class="inline-flex items-center gap-2 rounded-2xl border border-[rgba(245,225,205,0.12)] bg-[#261d17] px-3.5 py-2 text-sm font-medium text-[#fcf7f0] transition hover:bg-[#30241c]" @click.stop="emit('toggle-filter-menu', 'updated')">
					<span>{{ getFilterLabel('updated', selectedUpdatedFilter) }}</span>
					<IconX v-if="isFilterActive('updated')" :size="16" :stroke="2" class="text-[#b8a693] transition hover:text-[#f97316]" @click.stop="emit('clear-filter', 'updated')" />
					<IconChevronDown v-else :size="16" :stroke="2" class="text-[#b8a693]" />
				</button>
				<div v-if="activeFilterMenu === 'updated'" class="absolute left-0 top-full z-30 mt-2 min-w-[240px] overflow-hidden rounded-2xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
					<button v-for="option in updatedOptions" :key="option.value" type="button" class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-[#fcf7f0] transition hover:bg-[#30241c]" @click="emit('apply-filter', 'updated', option.value)">
						<span>{{ option.label }}</span>
						<IconCheck v-if="selectedUpdatedFilter === option.value" :size="16" :stroke="2" class="text-[#f97316]" />
					</button>
				</div>
			</div>
		</div>

		<div class="relative ml-auto w-full min-w-0 shrink-0 sm:ml-0 sm:w-[280px]">
			<IconSearch :size="18" :stroke="2" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b8a693]" />
			<input class="h-10 w-full rounded-2xl border border-[rgba(245,225,205,0.12)] bg-[#1e1712] pl-11 pr-4 text-sm text-[#fcf7f0] outline-none transition focus:border-[#f97316] placeholder:text-[#857362]" type="search" :value="searchTerm" :placeholder="t('drive.searchInFolder')" @input="emit('update:searchTerm', $event.target.value)" />
		</div>
	</div>
</template>
