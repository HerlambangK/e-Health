<template>
	<div class="space-y-4">
		<!-- Header Info -->
		<div
			class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/80"
		>
			<div>
				<div class="flex items-center gap-2">
					<span
						class="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
					>
						OAS 3.0 Compatible
					</span>
					<span class="text-xs text-gray-500 dark:text-gray-400">
						v{{ specData?.version || '1.0.0' }}
					</span>
				</div>
				<h4 class="text-base font-bold text-gray-900 dark:text-white mt-1">
					{{ specData?.title || 'API Documentation' }}
				</h4>
				<p class="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
					{{ specData?.description }}
				</p>
			</div>
			<div class="flex items-center gap-2 shrink-0">
				<UButton
					icon="i-heroicons-arrow-path"
					size="xs"
					color="gray"
					variant="ghost"
					:loading="loading"
					@click="fetchSpec"
				>
					Muat Ulang Spec
				</UButton>
			</div>
		</div>

		<!-- Endpoint List (Swagger Accordion Style) -->
		<div class="space-y-3">
			<div
				v-for="(ep, idx) in specData?.endpoints || []"
				:key="idx"
				class="rounded-xl border overflow-hidden transition-all duration-200"
				:class="getMethodCardBorder(ep.method)"
			>
				<!-- Endpoint Header Bar -->
				<button
					type="button"
					class="w-full flex items-center justify-between p-3.5 text-left transition-colors"
					:class="getMethodHeaderBg(ep.method)"
					@click="toggleExpand(idx)"
				>
					<div class="flex items-center gap-3 flex-wrap">
						<!-- Method Badge -->
						<span
							class="px-2.5 py-1 text-xs font-extrabold uppercase rounded shadow-sm text-white"
							:class="getMethodBadgeColor(ep.method)"
						>
							{{ ep.method }}
						</span>
						<!-- Path -->
						<span
							class="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100"
						>
							{{ ep.path }}
						</span>
						<!-- Short Title -->
						<span class="text-xs text-gray-600 dark:text-gray-400 font-medium">
							— {{ ep.title }}
						</span>
					</div>

					<div class="flex items-center gap-2 shrink-0">
						<span
							class="text-[11px] px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30 text-gray-600 dark:text-gray-300 font-medium"
						>
							{{ ep.auth }}
						</span>
						<UIcon
							:name="
								expandedIndices.includes(idx)
									? 'i-heroicons-chevron-up'
									: 'i-heroicons-chevron-down'
							"
							class="w-4 h-4 text-gray-500"
						/>
					</div>
				</button>

				<!-- Expanded Details & Try It Out -->
				<div
					v-if="expandedIndices.includes(idx)"
					class="p-4 bg-white dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800 space-y-4"
				>
					<p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
						{{ ep.description }}
					</p>

					<!-- Headers Table -->
					<div v-if="ep.headers && ep.headers.length">
						<h5
							class="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-1.5"
						>
							Headers
						</h5>
						<div
							class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"
						>
							<table class="w-full text-xs text-left">
								<thead class="bg-gray-50 dark:bg-gray-800/80 text-gray-500">
									<tr>
										<th class="px-3 py-1.5">Header</th>
										<th class="px-3 py-1.5">Contoh Value</th>
										<th class="px-3 py-1.5">Wajib</th>
									</tr>
								</thead>
								<tbody
									class="divide-y divide-gray-100 dark:divide-gray-800 font-mono text-[11px]"
								>
									<tr v-for="(h, hIdx) in ep.headers" :key="hIdx">
										<td class="px-3 py-1.5 font-semibold text-gray-900 dark:text-gray-200">
											{{ h.name }}
										</td>
										<td class="px-3 py-1.5 text-gray-600 dark:text-gray-400">
											{{ h.value }}
										</td>
										<td class="px-3 py-1.5">
											<span
												v-if="h.required"
												class="text-red-600 dark:text-red-400 font-bold"
											>
												Ya
											</span>
											<span v-else class="text-gray-400">Opsional</span>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<!-- Request Body / Parameters Schema -->
					<div v-if="ep.body">
						<div class="flex items-center justify-between mb-1.5">
							<h5
								class="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider"
							>
								Request Body (JSON Schema & Sample)
							</h5>
							<UButton
								size="2xs"
								color="gray"
								variant="ghost"
								icon="i-heroicons-clipboard-document"
								@click="copyToClipboard(JSON.stringify(ep.body, null, 2))"
							>
								Salin
							</UButton>
						</div>
						<pre
							class="text-[11px] font-mono bg-gray-900 text-emerald-400 p-3 rounded-lg overflow-x-auto max-h-48 leading-relaxed select-all"
						>{{ JSON.stringify(ep.body, null, 2) }}</pre>
					</div>

					<!-- Expected Response Schema -->
					<div v-if="ep.response">
						<div class="flex items-center justify-between mb-1.5">
							<div class="flex items-center gap-2">
								<h5
									class="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider"
								>
									Expected Response
								</h5>
								<span
									class="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded"
									:class="
										ep.response.statusCode >= 200 && ep.response.statusCode < 300
											? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
											: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
									"
								>
									{{ ep.response.statusCode }}
								</span>
							</div>
							<UButton
								size="2xs"
								color="gray"
								variant="ghost"
								icon="i-heroicons-clipboard-document"
								@click="copyToClipboard(JSON.stringify(ep.response.body, null, 2))"
							>
								Salin
							</UButton>
						</div>
						<pre
							class="text-[11px] font-mono bg-gray-950 text-sky-400 p-3 rounded-lg overflow-x-auto max-h-48 leading-relaxed select-all"
						>{{ JSON.stringify(ep.response.body, null, 2) }}</pre>
					</div>

					<!-- Interactive Try It Out Box -->
					<div
						class="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 space-y-2.5"
					>
						<div class="flex items-center justify-between">
							<span
								class="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"
							>
								<UIcon name="i-heroicons-play" class="w-3.5 h-3.5 text-primary-500" />
								Try It Out (Test Endpoint Langsung)
							</span>
							<UButton
								size="xs"
								color="primary"
								:loading="tryState[idx]?.loading"
								@click="executeTryItOut(ep, idx)"
							>
								Execute Request
							</UButton>
						</div>

						<!-- Live Result -->
						<div v-if="tryState[idx]?.executed" class="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
							<div class="flex items-center gap-2 text-xs">
								<span class="text-gray-500">Status Response:</span>
								<span
									class="font-mono font-bold px-1.5 py-0.2 rounded"
									:class="
										tryState[idx]?.status >= 200 && tryState[idx]?.status < 300
											? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
											: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
									"
								>
									{{ tryState[idx]?.status }}
								</span>
								<span class="text-[11px] text-gray-400">
									Durasi: {{ tryState[idx]?.duration }}ms
								</span>
							</div>
							<pre
								class="text-[11px] font-mono bg-gray-900 text-gray-200 p-2.5 rounded-lg overflow-x-auto max-h-40 leading-relaxed"
							>{{ JSON.stringify(tryState[idx]?.result, null, 2) }}</pre>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	interface Props {
		specUrl: string;
	}
	const props = defineProps<Props>();

	const toast = useToast();
	const loading = ref(false);
	const specData = ref<any>(null);
	const expandedIndices = ref<number[]>([0]); // Default buka endpoint pertama
	const tryState = reactive<Record<number, any>>({});

	async function fetchSpec() {
		loading.value = true;
		try {
			const res = await $fetch<any>(props.specUrl);
			if (res?.data) {
				specData.value = res.data;
			}
		} catch (err: any) {
			toast.add({
				title: 'Gagal memuat API Spec',
				description: err.message,
				color: 'red',
			});
		} finally {
			loading.value = false;
		}
	}

	function toggleExpand(idx: number) {
		if (expandedIndices.value.includes(idx)) {
			expandedIndices.value = expandedIndices.value.filter((i) => i !== idx);
		} else {
			expandedIndices.value.push(idx);
		}
	}

	function getMethodBadgeColor(method: string) {
		switch ((method || '').toUpperCase()) {
			case 'GET':
				return 'bg-blue-600';
			case 'POST':
				return 'bg-emerald-600';
			case 'PUT':
				return 'bg-amber-600';
			case 'DELETE':
				return 'bg-rose-600';
			default:
				return 'bg-gray-600';
		}
	}

	function getMethodHeaderBg(method: string) {
		switch ((method || '').toUpperCase()) {
			case 'GET':
				return 'bg-blue-50/60 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40';
			case 'POST':
				return 'bg-emerald-50/60 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40';
			case 'PUT':
				return 'bg-amber-50/60 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/40';
			case 'DELETE':
				return 'bg-rose-50/60 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40';
			default:
				return 'bg-gray-50 hover:bg-gray-100';
		}
	}

	function getMethodCardBorder(method: string) {
		switch ((method || '').toUpperCase()) {
			case 'GET':
				return 'border-blue-200 dark:border-blue-800/60';
			case 'POST':
				return 'border-emerald-200 dark:border-emerald-800/60';
			case 'PUT':
				return 'border-amber-200 dark:border-amber-800/60';
			case 'DELETE':
				return 'border-rose-200 dark:border-rose-800/60';
			default:
				return 'border-gray-200 dark:border-gray-800';
		}
	}

	async function executeTryItOut(ep: any, idx: number) {
		tryState[idx] = { loading: true, executed: false };
		const startTime = Date.now();
		try {
			const options: any = {
				method: ep.method,
			};
			if (ep.method !== 'GET' && ep.body) {
				options.body = ep.body;
			}
			const res = await $fetch<any>(ep.path, options);
			const duration = Date.now() - startTime;
			tryState[idx] = {
				loading: false,
				executed: true,
				status: 200,
				duration,
				result: res,
			};
		} catch (err: any) {
			const duration = Date.now() - startTime;
			tryState[idx] = {
				loading: false,
				executed: true,
				status: err.statusCode || 500,
				duration,
				result: err.data || { error: err.message },
			};
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		toast.add({
			title: 'Tersalin',
			description: 'Data payload telah disalin ke clipboard',
			color: 'green',
			icon: 'i-heroicons-check-circle',
		});
	}

	onMounted(() => {
		fetchSpec();
	});
</script>

