<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { IconChevronRight, IconFolder } from '@tabler/icons-vue';
import DriveShell from '../components/DriveShell.vue';
import FloatingProgressToast from '../components/FloatingProgressToast.vue';
import FileListFilterBar from '../components/FileListFilterBar.vue';
import FileListSelectionBar from '../components/FileListSelectionBar.vue';
import FileListViewModeToggle from '../components/FileListViewModeToggle.vue';
import FileListHeader from '../components/FileListHeader.vue';
import FileListRow from '../components/FileListRow.vue';
import FileListGridCard from '../components/FileListGridCard.vue';
import FileListContextMenu from '../components/FileListContextMenu.vue';
import FilePreviewModal from '../components/FilePreviewModal.vue';
import FileDetailsModal from '../components/FileDetailsModal.vue';
import LoadingState from '../components/LoadingState.vue';
import { useIncrementalRender } from '../composables/useIncrementalRender';
import { useFileListView } from '../composables/useFileListView';
import { useAutoRefresh } from '../composables/useAutoRefresh.js';
import { providerLabel } from '../composables/useFormatFile.js';
import { useRecencyGroups } from '../composables/useRecencyGroups.js';
import { useUploadQueueStore } from '../stores/uploadQueue';
import { api } from '../services/api';

const { t } = useI18n();
const uploadQueueStore = useUploadQueueStore();
const { uploads, totalProgress } = storeToRefs(uploadQueueStore);

const folderStack = ref([]);
const navigating = ref(false);

const view = useFileListView({
	loadFiles: async () => {
		const { data } = await api.listSharedWithMeFiles();
		return Array.isArray(data) ? data : [];
	},
	uploadQueueStore,
});

const {
	loading,
	errorMessage,
	searchTerm,
	isGridView,
	activeFilterMenu,
	selectedTypeFilter,
	selectedOwnerFilter,
	selectedUpdatedFilter,
	typeOptions,
	updatedOptions,
	ownerOptions,
	toggleFilterMenu,
	applyFilter,
	clearFilter,
	sortedFiles,
	selectedCount,
	primarySelectedFile,
	isSelected,
	openContextMenu,
	clearSelection,
	selectItem,
	canDownloadSelection,
	canRenameSelection,
	canToggleStarSelection,
	isPrimarySelectedStarred,
	canOpenSelection,
	canPreviewSelection,
	previewFile,
	isPreviewOpen,
	isPreviewLoading,
	openPreview,
	closePreview,
	handlePreviewLoaded,
	handlePreviewFailed,
	detailsFile,
	isDetailsOpen,
	closeDetails,
	downloadSelection,
	renameSelectedFile,
	deleteSelectedFile,
	toggleSelectedFileStar,
	showSelectedFileDetails,
	contextMenu,
	contextMenuRef,
	closeContextMenu,
	actionInProgress,
	actionLabel,
} = view;

const breadcrumbItems = computed(() => [
	{ label: t('nav.shared'), index: -1 },
	...folderStack.value.map((item, index) => ({ label: item.file_name, index })),
]);

const { groups: groupedFiles } = useRecencyGroups(sortedFiles, t);

const { visibleItems: renderedSortedFiles, handleScroll: handleListScroll } = useIncrementalRender(sortedFiles, {
	initialCount: 80,
	step: 80,
	threshold: 240,
});

const renderedGroupedFiles = computed(() => {
	const visibleIds = new Set(renderedSortedFiles.value.map((file) => file.id));
	return groupedFiles.value
		.map((group) => ({
			...group,
			items: group.items.filter((file) => visibleIds.has(file.id)),
		}))
		.filter((group) => group.items.length);
});

async function loadCurrentFolder(folder) {
	navigating.value = true;
	loading.value = true;
	errorMessage.value = '';
	view.files.value = [];
	try {
		const { data } = folder
			? await api.listSharedFolderChildren(folder.id)
			: await api.listSharedWithMeFiles();
		view.files.value = Array.isArray(data) ? data : [];
	} catch (error) {
		errorMessage.value = errorMessage.value || error.message;
	} finally {
		loading.value = false;
		navigating.value = false;
	}
}

async function refreshShared() {
	const currentFolder = folderStack.value.at(-1);
	await loadCurrentFolder(currentFolder);
}

async function openFolder(file) {
	if (!file?.is_folder) return;
	closeContextMenu();
	clearSelection();
	folderStack.value = [...folderStack.value, file];
	navigating.value = true;
	await loadCurrentFolder(file);
}

async function navigateToBreadcrumb(index) {
	closeContextMenu();
	clearSelection();
	if (index < 0) {
		folderStack.value = [];
		navigating.value = true;
		await loadCurrentFolder(null);
		return;
	}
	folderStack.value = folderStack.value.slice(0, index + 1);
	navigating.value = true;
	await loadCurrentFolder(folderStack.value.at(-1));
}

function openSelectedItem() {
	const file = primarySelectedFile.value || contextMenu.value.file;
	if (file?.is_folder) openFolder(file);
}

function openItemOnDoubleClick(file) {
	if (file.is_folder) {
		openFolder(file);
		return;
	}
	if (view.canPreview(file)) openPreview(file);
}

useAutoRefresh(refreshShared, { intervalMs: 30000 });
</script>

