<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
	IconCloudDataConnection,
	IconArrowRight,
	IconSparkles,
	IconChevronDown,
	IconLayersIntersect,
	IconShieldCheck,
	IconRoute,
	IconFolder,
	IconMenu2,
	IconX,
	IconBrandGoogleDrive,
	IconBrandDropbox,
	IconCloud,
	IconDatabase,
	IconLock,
	IconPlugConnected,
	IconSearch,
	IconFolderCheck,
	IconCloudDownload,
	IconHome,
	IconStar,
	IconClockHour4,
	IconServer,
	IconSettings,
	IconFileText,
	IconFileSpreadsheet,
	IconFileTypePpt,
	IconPhoto,
	IconZip,
	IconDevices,
	IconUpload,
	IconRefresh,
	IconScale,
	IconFlame,
	IconListNumbers,
	IconUserCheck,
	IconCloudLock,
	IconShieldLock,
	IconCheck,
} from '@tabler/icons-vue';
import logoUrl from '../assets/logo.webp';
import heroOstiumUrl from '../assets/hero-ostium.jpg';
import showcaseProvidersUrl from '../assets/showcase-providers.jpg';
import smartRoutingUrl from '../assets/smart-routing.jpg';
import securityIsolatedUrl from '../assets/security-isolated.jpg';
import featureUnifiedUrl from '../assets/feature-unified.jpg';

const router = useRouter();
const isMobileNavOpen = ref(false);

const providerPills = [
	'Google Drive',
	'Microsoft OneDrive',
	'Dropbox',
	'MEGA Cloud',
	'Amazon S3',
	'pCloud',
];

const mockupFiles = [
	{ name: 'Project Report.pdf', type: 'PDF Document', provider: 'Google Drive', date: 'Oct 24, 2025', size: '4.2 MB', icon: IconFileText, color: 'text-red-400' },
	{ name: 'Analytics Dashboard.xlsx', type: 'Spreadsheet', provider: 'OneDrive', date: 'Oct 22, 2025', size: '1.8 MB', icon: IconFileSpreadsheet, color: 'text-emerald-400' },
	{ name: 'Presentation.pptx', type: 'Presentation', provider: 'Dropbox', date: 'Oct 19, 2025', size: '12.4 MB', icon: IconFileTypePpt, color: 'text-amber-400' },
	{ name: 'Profile Photo.png', type: 'PNG Image', provider: 'MEGA', date: 'Oct 15, 2025', size: '3.1 MB', icon: IconPhoto, color: 'text-sky-400' },
	{ name: 'Project Assets.zip', type: 'ZIP Archive', provider: 'Amazon S3', date: 'Oct 10, 2025', size: '142.0 MB', icon: IconZip, color: 'text-[#f97316]' },
];

const visualFeatureCards = [
	{
		title: 'Unified Access',
		subtitle: 'Every file. One workspace.',
		img: featureUnifiedUrl,
		badge: 'Single File Explorer',
	},
	{
		title: 'Smart Uploads',
		subtitle: 'Store files where capacity is available.',
		img: smartRoutingUrl,
		badge: 'Intelligent Routing',
	},
	{
		title: 'Isolated Workspace',
		subtitle: 'Your accounts. Your data.',
		img: securityIsolatedUrl,
		badge: 'Private Sessions',
	},
];

const howItWorksSteps = [
	{
		step: '01',
		title: 'Connect',
		desc: 'Connect the cloud storage providers you already use.',
		icon: IconPlugConnected,
		color: 'text-[#f97316]',
	},
	{
		step: '02',
		title: 'Unify',
		desc: 'See files from your connected providers through one interface.',
		icon: IconLayersIntersect,
		color: 'text-amber-400',
	},
	{
		step: '03',
		title: 'Upload Smart',
		desc: 'Intelligent storage allocation across connected accounts.',
		icon: IconRoute,
		color: 'text-emerald-400',
	},
	{
		step: '04',
		title: 'Access Anywhere',
		desc: 'Search, preview, download and manage files from one workspace.',
		icon: IconDevices,
		color: 'text-sky-400',
	},
];

const allocationStrategies = [
	{ title: 'Most Free Space', mode: 'most_free', active: true, desc: 'Routes to account with maximum free capacity' },
	{ title: 'Weighted Capacity', mode: 'weighted_round_robin', active: false, desc: 'Proportional to total cloud drive space' },
	{ title: 'Round Robin', mode: 'round_robin', active: false, desc: 'Sequential alternation step-by-step' },
	{ title: 'Custom Priority', mode: 'manual', active: false, desc: 'User-defined provider order' },
];

