<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { IconCloudDataConnection, IconChevronRight, IconHelp, IconHome, IconLayoutGrid, IconMenu2, IconMoon, IconPlus, IconSearch, IconSettings, IconSun, IconStar, IconTrash, IconUsers, IconX, IconClockHour4, IconCloud, IconFolder, IconCloudFilled, IconClockHour4Filled, IconFolderFilled, IconHomeFilled, IconStarFilled, IconUserFilled, IconLanguage, IconLogout, IconBell } from '@tabler/icons-vue';
import { useRouter } from 'vue-router';
import logoUrl from '../assets/logo.webp';
import { useAccountManagementStore } from '../stores/accountManagement';
import { useSettingsStore } from '../stores/settings';
import { useAuthStore } from '../stores/auth';
import { useStorageStats } from '../composables/useStorageStats.js';
import HelpModal from './HelpModal.vue';
import ProfileModal from './ProfileModal.vue';
import LanguageModal from './LanguageModal.vue';
import UpdatesModal from './UpdatesModal.vue';
import { api } from '../services/api';
import { useFileTreeStore } from '../stores/fileTree';
import { getFileIcon } from '../composables/useFileType.js';
import { useIncrementalRender } from '../composables/useIncrementalRender.js';

const { t } = useI18n();
const router = useRouter();
const fileTreeStore = useFileTreeStore();

const props = defineProps({
	currentSection: { type: String, required: true },
});

const emit = defineEmits(['new-folder', 'upload-files', 'upload-folder']);

const isCreateMenuOpen = ref(false);
const isMobileNavOpen = ref(false);
const isHelpModalOpen = ref(false);
const isProfileModalOpen = ref(false);
const isLanguageModalOpen = ref(false);
const isUpdatesModalOpen = ref(false);
const globalSearchTerm = ref('');
const globalSearchResults = ref([]);
const isGlobalSearchOpen = ref(false);
const isGlobalSearchLoading = ref(false);
const globalSearchError = ref('');
const globalSearchDebounce = ref(null);
const createMenuRef = ref(null);
const searchRef = ref(null);
const theme = ref('dark');
const accountStore = useAccountManagementStore();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const { accounts } = storeToRefs(accountStore);
const { isHosted } = storeToRefs(authStore);
const { storagePercent, storagePercentRounded, storageLabel } = useStorageStats();
const { visibleItems: renderedGlobalSearchResults, handleScroll: handleGlobalSearchScroll } = useIncrementalRender(globalSearchResults, {
	initialCount: 20,
	step: 20,
	threshold: 160,
});

async function handleLogout() {
	await authStore.logout();
	router.replace('/login');
}

function formatSearchDate(value) {
	if (!value) return '—';
	try {
		return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
	} catch {
		return '—';
	}
}

function getItemPath(item) {
	const basePath = item.virtual_path || '/';
	if (!item.is_folder) return basePath;
	const nextPath = `${basePath === '/' ? '/' : basePath}${item.file_name}/`;
	return nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
}

async function runGlobalSearch(term) {
	const keyword = term.trim();
	if (!keyword) {
		globalSearchResults.value = [];
		globalSearchError.value = '';
		isGlobalSearchLoading.value = false;
		return;
	}

	isGlobalSearchLoading.value = true;
	globalSearchError.value = '';
	try {
		const { data } = await api.searchFiles(keyword, 80);
		if (globalSearchTerm.value.trim() === keyword) {
			globalSearchResults.value = data || [];
		}
	} catch (error) {
		if (globalSearchTerm.value.trim() === keyword) {
			globalSearchResults.value = [];
			globalSearchError.value = error.message || 'Search failed';
		}
	} finally {
		if (globalSearchTerm.value.trim() === keyword) {
			isGlobalSearchLoading.value = false;
		}
	}
}

function handleSearchFocus() {
	isGlobalSearchOpen.value = true;
}

function clearGlobalSearch() {
	globalSearchTerm.value = '';
	globalSearchResults.value = [];
	globalSearchError.value = '';
	isGlobalSearchOpen.value = false;
}

