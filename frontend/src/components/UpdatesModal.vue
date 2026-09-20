<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconBrandGithub, IconExternalLink, IconGitCommit, IconLoader2, IconRefresh, IconStarFilled, IconX } from '@tabler/icons-vue';

const props = defineProps({
	open: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);

const { t, locale } = useI18n();

const isLoading = ref(false);
const errorMessage = ref('');
const commits = ref([]);
const stars = ref(null);
const lastFetchedAt = ref(null);

const starsLabel = computed(() => {
	if (stars.value === null) {
		return '—';
	}

	return new Intl.NumberFormat('en', { notation: stars.value >= 1000 ? 'compact' : 'standard' }).format(stars.value);
});

function closeModal() {
	emit('close');
}

function formatDate(dateString) {
	if (!dateString) {
		return t('updates.dateUnavailable');
	}

	return new Intl.DateTimeFormat(locale.value === 'id' ? 'id-ID' : 'en-US', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(dateString));
}

function shortSha(sha) {
	return sha?.slice(0, 7) ?? 'commit';
}

function normalizeCommit(commit) {
	return {
		sha: commit.sha,
		message: commit.commit?.message?.split('\n')[0] || t('updates.fallbackCommitMessage'),
		author: commit.commit?.author?.name || commit.author?.login || t('updates.fallbackAuthor'),
		date: commit.commit?.author?.date,
		url: commit.html_url,
	};
}

async function loadUpdates({ force = false } = {}) {
	if (isLoading.value || (!force && commits.value.length && stars.value !== null)) {
		return;
	}

	isLoading.value = true;
	errorMessage.value = '';

	try {
		const [repoResponse, commitsResponse] = await Promise.all([
			fetch('https://api.github.com/repos/dimartarmizi/OmniCloud', { headers: { Accept: 'application/vnd.github+json' } }),
			fetch('https://api.github.com/repos/dimartarmizi/OmniCloud/commits?per_page=6', { headers: { Accept: 'application/vnd.github+json' } }),
		]);

		if (!repoResponse.ok || !commitsResponse.ok) {
			throw new Error(t('updates.fetchError'));
		}

		const [repoData, commitsData] = await Promise.all([repoResponse.json(), commitsResponse.json()]);

		stars.value = repoData.stargazers_count ?? 0;
		commits.value = Array.isArray(commitsData) ? commitsData.map(normalizeCommit) : [];
		lastFetchedAt.value = new Date();
	} catch (error) {
		errorMessage.value = error?.message || t('updates.genericError');
	} finally {
		isLoading.value = false;
	}
}

watch(
	() => props.open,
	(open) => {
		if (open) {
			loadUpdates();
		}
	},
);
</script>

<template>
	<Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
		<div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center bg-[#120e0b]/80 px-4 py-8 backdrop-blur-md" @click.self="closeModal">
			<div class="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] text-[#fcf7f0] shadow-[0_24px_60px_rgba(0,0,0,0.9)] sm:max-h-[calc(100vh-4rem)]">
				<button type="button" class="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-xl text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0]" :aria-label="t('common.close')" @click="closeModal">
					<IconX :size="20" :stroke="2" />
				</button>

				<div class="border-b border-[rgba(245,225,205,0.08)] p-6 pr-16">
					<h3 class="text-2xl font-bold text-[#fcf7f0]">{{ t('updates.title') }}</h3>
					<p class="mt-1 text-sm leading-6 text-[#b8a693]">{{ t('updates.subtitle') }}</p>
				</div>

				<div class="space-y-5 overflow-y-auto p-5 sm:p-6">
					<div class="grid gap-3 sm:grid-cols-[1fr_auto]">
						<a href="https://github.com/dimartarmizi/OmniCloud" target="_blank" rel="noreferrer" class="group flex items-center gap-3 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-4 transition hover:bg-[#30241c]">
							<span class="grid size-11 place-items-center rounded-xl bg-[#120e0b] text-[#f97316]">
								<IconBrandGithub :size="24" :stroke="2" />
							</span>
							<span class="min-w-0 flex-1">
								<span class="block text-sm font-bold text-[#fcf7f0]">dimartarmizi/OmniCloud</span>
								<span class="mt-1 block truncate text-xs text-[#b8a693]">{{ t('updates.openRepository') }}</span>
							</span>
							<IconExternalLink :size="18" :stroke="2" class="text-[#b8a693] transition group-hover:text-[#f97316]" />
						</a>

						<div class="flex items-center justify-center gap-2.5 rounded-2xl border border-[rgba(245,225,205,0.12)] bg-[#1e1712] p-4 text-center text-[#f97316] sm:min-w-40 sm:flex-col sm:items-center sm:justify-center">
							<div class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
								<IconStarFilled :size="14" :stroke="2" class="text-amber-400" />
								<span>{{ t('updates.stars') }}</span>
							</div>
							<div class="text-3xl font-bold text-[#fcf7f0] leading-none">{{ starsLabel }}</div>
						</div>
					</div>

					<div class="rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-5">
						<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h4 class="text-sm font-bold text-[#fcf7f0]">{{ t('updates.latestUpdates') }}</h4>
								<p class="mt-1 text-xs leading-5 text-[#b8a693]">
									<span v-if="lastFetchedAt">{{ t('updates.lastFetched', { date: formatDate(lastFetchedAt) }) }}</span>
									<span v-else>{{ t('updates.latestFromGithub') }}</span>
								</p>
							</div>
							<button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-4 py-2 text-sm font-semibold text-[#fcf7f0] shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isLoading" @click="loadUpdates({ force: true })">
								<IconLoader2 v-if="isLoading" :size="16" :stroke="2" class="animate-spin" />
								<IconRefresh v-else :size="16" :stroke="2" />
								<span>{{ t('common.refresh') }}</span>
							</button>
						</div>

						<div v-if="errorMessage" class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
							{{ errorMessage }}
						</div>

						<div v-else-if="isLoading && !commits.length" class="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-[rgba(245,225,205,0.14)] p-8 text-sm text-[#b8a693]">
							<IconLoader2 :size="20" :stroke="2" class="animate-spin text-[#f97316]" />
							<span>{{ t('updates.loading') }}</span>
						</div>

						<div v-else class="space-y-2.5">
							<a v-for="commit in commits" :key="commit.sha" :href="commit.url" target="_blank" rel="noreferrer" class="group flex gap-3 rounded-xl border border-[rgba(245,225,205,0.06)] bg-[#261d17] p-3 transition hover:bg-[#30241c]">
								<span class="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-[#120e0b] text-[#f97316]">
									<IconGitCommit :size="20" :stroke="2" />
								</span>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-sm font-semibold text-[#fcf7f0] transition group-hover:text-[#f97316]">{{ commit.message }}</span>
									<span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#b8a693]">
										<span>{{ commit.author }}</span>
										<span>•</span>
										<span>{{ formatDate(commit.date) }}</span>
										<span>•</span>
										<span class="font-mono text-[#f97316]">{{ shortSha(commit.sha) }}</span>
									</span>
								</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>
