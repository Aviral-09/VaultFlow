<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	IconX,
	IconCopy,
	IconCheck,
	IconDeviceFloppy,
	IconTestPipe,
	IconTrash,
	IconExternalLink,
	IconInfoCircle,
	IconShieldLock,
	IconChevronDown,
	IconChevronUp,
} from '@tabler/icons-vue';
import { api } from '../services/api';
import oneDriveLogo from '../assets/microsoft-onedrive.svg';

const props = defineProps({
	isAdmin: { type: Boolean, default: true },
});

const emit = defineEmits(['close', 'configured', 'connect']);

const { t } = useI18n();

const clientId = ref('');
const clientSecret = ref('');
const redirectUri = ref('');
const isConfigured = ref(false);
const hasClientSecret = ref(false);
const configSource = ref('none');

const isLoading = ref(false);
const isSaving = ref(false);
const isTesting = ref(false);
const isDeleting = ref(false);

const statusMessage = ref('');
const errorMessage = ref('');
const testSuccessMessage = ref('');
const copied = ref(false);

const isGuideOpen = ref(true);

const computedRedirectUri = computed(() => {
	if (redirectUri.value) return redirectUri.value;
	if (typeof window !== 'undefined' && window.location) {
		return `${window.location.origin}/api/accounts/onedrive/callback`;
	}
	return 'http://localhost:8787/api/accounts/onedrive/callback';
});

async function loadConfig() {
	isLoading.value = true;
	errorMessage.value = '';
	statusMessage.value = '';
	testSuccessMessage.value = '';

	try {
		const { data } = await api.getOneDriveProviderConfig();
		if (data) {
			isConfigured.value = Boolean(data.configured);
			clientId.value = data.clientId || '';
			redirectUri.value = data.redirectUri || computedRedirectUri.value;
			hasClientSecret.value = Boolean(data.hasClientSecret);
			configSource.value = data.source || 'none';
		}
	} catch (err) {
		errorMessage.value = err.message || 'Failed to load OneDrive setup details.';
	} finally {
		isLoading.value = false;
	}
}

async function copyRedirectUri() {
	const targetUri = redirectUri.value || computedRedirectUri.value;
	try {
		await navigator.clipboard.writeText(targetUri);
		copied.value = true;
		setTimeout(() => {
			copied.value = false;
		}, 2000);
	} catch {
		const input = document.createElement('input');
		input.value = targetUri;
		document.body.appendChild(input);
		input.select();
		document.execCommand('copy');
		document.body.removeChild(input);
		copied.value = true;
		setTimeout(() => {
			copied.value = false;
		}, 2000);
	}
}

async function handleTest() {
	isTesting.value = true;
	errorMessage.value = '';
	statusMessage.value = '';
	testSuccessMessage.value = '';

	try {
		const payload = {
			clientId: clientId.value.trim(),
			clientSecret: clientSecret.value.trim(),
			redirectUri: (redirectUri.value || computedRedirectUri.value).trim(),
		};

		const { data } = await api.testOneDriveProviderConfig(payload);
		testSuccessMessage.value = data?.message || 'OneDrive OAuth configuration verified successfully.';
	} catch (err) {
		errorMessage.value = err.message || 'OneDrive OAuth configuration test failed.';
	} finally {
		isTesting.value = false;
	}
}

async function handleSave() {
	isSaving.value = true;
	errorMessage.value = '';
	statusMessage.value = '';
	testSuccessMessage.value = '';

	try {
		const payload = {
			clientId: clientId.value.trim(),
			clientSecret: clientSecret.value.trim(),
			redirectUri: (redirectUri.value || computedRedirectUri.value).trim(),
		};

		const { data } = await api.saveOneDriveProviderConfig(payload);
		if (data) {
			isConfigured.value = Boolean(data.configured);
			hasClientSecret.value = Boolean(data.hasClientSecret);
			configSource.value = data.source || 'database';
			clientSecret.value = '';
			statusMessage.value = 'OneDrive OAuth configuration saved securely to backend database.';
			emit('configured', data);
		}
	} catch (err) {
		errorMessage.value = err.message || 'Failed to save OneDrive OAuth configuration.';
	} finally {
		isSaving.value = false;
	}
}

async function handleDelete() {
	if (!confirm('Are you sure you want to remove the database OneDrive OAuth configuration? Server environment variables will be used as fallback if set.')) {
		return;
	}

	isDeleting.value = true;
	errorMessage.value = '';
	statusMessage.value = '';
	testSuccessMessage.value = '';

	try {
		const { data } = await api.deleteOneDriveProviderConfig();
		if (data) {
			isConfigured.value = Boolean(data.configured);
			clientId.value = data.clientId || '';
			hasClientSecret.value = Boolean(data.hasClientSecret);
			configSource.value = data.source || 'none';
			clientSecret.value = '';
			statusMessage.value = 'Database OneDrive OAuth configuration removed.';
			emit('configured', data);
		}
	} catch (err) {
		errorMessage.value = err.message || 'Failed to remove configuration.';
	} finally {
		isDeleting.value = false;
	}
}

