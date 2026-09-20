<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconChevronRight, IconDownload, IconFileDescription, IconFolder } from '@tabler/icons-vue';
import { api } from '../services/api';

const { t } = useI18n();

const props = defineProps({
	files: { type: Array, required: true },
	breadcrumbs: { type: Array, required: true },
	currentPath: { type: String, required: true },
	searchTerm: { type: String, default: '' },
	loading: { type: Boolean, default: false },
});

const emit = defineEmits(['navigate', 'search']);

const visibleFiles = computed(() => props.files.slice(0, 500));

function openFolder(file) {
	if (!file.is_folder) return;
	const nextPath = `${props.currentPath === '/' ? '' : props.currentPath}${file.file_name}/`;
	emit('navigate', nextPath.startsWith('/') ? nextPath : `/${nextPath}`);
}
</script>

<template>
	<section class="rounded-3xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-6 text-[#fcf7f0] shadow-xl">
		<div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<p class="text-xs font-bold uppercase tracking-wider text-[#f97316]">{{ t('fileExplorer.unifiedExplorer') }}</p>
				<h2 class="mt-2 text-2xl font-bold text-[#fcf7f0]">{{ t('fileExplorer.virtualPooling') }}</h2>
			</div>
			<input class="h-10 w-full rounded-2xl border border-[rgba(245,225,205,0.12)] bg-[#120e0b] px-4 text-sm text-[#fcf7f0] outline-none transition focus:border-[#f97316] placeholder:text-[#857362] sm:w-[280px]" type="search" :value="searchTerm" :placeholder="t('fileExplorer.searchInFolder')" @input="emit('search', $event.target.value)" />
		</div>

		<nav class="mb-5 flex flex-wrap items-center gap-1.5">
			<button v-for="(crumb, index) in breadcrumbs" :key="crumb.path" type="button" class="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-sm text-[#fcf7f0] transition hover:bg-[#30241c]" @click="emit('navigate', crumb.path)">
				{{ crumb.label }}
				<IconChevronRight v-if="index < breadcrumbs.length - 1" :size="16" :stroke="2" class="text-[#b8a693]" />
			</button>
		</nav>

		<div class="overflow-hidden rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#261d17]">
			<article v-for="file in visibleFiles" :key="file.id" class="flex flex-col gap-3 border-t border-[rgba(245,225,205,0.06)] px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between" :class="file.is_folder ? 'cursor-pointer transition hover:bg-[#30241c]' : 'bg-[#261d17]'" @dblclick="openFolder(file)">
				<div>
					<div class="flex items-center gap-2.5">
						<component :is="file.is_folder ? IconFolder : IconFileDescription" :size="18" :stroke="1.8" class="text-[#f97316]" />
						<strong class="text-[#fcf7f0]">{{ file.display_name || file.file_name }}</strong>
					</div>
					<p class="mt-1 text-xs text-[#b8a693]">{{ file.virtual_path }}</p>
				</div>
				<div class="flex flex-wrap items-center gap-3 text-sm text-[#b8a693] sm:justify-end">
					<span>{{ file.provider }}</span>
					<span>{{ file.is_folder ? t('fileExplorer.folder') : file.mime_type || t('fileExplorer.file') }}</span>
					<a v-if="!file.is_folder" :href="api.downloadUrl(file.id)" class="inline-flex items-center gap-1 font-semibold text-[#f97316] transition hover:brightness-120">
						<IconDownload :size="16" :stroke="2" />
						{{ t('fileExplorer.download') }}
					</a>
				</div>
			</article>

			<div v-if="!visibleFiles.length && !loading" class="p-5 text-center text-sm text-[#b8a693]">{{ t('fileExplorer.noFiles') }}</div>
			<div v-if="loading" class="p-5 text-center text-sm text-[#b8a693]">{{ t('fileExplorer.loading') }}</div>
		</div>
	</section>
</template>
