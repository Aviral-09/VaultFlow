<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
	isConnecting: {
		type: Boolean,
		default: false,
	},
	error: {
		type: String,
		default: '',
	},
});

const emit = defineEmits(['close', 'connect']);

const { t } = useI18n();

const form = ref({
	username: '',
	password: '',
});

function closeModal() {
	if (props.isConnecting) return;
	emit('close');
}

function submitForm() {
	emit('connect', {
		username: form.value.username.trim(),
		password: form.value.password,
	});
}
</script>

<template>
	<div class="fixed inset-0 z-50 grid place-items-center bg-[#120e0b]/80 px-4 backdrop-blur-md">
		<form class="w-full max-w-md rounded-3xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] p-6 text-[#fcf7f0] shadow-[0_24px_70px_rgba(0,0,0,0.9)]" @submit.prevent="submitForm">
			<div class="mb-2">
				<h2 class="text-xl font-bold text-[#fcf7f0]">{{ t('connectModal.pcloud.title') }}</h2>
			</div>
			<p class="mb-5 text-sm text-[#b8a693]">{{ t('connectModal.pcloud.hint') }}</p>

			<p v-if="error" class="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
				{{ error }}
			</p>

			<label class="mb-4 block text-sm">
				<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('connectModal.pcloud.username') }}</span>
				<input v-model="form.username" type="email" required autocomplete="username" :placeholder="t('connectModal.pcloud.usernamePlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
			</label>

			<label class="block text-sm">
				<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('connectModal.pcloud.password') }}</span>
				<input v-model="form.password" type="password" required autocomplete="current-password" :placeholder="t('connectModal.pcloud.passwordPlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
			</label>

			<div class="mt-6 flex items-center justify-end gap-3">
				<button type="button" class="h-10 rounded-xl px-4 text-sm font-semibold text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0] disabled:opacity-60" :disabled="isConnecting" @click="closeModal">{{ t('connectModal.cancel') }}</button>
				<button type="submit" class="h-10 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 text-sm font-semibold text-[#fcf7f0] shadow-md transition hover:brightness-110 disabled:opacity-60" :disabled="isConnecting">{{ isConnecting ? t('connectModal.connecting') : t('connectModal.connect') }}</button>
			</div>
		</form>
	</div>
</template>