async function openSearchResult(item) {
	const targetPath = getItemPath(item);
	clearGlobalSearch();
	fileTreeStore.pendingHighlightId = item.is_folder ? null : item.id;

	if (router.currentRoute.value.name === 'my-drive') {
		fileTreeStore.pendingPath = null;
		await fileTreeStore.navigate(targetPath);
		return;
	}

	fileTreeStore.pendingPath = targetPath;
	await router.push({ name: 'my-drive' });
}

function toggleCreateMenu() {
	isCreateMenuOpen.value = !isCreateMenuOpen.value;
}

function toggleMobileNav() {
	isMobileNavOpen.value = !isMobileNavOpen.value;
}

function closeMobileNav() {
	isMobileNavOpen.value = false;
}

function openProfileModal() {
	isProfileModalOpen.value = true;
}

function closeProfileModal() {
	isProfileModalOpen.value = false;
}

function openHelpModal() {
	isHelpModalOpen.value = true;
}

function closeHelpModal() {
	isHelpModalOpen.value = false;
}

function openLanguageModal() {
	isLanguageModalOpen.value = true;
}

function closeLanguageModal() {
	isLanguageModalOpen.value = false;
}

function openUpdatesModal() {
	isUpdatesModalOpen.value = true;
}

function closeUpdatesModal() {
	isUpdatesModalOpen.value = false;
}

function runCreateAction(action) {
	isCreateMenuOpen.value = false;
	isMobileNavOpen.value = false;
	emit(action);
}

function handleDocumentClick(event) {
	if (!createMenuRef.value?.contains(event.target)) {
		isCreateMenuOpen.value = false;
	}

	if (!searchRef.value?.contains(event.target)) {
		isGlobalSearchOpen.value = false;
	}

	if (isMobileNavOpen.value && !event.target.closest('[data-mobile-nav-card]') && !event.target.closest('[data-mobile-nav-toggle]')) {
		isMobileNavOpen.value = false;
	}
}

function handleWindowKeydown(event) {
	if (event.key !== 'Escape') {
		return;
	}

	if (isLanguageModalOpen.value) {
		closeLanguageModal();
	}

	if (isHelpModalOpen.value) {
		closeHelpModal();
	}

	if (isProfileModalOpen.value) {
		closeProfileModal();
	}

	if (isUpdatesModalOpen.value) {
		closeUpdatesModal();
	}

	if (isGlobalSearchOpen.value) {
		isGlobalSearchOpen.value = false;
	}
}

function applyTheme(nextTheme) {
	theme.value = nextTheme;
	document.documentElement.classList.toggle('dark', nextTheme === 'dark');
	window.localStorage.setItem('omnicloud-theme', nextTheme);
}

