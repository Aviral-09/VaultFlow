<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import {
	IconFileDescription,
	IconFolder,
	IconCloud,
	IconStar,
	IconClockHour4,
	IconPlus,
	IconServer,
	IconSparkles,
	IconChevronRight,
} from '@tabler/icons-vue';
import DriveShell from '../components/DriveShell.vue';
import TruncateMarquee from '../components/TruncateMarquee.vue';
import { useFileTreeStore } from '../stores/fileTree';
import { useAccountManagementStore } from '../stores/accountManagement';
import { getModifiedTime, formatDate, providerIcon, providerLabel, formatBytesStrict } from '../composables/useFormatFile.js';
import { useStorageStats } from '../composables/useStorageStats.js';
import { getFileIcon } from '../composables/useFileType.js';

const { t } = useI18n();

const fileTreeStore = useFileTreeStore();
const accountStore = useAccountManagementStore();

const { files, isLoading } = storeToRefs(fileTreeStore);
const { accounts } = storeToRefs(accountStore);
const {
	storagePercentRounded,
	storagePercent,
	storageLabel,
	usedFormatted,
	totalFormatted,
	freeFormatted,
} = useStorageStats();

const quickFiles = computed(() => files.value.filter((file) => !file.is_folder).slice(0, 6));

function getAccountPercent(account) {
	const used = Number(account.used_space || 0);
	const total = Number(account.total_space || 0);
	if (!total) return 0;
	return Math.min(100, Math.round((used / total) * 100));
}

async function loadPage() {
	await Promise.all([fileTreeStore.loadFiles('/'), accountStore.loadAccounts()]);
}

onMounted(loadPage);
</script>