function handleConnect() {
	emit('connect');
}

onMounted(() => {
	loadConfig();
});
</script>

<template>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
		<div class="relative w-full max-w-2xl rounded-3xl border border-[rgba(245,225,205,0.14)] bg-[#1e1712] p-6 text-[#fcf7f0] shadow-2xl sm:p-8 my-8">
			<!-- Close Button -->
			<button type="button" class="absolute right-5 top-5 grid size-9 place-items-center rounded-2xl border border-[rgba(245,225,205,0.1)] bg-[#261d17] text-[#b8a693] transition hover:bg-[#30241c] hover:text-[#fcf7f0]" @click="emit('close')">
				<IconX :size="20" :stroke="2" />
			</button>

			<!-- Header -->
			<div class="flex items-center gap-3.5 mb-6">
				<div class="grid size-12 place-items-center rounded-2xl bg-[#0078d4]/15 border border-[#0078d4]/30">
					<img :src="oneDriveLogo" alt="OneDrive Logo" class="size-7 object-contain" />
				</div>
				<div>
					<h2 class="text-xl font-bold text-[#fcf7f0]">OneDrive Provider Setup</h2>
					<p class="text-xs text-[#b8a693]">Configure global deployment credentials for Microsoft OneDrive OAuth</p>
				</div>
			</div>

			<!-- Loading State -->
			<div v-if="isLoading" class="py-12 text-center text-sm text-[#b8a693]">
				Loading configuration...
			</div>

			<template v-else>
				<!-- Config Status Banner -->
				<div class="mb-6 rounded-2xl border p-4 text-xs leading-relaxed flex items-start justify-between gap-3" :class="isConfigured
					? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
					: 'border-amber-500/30 bg-amber-500/10 text-amber-300'">
					<div class="flex items-center gap-2.5">
						<span class="size-2.5 rounded-full shrink-0" :class="isConfigured ? 'bg-emerald-400' : 'bg-amber-400'" />
						<div>
							<strong class="block text-sm font-semibold">
								Status: {{ isConfigured ? 'Configured & Ready' : 'Not Configured' }}
							</strong>
							<span class="text-xs opacity-80">
								Source: {{ configSource === 'database' ? 'Encrypted Database Storage' : configSource === 'environment' ? 'Environment Variables' : 'None' }}
							</span>
						</div>
					</div>
					<button v-if="isConfigured" type="button" class="shrink-0 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-3.5 py-1.5 text-xs font-semibold text-[#fcf7f0] shadow-sm hover:brightness-110" @click="handleConnect">
						Connect OneDrive
					</button>
				</div>

				<!-- Step-by-Step Microsoft Azure Guide -->
				<div class="mb-6 rounded-2xl border border-[rgba(245,225,205,0.09)] bg-[#261d17] overflow-hidden">
					<button type="button" class="flex w-full items-center justify-between p-4 text-left text-xs font-semibold text-[#f97316]" @click="isGuideOpen = !isGuideOpen">
						<span class="flex items-center gap-2">
							<IconInfoCircle :size="16" :stroke="2" />
							Microsoft Entra / Azure Portal Setup Guide (Step-by-Step)
						</span>
						<IconChevronUp v-if="isGuideOpen" :size="16" />
						<IconChevronDown v-else :size="16" />
					</button>

					<div v-show="isGuideOpen" class="px-4 pb-4 text-xs text-[#b8a693] space-y-2 border-t border-[rgba(245,225,205,0.06)] pt-3">
						<ol class="list-decimal list-inside space-y-1.5 leading-relaxed">
							<li>Go to <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener" class="text-[#f97316] underline inline-flex items-center gap-1">Azure Portal App Registrations <IconExternalLink :size="12" /></a>.</li>
							<li>Click <strong>New registration</strong>, and name it (e.g. <code>OmniCloud App</code>).</li>
							<li>Under <strong>Supported account types</strong>, choose: <em>Accounts in any organizational directory and personal Microsoft accounts (e.g. Skype, Xbox, Outlook)</em>.</li>
							<li>Under <strong>Redirect URI</strong>, select <strong>Web</strong> platform, and enter this exact URL:
								<div class="mt-1 flex items-center gap-2 rounded-xl border border-[rgba(245,225,205,0.1)] bg-[#120e0b] p-2 font-mono text-[11px] text-[#fcf7f0]">
									<span class="truncate flex-1">{{ redirectUri || computedRedirectUri }}</span>
									<button type="button" class="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#f97316]/20 px-2 py-1 text-[10px] font-semibold text-[#f97316] hover:bg-[#f97316]/30" @click="copyRedirectUri">
										<IconCheck v-if="copied" :size="12" class="text-emerald-400" />
										<IconCopy v-else :size="12" />
										{{ copied ? 'Copied' : 'Copy' }}
									</button>
								</div>
							</li>
							<li>Click <strong>Register</strong>. Copy the <strong>Application (client) ID</strong> from the overview page.</li>
							<li>Navigate to <strong>Certificates & secrets</strong> → <strong>New client secret</strong>, add a secret, and copy the <strong>Value</strong> (not the Secret ID).</li>
							<li>Paste your Application (Client) ID and Client Secret Value below, then click <strong>Save & Test</strong>.</li>
						</ol>
					</div>
				</div>

				<!-- Setup Form -->
				<form class="space-y-4" @submit.prevent="handleSave">
					<!-- Application (Client) ID -->
					<div>
						<label class="block text-xs font-semibold text-[#b8a693] mb-1.5">
							Application (Client) ID <span class="text-red-400">*</span>
						</label>
						<input v-model="clientId" type="text" placeholder="e.g. 11112222-3333-4444-5555-666677778888" class="w-full rounded-xl border border-[rgba(245,225,205,0.12)] bg-[#120e0b] px-3.5 py-2.5 text-sm text-[#fcf7f0] placeholder-[#857362] focus:border-[#f97316] focus:outline-none font-mono" required />
					</div>

					<!-- Client Secret -->
					<div>
						<label class="block text-xs font-semibold text-[#b8a693] mb-1.5 flex items-center justify-between">
							<span>Client Secret Value <span v-if="!hasClientSecret" class="text-red-400">*</span></span>
							<span v-if="hasClientSecret" class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
								<IconShieldLock :size="14" /> Secret Encrypted on Server
							</span>
						</label>
						<input v-model="clientSecret" type="password" :placeholder="hasClientSecret ? '•••••••••••••••• (Leave blank to keep existing secret)' : 'Paste Client Secret Value from Azure Portal'" class="w-full rounded-xl border border-[rgba(245,225,205,0.12)] bg-[#120e0b] px-3.5 py-2.5 text-sm text-[#fcf7f0] placeholder-[#857362] focus:border-[#f97316] focus:outline-none" :required="!hasClientSecret" />
					</div>

					<!-- Redirect URI -->
					<div>
						<label class="block text-xs font-semibold text-[#b8a693] mb-1.5">
							Redirect URI
						</label>
						<div class="flex items-center gap-2">
							<input v-model="redirectUri" type="text" :placeholder="computedRedirectUri" class="flex-1 rounded-xl border border-[rgba(245,225,205,0.12)] bg-[#120e0b] px-3.5 py-2.5 text-sm text-[#fcf7f0] placeholder-[#857362] focus:border-[#f97316] focus:outline-none font-mono text-xs" />
							<button type="button" class="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] px-3 py-2.5 text-xs font-semibold text-[#fcf7f0] hover:bg-[#30241c]" @click="copyRedirectUri">
								<IconCheck v-if="copied" :size="16" class="text-emerald-400" />
								<IconCopy v-else :size="16" />
								<span>{{ copied ? 'Copied' : 'Copy' }}</span>
							</button>
						</div>
					</div>

					<!-- Alert Feedback -->
					<p v-if="errorMessage" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
						{{ errorMessage }}
					</p>
					<p v-if="statusMessage" class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
						{{ statusMessage }}
					</p>
					<p v-if="testSuccessMessage" class="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs text-blue-300">
						{{ testSuccessMessage }}
					</p>

					<!-- Action Controls -->
					<div class="pt-3 flex flex-wrap items-center justify-between gap-3">
						<button v-if="configSource === 'database'" type="button" class="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60" :disabled="isDeleting" @click="handleDelete">
							<IconTrash :size="16" />
							<span>{{ isDeleting ? 'Removing...' : 'Remove Config' }}</span>
						</button>
						<span v-else />

						<div class="flex flex-wrap items-center gap-2">
							<button type="button" class="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(245,225,205,0.14)] bg-[#261d17] px-4 py-2.5 text-xs font-semibold text-[#fcf7f0] transition hover:bg-[#30241c] disabled:opacity-60" :disabled="isTesting || !clientId" @click="handleTest">
								<IconTestPipe :size="16" />
								<span>{{ isTesting ? 'Testing...' : 'Test Connection' }}</span>
							</button>

							<button type="submit" class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 py-2.5 text-xs font-semibold text-[#fcf7f0] shadow-md transition hover:brightness-110 disabled:opacity-60" :disabled="isSaving">
								<IconDeviceFloppy :size="16" />
								<span>{{ isSaving ? 'Saving...' : 'Save Configuration' }}</span>
							</button>
						</div>
					</div>
				</form>
			</template>
		</div>
	</div>
</template>