function toggleTheme() {
	applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

onMounted(() => {
	const savedTheme = window.localStorage.getItem('omnicloud-theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
	applyTheme(savedTheme);
	document.addEventListener('click', handleDocumentClick);
	window.addEventListener('keydown', handleWindowKeydown);
	if (!accounts.value.length) {
		accountStore.loadAccounts();
	}
});

onBeforeUnmount(() => {
	document.removeEventListener('click', handleDocumentClick);
	window.removeEventListener('keydown', handleWindowKeydown);
	if (globalSearchDebounce.value) {
		window.clearTimeout(globalSearchDebounce.value);
	}
});

watch(globalSearchTerm, (term) => {
	isGlobalSearchOpen.value = true;
	if (globalSearchDebounce.value) {
		window.clearTimeout(globalSearchDebounce.value);
	}

	if (!term.trim()) {
		globalSearchResults.value = [];
		globalSearchError.value = '';
		isGlobalSearchLoading.value = false;
		return;
	}

	isGlobalSearchLoading.value = true;
	globalSearchError.value = '';
	globalSearchDebounce.value = window.setTimeout(() => runGlobalSearch(term), 250);
});

const navItems = computed(() => [
	{ id: 'home', label: t('nav.home'), icon: IconHome, activeIcon: IconHomeFilled, to: '/' },
	{ id: 'drive', label: t('nav.myDrive'), icon: IconFolder, activeIcon: IconFolderFilled, to: '/my-drive' },
	{ id: 'shared', label: t('nav.shared'), icon: IconUsers, activeIcon: IconUserFilled, to: '/shared-with-me' },
	{ id: 'recent', label: t('nav.recent'), icon: IconClockHour4, activeIcon: IconClockHour4Filled, to: '/recent' },
	{ id: 'starred', label: t('nav.starred'), icon: IconStar, activeIcon: IconStarFilled, to: '/starred' },
	{ id: 'storage', label: t('nav.storage'), icon: IconCloud, activeIcon: IconCloudFilled, to: '/quota' },
]);

const profileLinks = [
	{ id: 'website', label: 'Website', href: 'https://tarmizi.id' },
	{ id: 'github', label: 'GitHub', href: 'https://github.com/dimartarmizi' },
	{ id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/dimartarmizi' },
	{ id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/dimartarmizi' },
	{ id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/dimartarmizi' },
	{ id: 'reddit', label: 'Reddit', href: 'https://www.reddit.com/user/dimartarmizi' },
];
</script>

<template>
	<div class="min-h-screen bg-[#f8fafd] text-[#0f172a] transition-colors duration-200 dark:bg-[#120e0b] dark:text-[#fcf7f0]">
		<HelpModal :open="isHelpModalOpen" @close="closeHelpModal" />
		<ProfileModal :open="isProfileModalOpen" :profile-links="profileLinks" @close="closeProfileModal" />
		<LanguageModal :open="isLanguageModalOpen" @close="closeLanguageModal" />
		<UpdatesModal :open="isUpdatesModalOpen" @close="closeUpdatesModal" />

		<!-- Top Header Navigation -->
		<header class="sticky top-0 z-40 grid h-16 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-b border-[#e2e8f0] bg-white/90 px-3 backdrop-blur-md dark:border-[rgba(245,225,205,0.08)] dark:bg-[#17120e]/90 sm:gap-4 sm:px-4 lg:grid-cols-[256px_minmax(320px,720px)_1fr] lg:gap-3 lg:px-0 lg:pr-4">
			<div class="flex min-w-0 items-center gap-2 lg:gap-3 lg:pl-4">
				<button type="button" class="grid size-10 shrink-0 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-100 hover:text-slate-900 dark:text-[#b8a693] dark:hover:bg-[#261d17] dark:hover:text-[#fcf7f0] lg:hidden" data-mobile-nav-toggle :aria-label="t('header.openNav')" @click.stop="toggleMobileNav">
					<IconMenu2 :size="22" :stroke="2" />
				</button>
				<div class="hidden items-center gap-2.5 lg:flex">
					<button type="button" class="grid size-11 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-[#f97316]/20 dark:border-[rgba(245,225,205,0.1)] dark:bg-[#241b14]" :aria-label="t('header.openProfile')" @click="openProfileModal">
						<img :src="logoUrl" alt="OmniCloud logo" class="size-full object-cover" />
					</button>
					<div class="flex items-center gap-1.5 text-xl font-bold tracking-tight text-[#0f172a] dark:text-[#fcf7f0]">
						<span>OmniCloud</span>
						<span class="size-2 rounded-full bg-[#f97316]"></span>
					</div>
				</div>
			</div>

			<!-- Search Bar & Results Dropdown -->
			<div ref="searchRef" class="relative min-w-0 max-w-full">
				<div class="grid h-11 grid-cols-[44px_minmax(0,1fr)_42px] items-center rounded-2xl border border-[#cbd5e1] bg-white pr-1.5 transition-all focus-within:border-[#f97316]/60 focus-within:ring-2 focus-within:ring-[#f97316]/20 dark:border-[rgba(245,225,205,0.1)] dark:bg-[#201813] sm:h-11 sm:grid-cols-[52px_minmax(0,1fr)_48px] sm:pr-2.5">
					<span class="grid place-items-center text-[#64748b] dark:text-[#b8a693]">
						<IconSearch :size="18" :stroke="2" />
					</span>
					<input v-model="globalSearchTerm" type="text" :placeholder="t('header.searchPlaceholder')" class="w-full min-w-0 border-0 bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#64748b] dark:text-[#fcf7f0] dark:placeholder:text-[#857362] sm:text-base" @focus="handleSearchFocus" @keydown.esc.prevent="isGlobalSearchOpen = false" />
					<button v-if="globalSearchTerm" type="button" class="grid size-8 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-100 hover:text-slate-900 dark:text-[#b8a693] dark:hover:bg-[#2e231a] dark:hover:text-[#fcf7f0]" :aria-label="t('header.clearSearch')" @click="clearGlobalSearch">
						<IconX :size="16" :stroke="2" />
					</button>
				</div>

				<div v-if="isGlobalSearchOpen && globalSearchTerm.trim()" class="fixed left-2 right-2 top-16 z-50 overflow-hidden rounded-2xl border border-[#cbd5e1] bg-white/98 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-[rgba(245,225,205,0.14)] dark:bg-[#241b14]/98 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] lg:absolute lg:left-0 lg:right-0 lg:top-[calc(100%+8px)]">
					<div class="custom-scrollbar max-h-[min(420px,70vh)] overflow-y-auto py-2" @scroll="handleGlobalSearchScroll">
						<div v-if="isGlobalSearchLoading && !globalSearchResults.length" class="px-4 py-4 text-sm text-[#64748b] dark:text-[#b8a693]">{{ t('header.searchLoading') }}</div>
						<div v-else-if="globalSearchError" class="px-4 py-4 text-sm text-red-400">{{ globalSearchError }}</div>
						<div v-else-if="!globalSearchResults.length" class="px-4 py-4 text-sm text-[#64748b] dark:text-[#b8a693]">{{ t('header.searchNoResults') }}</div>
						<template v-else>
							<button v-for="item in renderedGlobalSearchResults" :key="item.id" type="button" class="grid w-full grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-[#30241c]" @click="openSearchResult(item)">
								<span class="grid size-9 place-items-center rounded-xl bg-[#f97316]/15 text-[#f97316]">
									<component :is="getFileIcon(item, item.is_folder)" :size="18" :stroke="item.is_folder ? 0 : 1.8" />
								</span>
								<span class="min-w-0">
									<span class="block truncate text-sm font-medium text-[#0f172a] dark:text-[#fcf7f0]">{{ item.display_name || item.file_name }}</span>
									<span v-if="!item.is_folder" class="block truncate text-xs text-[#64748b] dark:text-[#b8a693]">{{ item.virtual_path || '/' }}</span>
								</span>
								<span class="shrink-0 text-xs text-[#94a3b8] dark:text-[#857362]">{{ formatSearchDate(item.createdTime || item.remote_created_time || item.created_at) }}</span>
							</button>
						</template>
					</div>
				</div>
			</div>

			<!-- Quick Actions Bar -->
			<div class="hidden items-center justify-end gap-1.5 lg:flex">
				<button type="button" class="hidden size-10 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-200/60 hover:text-slate-900 dark:text-[#b8a693] dark:hover:bg-[#261d17] dark:hover:text-[#fcf7f0] sm:grid" :title="t('header.toggleTheme')" @click="toggleTheme">
					<IconMoon v-if="theme === 'light'" :size="18" :stroke="2" class="text-slate-700" />
					<IconSun v-else :size="18" :stroke="2" class="text-amber-400" />
				</button>
				<button type="button" class="hidden size-10 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-200/60 hover:text-slate-900 dark:text-[#b8a693] dark:hover:bg-[#261d17] dark:hover:text-[#fcf7f0] sm:grid" :title="t('common.language')" @click="openLanguageModal">
					<IconLanguage :size="18" :stroke="2" />
				</button>
				<button type="button" class="hidden size-10 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-200/60 hover:text-slate-900 dark:text-[#b8a693] dark:hover:bg-[#261d17] dark:hover:text-[#fcf7f0] sm:grid" :aria-label="t('header.openHelp')" @click="openHelpModal">
					<IconHelp :size="18" :stroke="2" />
				</button>
				<button type="button" class="hidden size-10 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-200/60 hover:text-slate-900 dark:text-[#b8a693] dark:hover:bg-[#261d17] dark:hover:text-[#fcf7f0] sm:grid" :title="t('updates.buttonLabel')" :aria-label="t('updates.buttonLabel')" @click="openUpdatesModal">
					<IconBell :size="18" :stroke="2" />
				</button>
				<button type="button" class="hidden size-10 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-200/60 hover:text-slate-900 dark:text-[#b8a693] dark:hover:bg-[#261d17] dark:hover:text-[#fcf7f0] sm:grid" :title="t('common.settings')">
					<IconSettings :size="18" :stroke="2" />
				</button>
				<button v-if="isHosted" type="button" class="hidden size-10 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-200/60 hover:text-red-600 dark:text-[#b8a693] dark:hover:bg-[#261d17] dark:hover:text-red-400 sm:grid" :title="t('auth.logout')" @click="handleLogout">
					<IconLogout :size="18" :stroke="2" />
				</button>
			</div>
		</header>

		<!-- Mobile Navigation Drawer Card -->
		<Transition enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-y-2 opacity-0 scale-95" enter-to-class="translate-y-0 opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="translate-y-0 opacity-100 scale-100" leave-to-class="-translate-y-2 opacity-0 scale-95">
			<div v-if="isMobileNavOpen" class="fixed left-2 right-2 top-16 z-50 lg:hidden" data-mobile-nav-card>
				<div class="max-h-[calc(100vh-80px)] overflow-y-auto rounded-3xl border border-slate-200 bg-white/98 p-4 text-[#0f172a] shadow-[0_25px_60px_rgba(0,0,0,0.15)] backdrop-blur-2xl dark:border-[rgba(245,225,205,0.14)] dark:bg-[#201813]/98 dark:text-[#fcf7f0] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
					<div class="mb-5 flex items-center justify-between gap-3">
						<div class="flex items-center gap-2.5">
							<span class="grid size-11 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[rgba(245,225,205,0.1)] dark:bg-[#261d17]">
								<img :src="logoUrl" alt="OmniCloud logo" class="size-full object-cover" />
							</span>
							<span class="text-xl font-bold text-[#0f172a] dark:text-[#fcf7f0]">OmniCloud</span>
						</div>
						<div class="flex items-center gap-2">
							<button type="button" class="grid size-10 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-100 dark:text-[#b8a693] dark:hover:bg-[#2e231a] dark:hover:text-[#fcf7f0]" :title="t('header.toggleTheme')" @click="toggleTheme">
								<component :is="theme === 'light' ? IconMoon : IconSun" :size="20" :stroke="2" :class="theme === 'light' ? 'text-slate-700' : 'text-amber-400'" />
							</button>
							<button type="button" class="grid size-10 place-items-center rounded-xl text-[#64748b] transition hover:bg-slate-100 dark:text-[#b8a693] dark:hover:bg-[#2e231a] dark:hover:text-[#fcf7f0]" :aria-label="t('header.closeNav')" @click="closeMobileNav">
								<IconX :size="20" :stroke="2" />
							</button>
						</div>
					</div>

					<div ref="createMenuRef" class="relative mb-4">
						<button type="button" class="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-4 font-semibold text-white shadow-[0_8px_20px_-4px_rgba(249,115,22,0.45)] transition hover:brightness-110" @click.stop="toggleCreateMenu">
							<IconPlus :size="22" :stroke="2.5" />
							<span>{{ t('common.new') }}</span>
						</button>

						<div v-if="isCreateMenuOpen" class="absolute left-0 top-[calc(100%+10px)] z-30 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl dark:border-[rgba(245,225,205,0.14)] dark:bg-[#261d17]">
							<button type="button" class="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-[#0f172a] hover:bg-slate-100 dark:text-[#fcf7f0] dark:hover:bg-[#30241c]" @click="runCreateAction('new-folder')">
								<span>{{ t('sidebar.newFolder') }}</span>
								<IconChevronRight :size="16" :stroke="2" class="text-[#64748b] dark:text-[#b8a693]" />
							</button>
							<button type="button" class="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-[#0f172a] hover:bg-slate-100 dark:text-[#fcf7f0] dark:hover:bg-[#30241c]" @click="runCreateAction('upload-files')">
								<span>{{ t('sidebar.uploadFile') }}</span>
								<IconChevronRight :size="16" :stroke="2" class="text-[#64748b] dark:text-[#b8a693]" />
							</button>
							<button type="button" class="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-[#0f172a] hover:bg-slate-100 dark:text-[#fcf7f0] dark:hover:bg-[#30241c]" @click="runCreateAction('upload-folder')">
								<span>{{ t('sidebar.uploadFolder') }}</span>
								<IconChevronRight :size="16" :stroke="2" class="text-[#64748b] dark:text-[#b8a693]" />
							</button>
						</div>
					</div>

					<nav class="flex flex-col gap-1">
						<RouterLink v-for="item in navItems" :key="item.label" :to="item.to" class="group relative flex h-12 items-center gap-3.5 overflow-hidden rounded-xl px-4 text-[#475569] transition-all duration-200 dark:text-[#e8dbcc]" :class="props.currentSection === item.id ? 'bg-gradient-to-r from-[#f97316]/25 to-[#f97316]/5 font-semibold text-[#f97316] shadow-[inset_4px_0_0_#f97316] dark:text-[#fcf7f0]' : 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#261d17] dark:hover:text-[#fcf7f0]'" @click="closeMobileNav">
							<component :is="props.currentSection === item.id ? item.activeIcon : item.icon" :size="20" :stroke="props.currentSection === item.id ? 0 : 2" class="shrink-0 transition-transform duration-200 group-hover:scale-110" :class="props.currentSection === item.id ? 'text-[#f97316]' : 'text-[#64748b] dark:text-[#b8a693]'" />
							<span>{{ item.label }}</span>
						</RouterLink>
					</nav>

					<div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[rgba(245,225,205,0.09)] dark:bg-[#261d17]">
						<div class="mb-3 flex items-center justify-between gap-3">
							<div class="flex items-center gap-2.5">
								<span class="grid size-9 place-items-center rounded-xl bg-[#f97316]/15 text-[#f97316]">
									<IconCloudFilled :size="18" :stroke="0" />
								</span>
								<span class="text-sm font-semibold text-[#0f172a] dark:text-[#fcf7f0]">{{ t('sidebar.storage') }}</span>
							</div>
							<span class="rounded-full bg-[#f97316]/15 px-2.5 py-0.5 text-xs font-semibold text-[#f97316]">{{ storagePercentRounded }}%</span>
						</div>

						<div class="mb-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-[#120e0b]">
							<div class="h-full rounded-full bg-gradient-to-r from-[#f97316] via-[#fb923c] to-[#ea580c] transition-all" :style="{ width: `${storagePercent}%` }" />
						</div>

						<p class="text-xs leading-5 text-[#64748b] dark:text-[#b8a693]">{{ storageLabel }}</p>
					</div>
				</div>
			</div>
		</Transition>

		<!-- Main Workspace Layout Grid -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-[256px_minmax(0,1fr)]">
			<!-- Desktop Sidebar -->
			<aside class="hidden pb-6 pl-4 pr-3 pt-3 lg:flex lg:min-h-[calc(100vh-4rem)] lg:flex-col">
				<!-- Create New Button Dropdown -->
				<div ref="createMenuRef" class="relative inline-block mb-4">
					<button type="button" class="inline-flex h-12 items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 font-semibold text-white shadow-[0_8px_20px_-4px_rgba(249,115,22,0.4)] transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.99]" @click.stop="toggleCreateMenu">
						<IconPlus :size="20" :stroke="2.5" />
						<span>{{ t('common.new') }}</span>
					</button>

					<div v-if="isCreateMenuOpen" class="absolute left-0 top-[calc(100%+8px)] z-30 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl backdrop-blur-xl dark:border-[rgba(245,225,205,0.14)] dark:bg-[#261d17]">
						<button type="button" class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[#0f172a] transition hover:bg-slate-100 dark:text-[#fcf7f0] dark:hover:bg-[#30241c]" @click="runCreateAction('new-folder')">
							<span>{{ t('sidebar.newFolder') }}</span>
							<IconChevronRight :size="16" :stroke="2" class="text-[#64748b] dark:text-[#b8a693]" />
						</button>
						<button type="button" class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[#0f172a] transition hover:bg-slate-100 dark:text-[#fcf7f0] dark:hover:bg-[#30241c]" @click="runCreateAction('upload-files')">
							<span>{{ t('sidebar.uploadFile') }}</span>
							<IconChevronRight :size="16" :stroke="2" class="text-[#64748b] dark:text-[#b8a693]" />
						</button>
						<button type="button" class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[#0f172a] transition hover:bg-slate-100 dark:text-[#fcf7f0] dark:hover:bg-[#30241c]" @click="runCreateAction('upload-folder')">
							<span>{{ t('sidebar.uploadFolder') }}</span>
							<IconChevronRight :size="16" :stroke="2" class="text-[#64748b] dark:text-[#b8a693]" />
						</button>
					</div>
				</div>

				<!-- Navigation Items -->
				<nav class="flex flex-col gap-1">
					<RouterLink v-for="item in navItems" :key="item.label" :to="item.to" class="group relative flex h-11 items-center gap-3.5 overflow-hidden rounded-xl px-4 text-[#475569] transition-all duration-200 dark:text-[#e8dbcc]" :class="props.currentSection === item.id ? 'bg-gradient-to-r from-[#f97316]/25 to-[#f97316]/5 font-semibold text-[#f97316] shadow-[inset_4px_0_0_#f97316] dark:text-[#fcf7f0]' : 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#201813] dark:hover:text-[#fcf7f0]'">
						<component :is="props.currentSection === item.id ? item.activeIcon : item.icon" :size="19" :stroke="props.currentSection === item.id ? 0 : 2" class="shrink-0 transition-transform duration-200 group-hover:scale-110" :class="props.currentSection === item.id ? 'text-[#f97316]' : 'text-[#64748b] dark:text-[#b8a693]'" />
						<span class="text-sm">{{ item.label }}</span>
					</RouterLink>
				</nav>

				<!-- Storage Card Widget -->
				<RouterLink to="/quota" class="sticky bottom-4 mt-auto block rounded-2xl border border-slate-200 bg-white p-4 text-[#0f172a] shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-[rgba(245,225,205,0.09)] dark:bg-[#261d17] dark:text-[#fcf7f0] dark:hover:border-[rgba(245,225,205,0.18)] dark:hover:bg-[#2e231a]">
					<div class="mb-3 flex items-center justify-between gap-3">
						<div class="flex items-center gap-2.5">
							<span class="grid size-9 place-items-center rounded-xl bg-[#f97316]/15 text-[#f97316]">
								<IconCloud :size="18" :stroke="2" />
							</span>
							<span class="text-sm font-semibold">{{ t('sidebar.storage') }}</span>
						</div>
						<span class="rounded-full bg-[#f97316]/15 px-2.5 py-0.5 text-xs font-semibold text-[#f97316]">{{ storagePercentRounded }}%</span>
					</div>

					<div class="mb-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#120e0b]">
						<div class="h-full rounded-full bg-gradient-to-r from-[#f97316] via-[#fb923c] to-[#ea580c] transition-all" :style="{ width: `${storagePercent}%` }" />
					</div>

					<p class="text-xs leading-5 text-[#64748b] dark:text-[#b8a693]">{{ storageLabel }}</p>
				</RouterLink>
			</aside>

			<!-- Main View Area Slot -->
			<main class="px-3 pb-6 pt-2 lg:px-0 lg:pr-5 lg:pb-6">
				<slot />
			</main>
		</div>
	</div>
</template>