<template>
	<DriveShell current-section="home" @new-folder="$emit('new-folder')" @upload-files="$emit('upload-files')" @upload-folder="$emit('upload-folder')">
		<div class="space-y-6">
			<!-- Cinematic Premium Hero Section -->
			<section class="relative overflow-hidden rounded-3xl border border-[rgba(245,225,205,0.12)] bg-gradient-to-br from-[#1e1712] via-[#241b14] to-[#17120e] p-6 shadow-2xl lg:p-8">
				<!-- Ambient Glow Backdrops -->
				<div class="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-[#f97316]/10 blur-3xl"></div>
				<div class="pointer-events-none absolute -bottom-20 left-1/3 size-96 rounded-full bg-[#ea580c]/5 blur-3xl"></div>

				<div class="relative z-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
					<!-- Hero Content Left -->
					<div class="space-y-4">
						<div class="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#f97316]">
							<IconSparkles :size="14" :stroke="2" />
							<span>{{ t('home.subtitle') || 'Cloud Drive Aggregator' }}</span>
						</div>

						<h1 class="text-3xl font-extrabold tracking-tight text-[#fcf7f0] sm:text-4xl">
							{{ t('home.heroTitle') }}
						</h1>

						<p class="max-w-xl text-sm leading-relaxed text-[#e8dbcc] sm:text-base">
							{{ t('home.heroDesc') }}
						</p>

						<!-- Hero Action Buttons -->
						<div class="flex flex-wrap items-center gap-3 pt-2">
							<RouterLink to="/my-drive" class="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 font-semibold text-[#fcf7f0] shadow-[0_8px_20px_-4px_rgba(249,115,22,0.4)] transition hover:scale-[1.02] hover:brightness-110">
								<IconFolder :size="18" :stroke="2" />
								<span>{{ t('nav.myDrive') }}</span>
							</RouterLink>
							<RouterLink to="/quota" class="inline-flex h-11 items-center gap-2 rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] px-5 font-semibold text-[#fcf7f0] transition hover:bg-[#30241c]">
								<IconServer :size="18" :stroke="2" />
								<span>{{ t('nav.storage') }}</span>
							</RouterLink>
						</div>

						<!-- Real App Quick Summary Badges -->
						<div class="grid grid-cols-3 gap-3 pt-4 border-t border-[rgba(245,225,205,0.08)] max-w-lg">
							<div>
								<span class="block text-xs text-[#b8a693]">Connected</span>
								<span class="text-lg font-bold text-[#fcf7f0]">{{ accounts.length }} Drives</span>
							</div>
							<div>
								<span class="block text-xs text-[#b8a693]">Total Capacity</span>
								<span class="text-lg font-bold text-[#fcf7f0]">{{ totalFormatted }}</span>
							</div>
							<div>
								<span class="block text-xs text-[#b8a693]">Free Storage</span>
								<span class="text-lg font-bold text-[#f97316]">{{ freeFormatted }}</span>
							</div>
						</div>
					</div>

					<!-- Storage Overview Card Right -->
					<div class="flex flex-col items-center justify-center rounded-2xl border border-[rgba(245,225,205,0.12)] bg-[#261d17]/80 p-6 text-center shadow-xl backdrop-blur-md">
						<div class="relative mb-4 grid size-32 place-items-center">
							<!-- Radial Progress Ring -->
							<svg class="size-full -rotate-90" viewBox="0 0 36 36">
								<path class="text-[#120e0b]" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
								<path class="text-[#f97316] transition-all duration-1000 ease-out" stroke-dasharray="100" :stroke-dashoffset="100 - storagePercentRounded" stroke-linecap="round" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
							</svg>
							<div class="absolute inset-0 flex flex-col items-center justify-center">
								<span class="text-2xl font-black text-[#fcf7f0]">{{ storagePercentRounded }}%</span>
								<span class="text-[10px] font-semibold uppercase tracking-wider text-[#b8a693]">Used</span>
							</div>
						</div>

						<div class="space-y-1">
							<div class="text-sm font-semibold text-[#fcf7f0]">{{ usedFormatted }} / {{ totalFormatted }}</div>
							<p class="text-xs text-[#b8a693]">{{ storageLabel }}</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Quick Actions Grid -->
			<section class="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
				<RouterLink to="/my-drive" class="group flex items-center gap-3.5 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(245,225,205,0.18)] hover:bg-[#261d17] hover:shadow-xl">
					<span class="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f97316]/15 text-[#f97316] transition-transform group-hover:scale-110">
						<IconFolder :size="22" :stroke="2" />
					</span>
					<div class="min-w-0">
						<span class="block truncate text-sm font-semibold text-[#fcf7f0]">My Drive</span>
						<span class="block truncate text-xs text-[#b8a693]">Explore Files</span>
					</div>
				</RouterLink>

				<RouterLink to="/recent" class="group flex items-center gap-3.5 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(245,225,205,0.18)] hover:bg-[#261d17] hover:shadow-xl">
					<span class="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f97316]/15 text-[#f97316] transition-transform group-hover:scale-110">
						<IconClockHour4 :size="22" :stroke="2" />
					</span>
					<div class="min-w-0">
						<span class="block truncate text-sm font-semibold text-[#fcf7f0]">Recent</span>
						<span class="block truncate text-xs text-[#b8a693]">Latest Edits</span>
					</div>
				</RouterLink>

				<RouterLink to="/starred" class="group flex items-center gap-3.5 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(245,225,205,0.18)] hover:bg-[#261d17] hover:shadow-xl">
					<span class="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f97316]/15 text-[#f97316] transition-transform group-hover:scale-110">
						<IconStar :size="22" :stroke="2" />
					</span>
					<div class="min-w-0">
						<span class="block truncate text-sm font-semibold text-[#fcf7f0]">Starred</span>
						<span class="block truncate text-xs text-[#b8a693]">Favorites</span>
					</div>
				</RouterLink>

				<RouterLink to="/quota" class="group flex items-center gap-3.5 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(245,225,205,0.18)] hover:bg-[#261d17] hover:shadow-xl">
					<span class="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f97316]/15 text-[#f97316] transition-transform group-hover:scale-110">
						<IconServer :size="22" :stroke="2" />
					</span>
					<div class="min-w-0">
						<span class="block truncate text-sm font-semibold text-[#fcf7f0]">Manage Drives</span>
						<span class="block truncate text-xs text-[#b8a693]">Allocation & Accounts</span>
					</div>
				</RouterLink>
			</section>

			<!-- Connected Provider Overview -->
			<section class="space-y-3">
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<IconCloud :size="20" :stroke="2" class="text-[#f97316]" />
						<h2 class="text-base font-bold text-[#fcf7f0]">Connected Cloud Drives</h2>
					</div>
					<RouterLink to="/quota" class="inline-flex items-center gap-1 text-xs font-semibold text-[#f97316] transition hover:underline">
						<span>Manage Drives</span>
						<IconChevronRight :size="14" :stroke="2" />
					</RouterLink>
				</div>

				<div v-if="accounts.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<div v-for="account in accounts" :key="account.id" class="flex flex-col justify-between rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-4.5 transition-all duration-200 hover:border-[rgba(245,225,205,0.18)] hover:bg-[#261d17]">
						<div class="mb-3 flex items-center gap-3">
							<div class="grid size-10 shrink-0 place-items-center rounded-xl border border-[rgba(245,225,205,0.1)] bg-[#120e0b]">
								<img v-if="providerIcon(account.provider)" :src="providerIcon(account.provider)" :alt="providerLabel(account.provider)" class="size-5 object-contain" />
								<IconCloud v-else :size="20" :stroke="2" class="text-[#f97316]" />
							</div>
							<div class="min-w-0">
								<span class="block truncate text-sm font-semibold text-[#fcf7f0]">{{ providerLabel(account.provider) }}</span>
								<span class="block truncate text-xs text-[#b8a693]">{{ account.email || account.account_name || 'Connected' }}</span>
							</div>
						</div>

						<div class="space-y-1.5 pt-2 border-t border-[rgba(245,225,205,0.06)]">
							<div class="flex justify-between text-xs text-[#b8a693]">
								<span>Usage</span>
								<span class="font-semibold text-[#fcf7f0]">{{ formatBytesStrict(account.used_space) }} / {{ formatBytesStrict(account.total_space) }}</span>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-[#120e0b]">
								<div class="h-full rounded-full bg-[#f97316]" :style="{ width: `${getAccountPercent(account)}%` }"></div>
							</div>
						</div>
					</div>
				</div>

				<div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(245,225,205,0.14)] bg-[#1e1712]/50 p-6 text-center">
					<IconCloud :size="32" :stroke="1.5" class="mb-2 text-[#b8a693]" />
					<p class="text-sm font-medium text-[#fcf7f0]">No Cloud Accounts Connected Yet</p>
					<p class="mb-3 text-xs text-[#b8a693]">Connect your Google Drive, OneDrive, Dropbox, or S3 accounts to get started.</p>
					<RouterLink to="/quota" class="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#f97316] px-4 text-xs font-semibold text-[#fcf7f0] transition hover:bg-[#ea580c]">
						<IconPlus :size="16" :stroke="2" />
						<span>Connect Drive</span>
					</RouterLink>
				</div>
			</section>

			<!-- Recent Files Section -->
			<section class="space-y-3">
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<IconFileDescription :size="20" :stroke="2" class="text-[#f97316]" />
						<h2 class="text-base font-bold text-[#fcf7f0]">{{ t('home.recentFiles') }}</h2>
					</div>
					<RouterLink to="/recent" class="inline-flex items-center gap-1 rounded-xl border border-[rgba(245,225,205,0.12)] bg-[#261d17] px-3.5 py-1.5 text-xs font-semibold text-[#f97316] transition hover:bg-[#30241c]">
						<span>{{ t('home.viewAll') }}</span>
						<IconChevronRight :size="14" :stroke="2" />
					</RouterLink>
				</div>

				<div class="overflow-hidden rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712]">
					<!-- Header Row -->
					<div class="grid min-h-11 grid-cols-[minmax(220px,2fr)_1.1fr_1fr_140px] items-center gap-3 border-b border-[rgba(245,225,205,0.08)] bg-[#17120e] px-4 text-xs font-semibold text-[#b8a693] max-md:grid-cols-[minmax(180px,1.8fr)_1fr_1fr]">
						<span>{{ t('home.fileName') }}</span>
						<span>{{ t('home.fileOwner') }}</span>
						<span>{{ t('home.fileModified') }}</span>
						<span class="max-md:hidden">{{ t('home.fileSize') }}</span>
					</div>

					<!-- Files Rows -->
					<div v-for="file in quickFiles" :key="file.id" class="grid min-h-[52px] grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_minmax(0,1fr)_140px] items-center gap-3 border-t border-[rgba(245,225,205,0.06)] px-4 transition hover:bg-[#261d17] max-md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)]">
						<span class="flex min-w-0 items-center gap-2.5 text-[#fcf7f0]">
							<component :is="getFileIcon(file, file.is_folder)" :size="18" :stroke="file.is_folder ? 0 : 1.8" class="shrink-0 text-[#f97316]" />
							<TruncateMarquee :text="file.display_name || file.file_name" />
						</span>
						<div class="flex min-w-0 items-center gap-2 text-[#e8dbcc]">
							<div v-if="providerIcon(file.provider)" class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#120e0b]">
								<img :src="providerIcon(file.provider)" :alt="providerLabel(file.provider)" class="size-3.5 object-contain" />
							</div>
							<TruncateMarquee class="min-w-0 text-xs text-[#b8a693]" :text="file.email || providerLabel(file.provider)" />
						</div>
						<span class="text-xs text-[#b8a693]">{{ formatDate(getModifiedTime(file)) }}</span>
						<span class="text-xs text-[#b8a693] max-md:hidden">{{ formatBytesStrict(file.size) }}</span>
					</div>

					<!-- Empty State -->
					<div v-if="!quickFiles.length && !isLoading" class="p-6 text-center text-sm text-[#b8a693]">
						{{ t('home.noFiles') }}
					</div>
				</div>
			</section>
		</div>
	</DriveShell>
</template>