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
	accessKeyId: '',
	secretAccessKey: '',
	bucket: '',
	region: '',
	endpoint: '',
	label: '',
	totalSpace: '',
});

function closeModal() {
	if (props.isConnecting) return;
	emit('close');
}

function submitForm() {
	const gb = Number(form.value.totalSpace);
	emit('connect', {
		accessKeyId: form.value.accessKeyId.trim(),
		secretAccessKey: form.value.secretAccessKey.trim(),
		bucket: form.value.bucket.trim(),
		region: form.value.region.trim() || undefined,
		endpoint: form.value.endpoint.trim() || undefined,
		label: form.value.label.trim() || undefined,
		totalSpace: gb > 0 ? Math.round(gb * 1024 * 1024 * 1024) : undefined,
	});
}
</script>

<template>
	<div class="fixed inset-0 z-50 grid place-items-center bg-[#120e0b]/80 px-4 py-8 backdrop-blur-md">
		<form class="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] p-6 text-[#fcf7f0] shadow-[0_24px_70px_rgba(0,0,0,0.9)]" @submit.prevent="submitForm">
			<div class="mb-2">
				<h2 class="text-xl font-bold text-[#fcf7f0]">{{ t('connectModal.s3.title') }}</h2>
			</div>
			<p class="mb-5 text-sm text-[#b8a693]">{{ t('connectModal.s3.hint') }}</p>

			<p v-if="error" class="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
				{{ error }}
			</p>

			<div class="mb-4 grid grid-cols-2 gap-3">
				<label class="block text-sm">
					<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('connectModal.s3.accessKeyId') }}</span>
					<input v-model="form.accessKeyId" type="text" required autocomplete="off" :placeholder="t('connectModal.s3.accessKeyIdPlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
				</label>
				<label class="block text-sm">
					<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('connectModal.s3.secretAccessKey') }}</span>
					<input v-model="form.secretAccessKey" type="password" required autocomplete="off" :placeholder="t('connectModal.s3.secretAccessKeyPlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
				</label>
			</div>

			<div class="mb-4 grid grid-cols-2 gap-3">
				<label class="block text-sm">
					<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('connectModal.s3.bucket') }}</span>
					<input v-model="form.bucket" type="text" required :placeholder="t('connectModal.s3.bucketPlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
				</label>
				<label class="block text-sm">
					<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('connectModal.s3.region') }}</span>
					<input v-model="form.region" type="text" :placeholder="t('connectModal.s3.regionPlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
				</label>
			</div>

			<label class="mb-4 block text-sm">
				<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('connectModal.s3.endpoint') }}</span>
				<input v-model="form.endpoint" type="text" required :placeholder="t('connectModal.s3.endpointPlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
			</label>

			<div class="mb-4 grid grid-cols-2 gap-3">
				<label class="block text-sm">
					<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('connectModal.s3.label') }}</span>
					<input v-model="form.label" type="text" :placeholder="t('connectModal.s3.labelPlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
				</label>
				<label class="block text-sm">
					<span class="mb-1.5 block font-semibold text-[#b8a693]">{{ t('connectModal.s3.totalSpace') }}</span>
					<input v-model="form.totalSpace" type="number" min="1" :placeholder="t('connectModal.s3.totalSpacePlaceholder')" class="h-11 w-full rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] px-4 text-[#fcf7f0] outline-none transition placeholder:text-[#857362] focus:border-[#f97316]" />
				</label>
			</div>

			<div class="mt-6 flex items-center justify-end gap-3">
				<button type="button" class="h-10 rounded-xl px-4 text-sm font-semibold text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0] disabled:opacity-60" :disabled="isConnecting" @click="closeModal">{{ t('connectModal.cancel') }}</button>
				<button type="submit" class="h-10 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 text-sm font-semibold text-[#fcf7f0] shadow-md transition hover:brightness-110 disabled:opacity-60" :disabled="isConnecting">{{ isConnecting ? t('connectModal.connecting') : t('connectModal.connect') }}</button>
			</div>
		</form>
	</div>
</template>