<template>
	<DriveShell current-section="shared">
		<div class="relative min-h-[calc(100vh-84px)] rounded-3xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-6 text-[#fcf7f0] shadow-xl sm:p-8" @click="clearSelection">
			<div class="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<h1 class="m-0">
					<nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1 text-2xl font-bold text-[#fcf7f0]">
						<template v-for="(crumb, breadcrumbIndex) in breadcrumbItems" :key="`${crumb.index}:${crumb.label}`">
							<button type="button" class="max-w-[220px] truncate leading-tight transition hover:text-[#f97316]" @click="navigateToBreadcrumb(crumb.index)">{{ crumb.label }}</button>
							<IconChevronRight v-if="breadcrumbIndex < breadcrumbItems.length - 1" :size="18" :stroke="2" class="mx-1 text-[#b8a693]" />
						</template>
					</nav>
				</h1>
				<FileListViewModeToggle v-model="isGridView" />
			</div>

			<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<FileListSelectionBar v-if="selectedCount" :selected-count="selectedCount" :can-preview="canPreviewSelection" :can-toggle-star="canToggleStarSelection" :is-primary-starred="isPrimarySelectedStarred" :can-download="canDownloadSelection" :can-rename="false" :can-delete="false" :primary-file="primarySelectedFile" @clear="clearSelection" @preview="openPreview" @toggle-star="toggleSelectedFileStar" @download="downloadSelection" @rename="renameSelectedFile" @show-details="showSelectedFileDetails" @delete="deleteSelectedFile">
					<template #prefix="{ primary }">
						<button v-if="primary?.is_folder && selectedCount === 1" type="button" class="inline-flex size-9 items-center justify-center rounded-full transition enabled:hover:bg-[#f97316]/20" :title="t('common.open')" @click="openSelectedItem">
							<IconFolder :size="18" :stroke="2" />
						</button>
					</template>
				</FileListSelectionBar>
				<FileListFilterBar v-else :type-options="typeOptions" :owner-options="ownerOptions" :updated-options="updatedOptions" :selected-type-filter="selectedTypeFilter" :selected-owner-filter="selectedOwnerFilter" :selected-updated-filter="selectedUpdatedFilter" :active-filter-menu="activeFilterMenu" v-model:search-term="searchTerm" @toggle-filter-menu="toggleFilterMenu" @apply-filter="applyFilter" @clear-filter="clearFilter" />
			</div>

			<p v-if="errorMessage" class="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{{ errorMessage }}</p>

			<div v-if="!isGridView" class="relative">
				<div class="custom-scrollbar overflow-x-auto rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712]">
					<div class="min-w-[760px]">
						<div class="custom-scrollbar max-h-[min(70vh,780px)] overflow-y-auto overflow-x-hidden" @scroll="handleListScroll">
							<FileListHeader :sortable="false" />

							<template v-for="group in renderedGroupedFiles" :key="group.key">
								<div class="sticky top-11 z-[1] border-b border-t border-[rgba(245,225,205,0.08)] bg-[#17120e] px-[18px] py-2 text-xs font-bold uppercase tracking-wider text-[#f97316]">{{ group.label }}</div>
								<FileListRow v-for="item in group.items" :key="item.id" :item="item" :selected="isSelected(item)" @select="(event) => selectItem(event, item)" @open="openItemOnDoubleClick(item)" @contextmenu="(event) => openContextMenu(event, item)" />
							</template>
							<div v-if="!groupedFiles.length && !loading" class="p-6 text-center text-sm text-[#b8a693]">{{ t('shared.empty') }}</div>
							<div v-if="loading" class="p-6"><LoadingState /></div>
						</div>
					</div>
				</div>
				<LoadingState v-if="actionInProgress" variant="overlay" :message="actionLabel || t('drive.processing')" />
			</div>

			<div v-else class="relative">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<template v-for="group in renderedGroupedFiles" :key="group.key">
						<div class="col-span-full rounded-xl border border-[rgba(245,225,205,0.08)] bg-[#17120e] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f97316]">{{ group.label }}</div>
						<FileListGridCard v-for="item in group.items" :key="item.id" :item="item" :selected="isSelected(item)" @select="(event) => selectItem(event, item)" @open="openItemOnDoubleClick(item)" @contextmenu="(event) => openContextMenu(event, item)" />
					</template>
					<div v-if="!groupedFiles.length && !loading" class="col-span-full rounded-2xl border border-dashed border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-5 py-8 text-center text-[#b8a693]">{{ t('shared.empty') }}</div>
					<div v-if="loading" class="col-span-full rounded-2xl border border-dashed border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-5 py-8 text-center text-[#b8a693]"><LoadingState /></div>
				</div>
				<LoadingState v-if="actionInProgress" variant="overlay" :message="actionLabel || t('drive.processing')" />
			</div>

			<FileListContextMenu :context-menu-ref="contextMenuRef" :context-menu="contextMenu" :selected-count="selectedCount" :primary-selected-file="primarySelectedFile" :can-preview="canPreviewSelection" :can-toggle-star="canToggleStarSelection" :is-primary-starred="isPrimarySelectedStarred" :can-download="canDownloadSelection" :can-rename="false" :can-delete="false" :can-show-details="selectedCount === 1" :can-open-folder="canOpenSelection" @open-folder="openSelectedItem" @preview="openPreview" @toggle-star="toggleSelectedFileStar" @download="downloadSelection" @rename="renameSelectedFile" @show-details="showSelectedFileDetails" @delete="deleteSelectedFile" @close="closeContextMenu" />

			<FileDetailsModal :file="detailsFile" :is-open="isDetailsOpen" :provider-label-fn="providerLabel" @close="closeDetails" />
			<FilePreviewModal :file="previewFile" :is-open="isPreviewOpen" :is-loading="isPreviewLoading" @close="closePreview" @loaded="handlePreviewLoaded" @failed="handlePreviewFailed" />
		</div>

		<FloatingProgressToast :uploads="uploads" :total-progress="totalProgress" @close="uploadQueueStore.clearOperations" @close-item="uploadQueueStore.closeOperation" />
	</DriveShell>
</template>
