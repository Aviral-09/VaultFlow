<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { IconCheck, IconMoon, IconSun, IconLanguage, IconArrowLeft, IconSparkles } from '@tabler/icons-vue';
import { setLocale } from '../../i18n';
import logoUrl from '../../assets/logo.webp';
import heroOstiumUrl from '../../assets/hero-ostium.jpg';

defineProps({
	title: { type: String, default: '' },
	subtitle: { type: String, default: '' },
});

const { t, locale } = useI18n();
const router = useRouter();

const isDark = ref(document.documentElement.classList.contains('dark'));
const nextLanguageLabel = computed(() => (locale.value === 'id' ? 'ID' : 'EN'));

function toggleTheme() {
	const next = isDark.value ? 'light' : 'dark';
	isDark.value = !isDark.value;
	document.documentElement.classList.toggle('dark', next === 'dark');
	window.localStorage.setItem('omnicloud-theme', next);
}

function toggleLanguage() {
	setLocale(locale.value === 'id' ? 'en' : 'id');
}

function navigateHome() {
	router.push('/landing');
}
</script>

<template>
	<div class="min-h-screen bg-[#120e0b] font-sans text-[#fcf7f0] selection:bg-[#f97316]/30 selection:text-[#fcf7f0] relative flex flex-col justify-between overflow-x-hidden">
		<!-- Top Bar Header -->
		<header class="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-[rgba(245,225,205,0.06)] bg-[#120e0b]/90 px-6 backdrop-blur-xl lg:px-12">
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

			<!-- Right Navigation Controls -->
			<div class="flex items-center gap-4">
				<button type="button" class="hidden items-center gap-2 rounded-xl border border-[rgba(245,225,205,0.12)] bg-[#1e1712] px-4 py-2 text-xs font-semibold text-[#b8a693] transition hover:border-[#f97316]/40 hover:text-[#fcf7f0] sm:flex" @click="navigateHome">
					<IconArrowLeft :size="16" />
					<span>Back to Home</span>
				</button>

				<button type="button" class="flex h-9 items-center gap-1.5 rounded-xl border border-[rgba(245,225,205,0.12)] bg-[#1e1712] px-3 text-xs font-semibold text-[#b8a693] transition hover:text-[#fcf7f0]" :title="t('common.language')" @click="toggleLanguage">
					<IconLanguage :size="16" />
					<span>{{ nextLanguageLabel }}</span>
				</button>

				<button type="button" class="grid size-9 place-items-center rounded-xl border border-[rgba(245,225,205,0.12)] bg-[#1e1712] text-[#b8a693] transition hover:text-[#fcf7f0]" :title="t('header.toggleTheme')" @click="toggleTheme">
					<IconSun v-if="isDark" :size="16" />
					<IconMoon v-else :size="16" />
				</button>
			</div>
		</header>

		<!-- Main Asymmetric Cinematic Authentication Shell -->
		<main class="relative z-10 mx-auto my-auto flex w-full max-w-7xl flex-1 items-center px-6 py-12 lg:px-12">
			<div class="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-16">
				<!-- Left Column: Master Cinematic Visual (58% width on desktop) -->
				<div class="relative hidden flex-col justify-between space-y-8 lg:col-span-7 lg:flex">
					<!-- Visual Box with Atmospheric Vignette Masks -->
					<div class="relative aspect-[16/10] w-full overflow-hidden rounded-[2.5rem] border border-[rgba(249,115,22,0.25)] bg-[#1e1712] shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
						<img :src="heroOstiumUrl" alt="OmniCloud Visual Core" class="size-full object-cover opacity-75 mix-blend-screen transition-transform duration-700 hover:scale-105" />
						<div class="absolute inset-0 bg-gradient-to-t from-[#120e0b] via-transparent to-[#120e0b]/30"></div>
						<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#120e0b_90%)]"></div>

						<!-- Overlay Tagline -->
						<div class="absolute bottom-8 left-8 right-8 space-y-2">
							<div class="inline-flex items-center gap-2 rounded-full border border-[rgba(249,115,22,0.3)] bg-[#120e0b]/80 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#f97316] backdrop-blur-md">
								<IconSparkles :size="13" />
								<span>ALL YOUR CLOUDS. ONE WORKSPACE.</span>
							</div>
							<h2 class="text-2xl font-extrabold tracking-tight text-[#fcf7f0]">
								Every cloud. <span class="text-[#f97316]">One workspace.</span>
							</h2>
						</div>
					</div>
				</div>

				<!-- Right Column: Compact Elegant Authentication Form Container (42% width on desktop) -->
				<div class="mx-auto w-full max-w-md lg:col-span-5">
					<!-- Ambient Glow Behind Form -->
					<div class="pointer-events-none absolute -right-20 top-1/2 size-96 -translate-y-1/2 rounded-full bg-[#f97316]/10 blur-3xl"></div>

					<div class="relative overflow-hidden rounded-3xl border border-[rgba(245,225,205,0.12)] bg-[#1e1712]/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
						<!-- Auth Header -->
						<div class="mb-8 space-y-2">
							<h1 class="text-2xl font-extrabold tracking-tight text-[#fcf7f0] sm:text-3xl">{{ title }}</h1>
							<p v-if="subtitle" class="text-xs leading-relaxed text-[#b8a693] sm:text-sm">{{ subtitle }}</p>
						</div>

						<!-- Form Slot -->
						<slot />
					</div>
				</div>
			</div>
		</main>

		<!-- Footer -->
		<footer class="relative z-10 border-t border-[rgba(245,225,205,0.06)] py-6 text-center text-xs text-[#857362]">
			<p>© {{ new Date().getFullYear() }} OmniCloud. All rights reserved.</p>
		</footer>
	</div>
</template>

<style scoped>
/* Auth Layout Minimal Specifics */
</style>
