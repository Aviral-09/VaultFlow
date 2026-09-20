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
	email: '',
	password: '',
	secondFactorCode: '',
});

function closeModal() {
	if (props.isConnecting) return;
	emit('close');
}

function submitForm() {
	emit('connect', {
		email: form.value.email,
		password: form.value.password,
		secondFactorCode: form.value.secondFactorCode || undefined,
	});
}
</script>

<template>
	<div class="fixed inset-0 z-50 grid place-items-center bg-[#120e0b]/80 px-4 backdrop-blur-md">
		<form class="w-full max-w-md rounded-3xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] p-6 text-[#fcf7f0] shadow-[0_24px_70px_rgba(0,0,0,0.9)]" @submit.prevent="submitForm">
			<div class="mb-5">
				<h2 class="text-xl font-bold text-[#fcf7f0]">{{ t('mega.connectTitle') }}</h2>
			</div>

			<p v-if="error" class="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
				{{ error }}
			</p>

			<label class="mb-4 block text-sm">
				<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('mega.email') }}</span>
				<input v-model="form.email" type="email" required autocomplete="username" :placeholder="t('mega.emailPlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
			</label>

			<label class="mb-4 block text-sm">
				<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('mega.password') }}</span>
				<input v-model="form.password" type="password" required autocomplete="current-password" :placeholder="t('mega.passwordPlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
			</label>

			<label class="block text-sm">
				<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('mega.twoFactorCode') }} <span class="text-xs font-normal text-[#857362]">{{ t('mega.twoFactorOptional') }}</span></span>
				<input v-model="form.secondFactorCode" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
			</label>

			<div class="mt-6 flex items-center justify-end gap-3">
				<button type="button" class="h-10 rounded-xl px-4 text-sm font-semibold text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0] disabled:opacity-60" :disabled="isConnecting" @click="closeModal">{{ t('common.cancel') }}</button>
				<button type="submit" class="h-10 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 text-sm font-semibold text-[#fcf7f0] shadow-md transition hover:brightness-110 disabled:opacity-60" :disabled="isConnecting">{{ isConnecting ? t('mega.connecting') : t('mega.connect') }}</button>
			</div>
		</form>
	</div>
</template>
