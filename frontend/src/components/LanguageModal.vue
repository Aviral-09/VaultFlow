<script setup>
import { IconLanguage, IconX } from '@tabler/icons-vue';
import { useI18n } from 'vue-i18n';
import idFlag from '../assets/id.svg';
import usFlag from '../assets/us.svg';
import { useSettingsStore } from '../stores/settings';

defineProps({
	open: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const settingsStore = useSettingsStore();

const languages = [
	{ code: 'id', label: 'Bahasa Indonesia', flag: idFlag },
	{ code: 'en', label: 'English', flag: usFlag },
];

async function selectLanguage(code) {
	await settingsStore.updateLanguage(code);
	emit('close');
}

function closeModal() {
	emit('close');
}
</script>

<template>
	<Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
		<div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center bg-[#120e0b]/80 px-4 py-8 backdrop-blur-md" @click.self="closeModal">
			<div class="relative flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] text-[#fcf7f0] shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
				<button type="button" class="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-xl text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0]" :aria-label="t('common.close')" @click="closeModal">
					<IconX :size="20" :stroke="2" />
				</button>

				<div class="shrink-0 border-b border-[rgba(245,225,205,0.08)] p-6">
					<div class="flex items-start gap-4">
						<div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f97316]/15 text-[#f97316]">
							<IconLanguage :size="28" :stroke="1.8" />
						</div>
						<div class="min-w-0 flex-1 pt-1">
							<h3 class="text-xl font-bold text-[#fcf7f0]">{{ t('language.title') }}</h3>
							<p class="text-sm leading-6 text-[#b8a693]">
								{{ t('language.selectLanguage') }}
							</p>
						</div>
					</div>
				</div>

				<div class="overflow-y-auto p-4">
					<div class="grid gap-2.5">
						<button v-for="lang in languages" :key="lang.code" type="button" class="flex items-center gap-4 rounded-2xl border p-4 text-left transition-all" :class="settingsStore.language === lang.code ? 'border-[#f97316] bg-[#f97316]/15 shadow-md' : 'border-[rgba(245,225,205,0.09)] bg-[#1e1712] hover:border-[#f97316]/40 hover:bg-[#30241c]'" @click="selectLanguage(lang.code)">
							<img :src="lang.flag" :alt="lang.label" class="h-8 w-8 rounded-full object-cover ring-2 ring-[rgba(245,225,205,0.15)]" />
							<span class="text-base font-semibold text-[#fcf7f0]">{{ lang.label }}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>
