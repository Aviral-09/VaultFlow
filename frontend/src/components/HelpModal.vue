<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconBook2, IconFolderPlus, IconLifebuoy, IconSearch, IconUpload, IconX } from '@tabler/icons-vue';

defineProps({
	open: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);

const { t, tm } = useI18n();

const usageTips = computed(() => tm('help.usageTipsList'));
const connectAccountSteps = computed(() => tm('help.connectAccountSteps'));

const quickActions = computed(() => [
	{
		icon: IconFolderPlus,
		title: t('help.createFolder'),
		description: t('help.createFolderDesc'),
	},
	{
		icon: IconUpload,
		title: t('help.uploadFiles'),
		description: t('help.uploadFilesDesc'),
	},
	{
		icon: IconSearch,
		title: t('help.searchFiles'),
		description: t('help.searchFilesDesc'),
	},
]);

function closeModal() {
	emit('close');
}
</script>

<template>
	<Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
		<div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center bg-[#120e0b]/80 px-4 py-8 backdrop-blur-md" @click.self="closeModal">
			<div class="relative flex max-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] text-[#fcf7f0] shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
				<button type="button" class="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-xl text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0]" :aria-label="t('common.close')" @click="closeModal">
					<IconX :size="20" :stroke="2" />
				</button>

				<div class="shrink-0 border-b border-[rgba(245,225,205,0.08)] p-6">
					<div class="flex items-start gap-4">
						<div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f97316]/15 text-[#f97316]">
							<IconLifebuoy :size="28" :stroke="1.8" />
						</div>
						<div class="min-w-0 flex-1 pt-1">
							<div class="mb-2 inline-flex items-center gap-2 rounded-full bg-[#f97316]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#f97316]">
								<IconBook2 :size="14" :stroke="2" />
								<span>{{ t('help.centerTitle') }}</span>
							</div>
							<h3 class="text-2xl font-bold text-[#fcf7f0]">{{ t('help.title') }}</h3>
							<p class="mt-1 text-sm leading-6 text-[#b8a693]">
								{{ t('help.subtitle') }}
							</p>
						</div>
					</div>
				</div>

				<div class="space-y-5 overflow-y-auto p-6">
					<div class="grid gap-3 md:grid-cols-3">
						<div v-for="item in quickActions" :key="item.title" class="rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] p-4">
							<div class="mb-3 grid size-10 place-items-center rounded-xl bg-[#f97316]/15 text-[#f97316]">
								<component :is="item.icon" :size="20" :stroke="1.8" />
							</div>
							<h4 class="text-sm font-bold text-[#fcf7f0]">{{ item.title }}</h4>
							<p class="mt-2 text-xs leading-5 text-[#b8a693]">{{ item.description }}</p>
						</div>
					</div>

					<div class="rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] px-5 py-4">
						<h4 class="text-sm font-bold text-[#fcf7f0]">{{ t('help.usageTips') }}</h4>
						<ul class="mt-3 space-y-2 text-sm leading-6 text-[#b8a693]">
							<li v-for="(tip, index) in usageTips" :key="index">• {{ tip }}</li>
						</ul>
					</div>

					<div class="rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] px-5 py-4">
						<h4 class="text-sm font-bold text-[#fcf7f0]">{{ t('help.connectAccount') }}</h4>
						<div class="mt-3 space-y-3 text-sm leading-6 text-[#b8a693]">
							<p v-for="(step, index) in connectAccountSteps" :key="index">{{ step }}</p>
						</div>
					</div>

					<div class="rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#1e1712] px-5 py-4">
						<h4 class="text-sm font-bold text-[#fcf7f0]">{{ t('help.howItWorks') }}</h4>
						<div class="mt-4 space-y-3">
							<div class="flex gap-3">
								<div class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#f97316]/15 text-xs font-bold text-[#f97316]">1</div>
								<p class="text-sm leading-6 text-[#b8a693]">
									{{ t('help.howItWorksStep1') }}
								</p>
							</div>
							<div class="flex gap-3">
								<div class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#f97316]/15 text-xs font-bold text-[#f97316]">2</div>
								<p class="text-sm leading-6 text-[#b8a693]">
									{{ t('help.howItWorksStep2') }}
								</p>
							</div>
							<div class="flex gap-3">
								<div class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#f97316]/15 text-xs font-bold text-[#f97316]">3</div>
								<p class="text-sm leading-6 text-[#b8a693]">
									{{ t('help.howItWorksStep3') }}
								</p>
							</div>
							<div class="flex gap-3">
								<div class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#f97316]/15 text-xs font-bold text-[#f97316]">4</div>
								<p class="text-sm leading-6 text-[#b8a693]">
									{{ t('help.howItWorksStep4') }}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>