const securityPoints = [
	{ title: 'Authenticated Sessions', desc: 'Protected cookies isolate user workspaces' },
	{ title: 'User Data Scoping', desc: 'Files and cloud accounts belong only to you' },
	{ title: 'Protected Cloud OAuth', desc: 'Encrypted tokens scoped per workspace' },
	{ title: 'Ownership Validation', desc: 'Operations verify ownership before access' },
];

function scrollToNext() {
	const nextSection = document.getElementById('showcase');
	if (nextSection) {
		nextSection.scrollIntoView({ behavior: 'smooth' });
	}
}

function navigateToLogin() {
	router.push('/login');
}

function navigateToRegister() {
	router.push('/register');
}
</script>

<template>
	<div class="min-h-screen bg-[#120e0b] font-sans text-[#fcf7f0] selection:bg-[#f97316]/30 selection:text-[#fcf7f0]">
		<!-- Top Minimalist Navigation -->
		<header class="sticky top-0 z-50 border-b border-[rgba(245,225,205,0.06)] bg-[#120e0b]/90 backdrop-blur-xl">
			<div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
				<!-- Brand Logo -->
				<RouterLink to="/landing" class="flex items-center gap-3 transition hover:opacity-90">
					<span class="grid size-10 place-items-center overflow-hidden rounded-2xl border border-[rgba(245,225,205,0.12)] bg-[#1e1712] shadow-md">
						<img :src="logoUrl" alt="OmniCloud Logo" class="size-full object-cover" />
					</span>
					<div class="flex items-center gap-1.5 text-lg font-extrabold tracking-tight text-[#fcf7f0]">
						<span>OmniCloud</span>
						<span class="size-1.5 rounded-full bg-[#f97316] animate-pulse"></span>
					</div>
				</RouterLink>

				<!-- Center Desktop Navigation -->
				<nav class="hidden items-center gap-9 md:flex">
					<a href="#showcase" class="text-xs font-semibold uppercase tracking-wider text-[#b8a693] transition hover:text-[#fcf7f0]">Product</a>
					<a href="#features" class="text-xs font-semibold uppercase tracking-wider text-[#b8a693] transition hover:text-[#fcf7f0]">Features</a>
					<a href="#how-it-works" class="text-xs font-semibold uppercase tracking-wider text-[#b8a693] transition hover:text-[#fcf7f0]">How it Works</a>
					<a href="#storage-allocation" class="text-xs font-semibold uppercase tracking-wider text-[#b8a693] transition hover:text-[#fcf7f0]">Smart Storage</a>
					<a href="#security" class="text-xs font-semibold uppercase tracking-wider text-[#b8a693] transition hover:text-[#fcf7f0]">Security</a>
				</nav>

				<!-- Right Action Buttons -->
				<div class="hidden items-center gap-5 sm:flex">
					<button type="button" class="text-xs font-bold uppercase tracking-wider text-[#b8a693] transition hover:text-[#fcf7f0]" @click="navigateToLogin">
						Sign In
					</button>
					<button type="button" class="h-10 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 text-xs font-extrabold uppercase tracking-wider text-[#fcf7f0] shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]" @click="navigateToRegister">
						Get Started
					</button>
				</div>

				<!-- Mobile Menu Toggle -->
				<button type="button" class="grid size-10 place-items-center rounded-xl border border-[rgba(245,225,205,0.12)] bg-[#1e1712] text-[#b8a693] transition hover:text-[#fcf7f0] md:hidden" @click="isMobileNavOpen = !isMobileNavOpen">
					<component :is="isMobileNavOpen ? IconX : IconMenu2" :size="20" :stroke="2" />
				</button>
			</div>

			<!-- Mobile Navigation Drawer -->
			<div v-if="isMobileNavOpen" class="border-t border-[rgba(245,225,205,0.08)] bg-[#120e0b] px-6 py-6 md:hidden">
				<nav class="flex flex-col gap-4">
					<a href="#showcase" class="text-sm font-semibold uppercase tracking-wider text-[#b8a693] hover:text-[#fcf7f0]" @click="isMobileNavOpen = false">Product</a>
					<a href="#features" class="text-sm font-semibold uppercase tracking-wider text-[#b8a693] hover:text-[#fcf7f0]" @click="isMobileNavOpen = false">Features</a>
					<a href="#how-it-works" class="text-sm font-semibold uppercase tracking-wider text-[#b8a693] hover:text-[#fcf7f0]" @click="isMobileNavOpen = false">How it Works</a>
					<a href="#storage-allocation" class="text-sm font-semibold uppercase tracking-wider text-[#b8a693] hover:text-[#fcf7f0]" @click="isMobileNavOpen = false">Smart Storage</a>
					<a href="#security" class="text-sm font-semibold uppercase tracking-wider text-[#b8a693] hover:text-[#fcf7f0]" @click="isMobileNavOpen = false">Security</a>
					<div class="mt-4 flex flex-col gap-3 pt-4 border-t border-[rgba(245,225,205,0.08)]">
						<button type="button" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] font-semibold text-[#fcf7f0]" @click="navigateToLogin">
							Sign In
						</button>
						<button type="button" class="h-11 w-full rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] font-semibold text-[#fcf7f0] shadow-md" @click="navigateToRegister">
							Get Started
						</button>
					</div>
				</nav>
			</div>
		</header>

		<!-- 1. OSTIUM-STYLE ULTRA-CINEMATIC HERO SECTION -->
		<section class="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-6 py-20 text-center">
			<!-- Dominant Master Visual Background -->
			<div class="pointer-events-none absolute inset-0 z-0">
				<img :src="heroOstiumUrl" alt="OmniCloud Unified Storage Visual" class="size-full object-cover opacity-65 mix-blend-screen scale-105" />
				<div class="absolute inset-0 bg-gradient-to-b from-[#120e0b]/90 via-[#120e0b]/40 to-[#120e0b]"></div>
				<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,#120e0b_88%)]"></div>
			</div>

			<div class="pointer-events-none absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f97316]/12 blur-3xl"></div>

			<div class="relative z-10 mx-auto max-w-4xl space-y-6">
				<p class="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-[#f97316]">
					ALL YOUR CLOUDS. ONE WORKSPACE.
				</p>

				<h1 class="text-5xl font-black tracking-tight text-[#fcf7f0] sm:text-7xl lg:text-8xl lg:leading-[1.04]">
					Every cloud. <br />
					<span class="bg-gradient-to-r from-[#fcf7f0] via-[#f97316] to-[#fb923c] bg-clip-text text-transparent">
						One workspace.
					</span>
				</h1>

				<p class="mx-auto max-w-2xl text-base sm:text-xl text-[#e8dbcc] font-normal leading-relaxed pt-2">
					Connect your cloud storage accounts and manage all your files from one unified workspace.
				</p>

				<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
					<button type="button" class="group flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-9 text-base font-bold text-[#fcf7f0] shadow-[0_10px_35px_-5px_rgba(249,115,22,0.45)] transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]" @click="navigateToRegister">
						<span>Get Started</span>
						<IconArrowRight :size="18" :stroke="2.5" class="transition-transform group-hover:translate-x-1" />
					</button>

					<button type="button" class="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712]/80 backdrop-blur-md px-8 text-base font-semibold text-[#fcf7f0] transition hover:border-[rgba(245,225,205,0.28)] hover:bg-[#261d17]" @click="scrollToNext">
						<span>Explore OmniCloud</span>
						<IconChevronDown :size="18" :stroke="2" />
					</button>
				</div>
			</div>
		</section>

		<!-- 2. CLOUD PROVIDER SHOWCASE SECTION (Large Visual Composition replacing 6 dense cards) -->
		<section id="showcase" class="relative overflow-hidden border-t border-[rgba(245,225,205,0.06)] bg-gradient-to-b from-[#120e0b] via-[#17120e] to-[#120e0b] py-24 lg:py-36">
			<div class="pointer-events-none absolute left-1/4 top-1/2 size-96 -translate-y-1/2 rounded-full bg-[#f97316]/5 blur-3xl"></div>

			<div class="mx-auto max-w-7xl px-6 lg:px-12 space-y-16">
				<!-- Section Editorial Header -->
				<div class="mx-auto max-w-3xl text-center space-y-4">
					<span class="inline-block text-xs font-extrabold uppercase tracking-widest text-[#f97316]">
						ONE WORKSPACE
					</span>
					<h2 class="text-3xl font-extrabold tracking-tight text-[#fcf7f0] sm:text-4xl lg:text-5xl lg:leading-tight">
						All your clouds. <br />
						<span class="bg-gradient-to-r from-[#fcf7f0] via-[#e8dbcc] to-[#f97316] bg-clip-text text-transparent">
							One place.
						</span>
					</h2>
					<p class="text-base leading-relaxed text-[#e8dbcc] sm:text-lg">
						Connect the storage services you already use and manage your files seamlessly through a single unified interface.
					</p>
				</div>

				<!-- Single Focal Master Visual Card -->
				<div class="relative overflow-hidden rounded-[2.5rem] border border-[rgba(249,115,22,0.25)] bg-[#1e1712]/90 shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
					<!-- Visual Image Background -->
					<div class="relative aspect-[16/9] w-full overflow-hidden">
						<img :src="showcaseProvidersUrl" alt="Cloud Providers Converging into OmniCloud" class="size-full object-cover opacity-85 transition-transform duration-700 hover:scale-105" />
						<div class="absolute inset-0 bg-gradient-to-t from-[#120e0b] via-transparent to-[#120e0b]/40"></div>
					</div>

					<!-- Lightweight Provider Pills Overlay Row -->
					<div class="p-8 sm:p-10 border-t border-[rgba(245,225,205,0.08)] bg-[#17120e]">
						<div class="flex flex-wrap items-center justify-center gap-3">
							<span
								v-for="provider in providerPills"
								:key="provider"
								class="flex items-center gap-2 rounded-full border border-[rgba(245,225,205,0.12)] bg-[#1e1712] px-4 py-2 text-xs font-semibold text-[#fcf7f0]"
							>
								<span class="size-2 rounded-full bg-[#f97316] animate-pulse"></span>
								<span>{{ provider }}</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 3. PRODUCT FEATURES SECTION (Focal Mockup + 3 Large Visual Cards) -->
		<section id="features" class="relative overflow-hidden border-t border-[rgba(245,225,205,0.06)] bg-gradient-to-b from-[#120e0b] via-[#17120e] to-[#120e0b] py-24 lg:py-36">
			<div class="pointer-events-none absolute left-1/2 top-1/3 size-[700px] -translate-x-1/2 rounded-full bg-[#f97316]/5 blur-3xl"></div>

			<div class="mx-auto max-w-7xl px-6 lg:px-12 space-y-20">
				<!-- Section Editorial Header -->
				<div class="mx-auto max-w-3xl text-center space-y-4">
					<span class="inline-block text-xs font-extrabold uppercase tracking-widest text-[#f97316]">
						YOUR FILES, UNIFIED
					</span>
					<h2 class="text-3xl font-extrabold tracking-tight text-[#fcf7f0] sm:text-4xl lg:text-5xl lg:leading-tight">
						One workspace. <br />
						<span class="bg-gradient-to-r from-[#fcf7f0] via-[#f97316] to-[#fb923c] bg-clip-text text-transparent">
							Every file.
						</span>
					</h2>
					<p class="text-base leading-relaxed text-[#e8dbcc] sm:text-lg">
						Browse, search, organize, star, preview and manage files across all your connected cloud storage providers.
					</p>
				</div>

				<!-- Single Main Focal Visual: Realistic OmniCloud Dashboard Mockup in 3D Frame -->
				<div class="relative mx-auto max-w-6xl rounded-3xl border border-[rgba(245,225,205,0.14)] bg-[#17120e] p-2.5 sm:p-4 shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
					<div class="mb-3 flex items-center justify-between rounded-2xl border border-[rgba(245,225,205,0.08)] bg-[#120e0b] px-4 py-3">
						<div class="flex items-center gap-2">
							<span class="size-3 rounded-full bg-red-500/80"></span>
							<span class="size-3 rounded-full bg-amber-500/80"></span>
							<span class="size-3 rounded-full bg-emerald-500/80"></span>
						</div>
						<div class="flex items-center gap-2 rounded-xl border border-[rgba(245,225,205,0.1)] bg-[#1e1712] px-4 py-1 text-xs text-[#b8a693]">
							<IconLock :size="14" class="text-emerald-400" />
							<span>https://omnicloud.app/my-drive</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="size-2 rounded-full bg-[#f97316] animate-pulse"></span>
						</div>
					</div>

					<div class="grid grid-cols-1 overflow-hidden rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] md:grid-cols-[240px_1fr]">
						<aside class="hidden border-r border-[rgba(245,225,205,0.08)] bg-[#17120e] p-5 md:flex md:flex-col md:justify-between">
							<div class="space-y-6">
								<div class="flex items-center gap-2.5">
									<span class="grid size-9 place-items-center rounded-xl bg-[#f97316] text-[#fcf7f0]">
										<IconLayersIntersect :size="20" :stroke="2" />
									</span>
									<span class="text-base font-extrabold text-[#fcf7f0]">OmniCloud</span>
								</div>

								<nav class="space-y-1.5">
									<div class="flex items-center gap-3 rounded-xl bg-[#261d17] px-3.5 py-2.5 text-xs font-semibold text-[#f97316]">
										<IconHome :size="18" :stroke="2" />
										<span>Home</span>
									</div>
									<div class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#b8a693]">
										<IconFolder :size="18" :stroke="2" />
										<span>My Files</span>
									</div>
									<div class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#b8a693]">
										<IconStar :size="18" :stroke="2" />
										<span>Starred</span>
									</div>
									<div class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#b8a693]">
										<IconClockHour4 :size="18" :stroke="2" />
										<span>Recent</span>
									</div>
									<div class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#b8a693]">
										<IconServer :size="18" :stroke="2" />
										<span>Cloud Accounts</span>
									</div>
									<div class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#b8a693]">
										<IconSettings :size="18" :stroke="2" />
										<span>Settings</span>
									</div>
								</nav>
							</div>

							<div class="rounded-2xl border border-[rgba(245,225,205,0.1)] bg-[#120e0b] p-3.5">
								<div class="flex justify-between text-xs mb-2">
									<span class="text-[#b8a693]">Storage</span>
									<span class="font-bold text-[#fcf7f0]">59%</span>
								</div>
								<div class="h-2 overflow-hidden rounded-full bg-[#261d17]">
									<div class="h-full w-[59%] rounded-full bg-gradient-to-r from-[#f97316] to-[#ea580c]"></div>
								</div>
								<span class="mt-2 block text-[11px] text-[#b8a693]">68.4 GB / 115.0 GB</span>
							</div>
						</aside>

						<main class="p-4 sm:p-6 space-y-6">
							<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h3 class="text-xl font-bold text-[#fcf7f0]">Good evening</h3>
									<p class="text-xs text-[#b8a693]">Your files, all in one place.</p>
								</div>

								<div class="relative min-w-[240px] sm:min-w-[280px]">
									<IconSearch :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a693]" />
									<div class="w-full rounded-xl border border-[rgba(245,225,205,0.12)] bg-[#120e0b] py-2 pl-9 pr-4 text-xs text-[#b8a693]">
										Search files and folders...
									</div>
								</div>
							</div>

							<div class="grid grid-cols-3 gap-3">
								<div class="rounded-2xl border border-[rgba(245,225,205,0.08)] bg-[#17120e] p-3.5">
									<span class="block text-[11px] text-[#b8a693]">Total Files</span>
									<span class="text-base font-extrabold text-[#fcf7f0] sm:text-lg">1,428</span>
								</div>
								<div class="rounded-2xl border border-[rgba(245,225,205,0.08)] bg-[#17120e] p-3.5">
									<span class="block text-[11px] text-[#b8a693]">Cloud Accounts</span>
									<span class="text-base font-extrabold text-[#fcf7f0] sm:text-lg">6 Connected</span>
								</div>
								<div class="rounded-2xl border border-[rgba(245,225,205,0.08)] bg-[#17120e] p-3.5">
									<span class="block text-[11px] text-[#b8a693]">Available Storage</span>
									<span class="text-base font-extrabold text-[#f97316] sm:text-lg">46.6 GB Free</span>
								</div>
							</div>

							<div class="space-y-3">
								<div class="flex items-center justify-between text-xs">
									<span class="font-bold text-[#fcf7f0]">Recent Files</span>
									<span class="text-[#f97316] font-semibold">View All</span>
								</div>

								<div class="overflow-x-auto rounded-2xl border border-[rgba(245,225,205,0.08)] bg-[#17120e]">
									<table class="w-full text-left text-xs">
										<thead>
											<tr class="border-b border-[rgba(245,225,205,0.08)] bg-[#120e0b] text-[#b8a693]">
												<th class="p-3 font-semibold">File Name</th>
												<th class="p-3 font-semibold max-sm:hidden">Provider</th>
												<th class="p-3 font-semibold">Modified</th>
												<th class="p-3 font-semibold text-right">Size</th>
											</tr>
										</thead>
										<tbody class="divide-y divide-[rgba(245,225,205,0.06)]">
											<tr v-for="file in mockupFiles" :key="file.name" class="hover:bg-[#261d17]">
												<td class="p-3 font-medium text-[#fcf7f0]">
													<div class="flex items-center gap-2.5 min-w-[160px]">
														<component :is="file.icon" :size="18" :class="file.color" />
														<span class="truncate">{{ file.name }}</span>
													</div>
												</td>
												<td class="p-3 text-[#b8a693] max-sm:hidden">
													<span class="rounded-lg border border-[rgba(245,225,205,0.08)] bg-[#120e0b] px-2 py-0.5 text-[11px]">
														{{ file.provider }}
													</span>
												</td>
												<td class="p-3 text-[#b8a693] whitespace-nowrap">{{ file.date }}</td>
												<td class="p-3 text-right font-semibold text-[#fcf7f0] whitespace-nowrap">{{ file.size }}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</main>
					</div>
				</div>

				<!-- 3 Large Image-Based Visual Cards Below Mockup (Replacing text cards) -->
				<div class="grid gap-6 sm:grid-cols-3">
					<div
						v-for="card in visualFeatureCards"
						:key="card.title"
						class="group overflow-hidden rounded-3xl border border-[rgba(245,225,205,0.08)] bg-[#1e1712]/80 transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/40 hover:shadow-2xl"
					>
						<div class="relative aspect-[16/10] overflow-hidden">
							<img :src="card.img" :alt="card.title" class="size-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" />
							<div class="absolute inset-0 bg-gradient-to-t from-[#1e1712] via-transparent to-transparent"></div>
						</div>
						<div class="p-6 space-y-1">
							<span class="text-[10px] font-extrabold uppercase tracking-widest text-[#f97316]">{{ card.badge }}</span>
							<h3 class="text-lg font-bold text-[#fcf7f0]">{{ card.title }}</h3>
							<p class="text-xs text-[#b8a693]">{{ card.subtitle }}</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 4. HOW IT WORKS SECTION (Horizontal Visual Storytelling Journey) -->
		<section id="how-it-works" class="relative overflow-hidden border-t border-[rgba(245,225,205,0.06)] bg-gradient-to-b from-[#120e0b] via-[#1a130e] to-[#120e0b] py-24 lg:py-36">
			<div class="pointer-events-none absolute right-1/3 top-1/4 size-[600px] rounded-full bg-[#f97316]/5 blur-3xl"></div>

			<div class="mx-auto max-w-7xl px-6 lg:px-12 space-y-16">
				<!-- Section Editorial Header -->
				<div class="mx-auto max-w-3xl text-center space-y-4">
					<span class="inline-block text-xs font-extrabold uppercase tracking-widest text-[#f97316]">
						HOW IT WORKS
					</span>
					<h2 class="text-3xl font-extrabold tracking-tight text-[#fcf7f0] sm:text-4xl lg:text-5xl lg:leading-tight">
						From scattered clouds <br />
						<span class="bg-gradient-to-r from-[#fcf7f0] via-[#e8dbcc] to-[#f97316] bg-clip-text text-transparent">
							to one simple workspace.
						</span>
					</h2>
					<p class="text-base leading-relaxed text-[#e8dbcc] sm:text-lg">
						Connect your existing storage accounts, organize everything in one place, and let OmniCloud handle the complexity.
					</p>
				</div>

				<!-- Visual Storytelling Steps Row -->
				<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					<div
						v-for="step in howItWorksSteps"
						:key="step.step"
						class="group relative flex flex-col justify-between rounded-3xl border border-[rgba(245,225,205,0.08)] bg-[#1e1712]/70 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/40 hover:bg-[#261d17]"
					>
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<span class="grid size-11 place-items-center rounded-xl bg-[#120e0b]" :class="step.color">
									<component :is="step.icon" :size="22" :stroke="2" />
								</span>
								<span class="text-2xl font-black text-[#f97316]/40 group-hover:text-[#f97316] transition-colors">
									{{ step.step }}
								</span>
							</div>

							<div>
								<h3 class="text-lg font-bold text-[#fcf7f0] mb-1">{{ step.title }}</h3>
								<p class="text-xs leading-relaxed text-[#b8a693]">{{ step.desc }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 5. SMART STORAGE SECTION (ONE Master Routing Visual Card + Compact Strategy Labels) -->
		<section id="storage-allocation" class="relative overflow-hidden border-t border-[rgba(245,225,205,0.06)] bg-gradient-to-b from-[#120e0b] via-[#17120e] to-[#120e0b] py-24 lg:py-36">
			<div class="pointer-events-none absolute left-1/3 top-1/2 size-[650px] -translate-y-1/2 rounded-full bg-[#f97316]/5 blur-3xl"></div>

			<div class="mx-auto max-w-7xl px-6 lg:px-12 space-y-16">
				<!-- Section Editorial Header -->
				<div class="mx-auto max-w-3xl text-center space-y-4">
					<span class="inline-block text-xs font-extrabold uppercase tracking-widest text-[#f97316]">
						SMART STORAGE
					</span>
					<h2 class="text-3xl font-extrabold tracking-tight text-[#fcf7f0] sm:text-4xl lg:text-5xl lg:leading-tight">
						Upload once. <br />
						<span class="bg-gradient-to-r from-[#fcf7f0] via-[#f97316] to-[#fb923c] bg-clip-text text-transparent">
							Store it intelligently.
						</span>
					</h2>
					<p class="text-base leading-relaxed text-[#e8dbcc] sm:text-lg">
						Use your connected storage accounts as one flexible storage layer and choose how files are allocated across them.
					</p>
				</div>

				<!-- ONE Master Routing Visual Card -->
				<div class="relative overflow-hidden rounded-[2.5rem] border border-[rgba(249,115,22,0.25)] bg-[#1e1712]/90 shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
					<div class="relative aspect-[16/9] w-full overflow-hidden">
						<img :src="smartRoutingUrl" alt="OmniCloud Smart Storage Allocation Routing" class="size-full object-cover opacity-85 transition-transform duration-700 hover:scale-105" />
						<div class="absolute inset-0 bg-gradient-to-t from-[#17120e] via-transparent to-[#120e0b]/40"></div>
					</div>

					<!-- Four Compact Allocation Strategy Labels Underneath -->
					<div class="p-8 sm:p-10 border-t border-[rgba(245,225,205,0.08)] bg-[#17120e]">
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<div
								v-for="strat in allocationStrategies"
								:key="strat.mode"
								class="rounded-2xl border border-[rgba(245,225,205,0.08)] bg-[#1e1712] p-4 text-center transition hover:border-[#f97316]/40"
							>
								<div class="flex items-center justify-center gap-2 mb-1">
									<span v-if="strat.active" class="size-2 rounded-full bg-[#f97316] animate-pulse"></span>
									<span class="text-sm font-bold text-[#fcf7f0]">{{ strat.title }}</span>
								</div>
								<p class="text-[11px] text-[#b8a693] line-clamp-1">{{ strat.desc }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 6. SECURITY & MULTI-USER SECTION (ONE Master Isolated Environments Visual Card) -->
		<section id="security" class="relative overflow-hidden border-t border-[rgba(245,225,205,0.06)] bg-gradient-to-b from-[#120e0b] via-[#18120d] to-[#120e0b] py-24 lg:py-36">
			<div class="pointer-events-none absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f97316]/5 blur-3xl"></div>

			<div class="mx-auto max-w-7xl px-6 lg:px-12 space-y-16">
				<!-- Section Editorial Header -->
				<div class="mx-auto max-w-3xl text-center space-y-4">
					<span class="inline-block text-xs font-extrabold uppercase tracking-widest text-[#f97316]">
						PRIVATE BY DESIGN
					</span>
					<h2 class="text-3xl font-extrabold tracking-tight text-[#fcf7f0] sm:text-4xl lg:text-5xl lg:leading-tight">
						Private by design.
					</h2>
					<p class="text-base leading-relaxed text-[#e8dbcc] sm:text-lg">
						OmniCloud keeps each user's cloud accounts, files, settings and sessions strictly isolated while providing one unified workspace.
					</p>
				</div>

				<!-- ONE Master Isolated Security Environment Visual Card -->
				<div class="relative overflow-hidden rounded-[2.5rem] border border-[rgba(249,115,22,0.25)] bg-[#1e1712]/90 shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
					<div class="relative aspect-[16/9] w-full overflow-hidden">
						<img :src="securityIsolatedUrl" alt="Multi-User Isolated Cloud Environments" class="size-full object-cover opacity-85 transition-transform duration-700 hover:scale-105" />
						<div class="absolute inset-0 bg-gradient-to-t from-[#17120e] via-transparent to-[#120e0b]/40"></div>
					</div>

					<!-- 4 Compact Security Points Underneath -->
					<div class="p-8 sm:p-10 border-t border-[rgba(245,225,205,0.08)] bg-[#17120e]">
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<div
								v-for="point in securityPoints"
								:key="point.title"
								class="flex items-start gap-3 rounded-2xl border border-[rgba(245,225,205,0.08)] bg-[#1e1712] p-4"
							>
								<IconCheck :size="18" class="text-emerald-400 shrink-0 mt-0.5" />
								<div>
									<h4 class="text-xs font-bold text-[#fcf7f0]">{{ point.title }}</h4>
									<p class="text-[11px] text-[#b8a693] mt-0.5">{{ point.desc }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 7. FINAL CALL-TO-ACTION SECTION (Cinematic Conclusion) -->
		<section id="cta" class="relative overflow-hidden border-t border-[rgba(245,225,205,0.06)] bg-[#120e0b] py-24 lg:py-36">
			<div class="mx-auto max-w-7xl px-6 lg:px-12">
				<div class="relative overflow-hidden rounded-[2.5rem] border border-[rgba(249,115,22,0.25)] bg-gradient-to-b from-[#261d17] via-[#1e1712] to-[#17120e] p-8 sm:p-14 lg:p-20 shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
					<div class="pointer-events-none absolute -left-20 -top-20 size-[500px] rounded-full bg-[#f97316]/10 blur-3xl"></div>
					<div class="pointer-events-none absolute -right-20 -bottom-20 size-[500px] rounded-full bg-[#ea580c]/10 blur-3xl"></div>

					<div class="pointer-events-none absolute inset-0 opacity-15">
						<svg class="size-full" xmlns="http://www.w3.org/2000/svg">
							<defs>
								<pattern id="node-grid" width="60" height="60" patternUnits="userSpaceOnUse">
									<circle cx="30" cy="30" r="2" fill="#f97316" />
									<path d="M 30 0 L 30 60 M 0 30 L 60 30" stroke="rgba(245,225,205,0.08)" stroke-width="0.5" />
								</pattern>
							</defs>
							<rect width="100%" height="100%" fill="url(#node-grid)" />
						</svg>
					</div>

					<div class="relative z-10 mx-auto max-w-3xl text-center space-y-6">
						<span class="inline-block text-xs font-extrabold uppercase tracking-widest text-[#f97316]">
							READY WHEN YOU ARE
						</span>

						<h2 class="text-3xl font-extrabold tracking-tight text-[#fcf7f0] sm:text-4xl lg:text-5xl lg:leading-tight">
							Your clouds are already too many. <br />
							<span class="bg-gradient-to-r from-[#fcf7f0] via-[#f97316] to-[#fb923c] bg-clip-text text-transparent">
								Your workspace doesn't have to be.
							</span>
						</h2>

						<p class="mx-auto max-w-2xl text-base leading-relaxed text-[#e8dbcc] sm:text-lg">
							Bring your cloud storage together and manage your files from one unified workspace.
						</p>

						<div class="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
							<button type="button" class="group flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-8 text-base font-bold text-[#fcf7f0] shadow-[0_10px_30px_-5px_rgba(249,115,22,0.45)] transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]" @click="navigateToRegister">
								<span>Get Started</span>
								<IconArrowRight :size="18" :stroke="2.5" class="transition-transform group-hover:translate-x-1" />
							</button>

							<button type="button" class="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] px-8 text-base font-semibold text-[#fcf7f0] transition hover:border-[rgba(245,225,205,0.28)] hover:bg-[#30241c]" @click="navigateToLogin">
								<span>Sign In</span>
							</button>
						</div>

						<p class="pt-2 text-xs text-[#b8a693]">
							Connect your existing cloud storage accounts. No changes to your existing files.
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
