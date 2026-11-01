<template>
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div class="flex items-center gap-3">
				<UButton
					to="/iot"
					icon="i-heroicons-arrow-left"
					color="gray"
					variant="ghost"
					size="sm"
				/>
				<div class="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800">
					<UIcon name="i-heroicons-chart-bar" class="w-6 h-6" />
				</div>
				<div>
					<h1 class="text-xl font-bold text-gray-900 dark:text-white">
						Modul IoT Sensor & Telemetri
					</h1>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
						Monitoring parameter lingkungan & medis, manajemen ambang batas, grafik time-series, dan API spec.
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2 flex-wrap">
				<UButton
					icon="i-heroicons-code-bracket"
					color="gray"
					variant="soft"
					size="sm"
					@click="swaggerModal = true"
				>
					Mini-Swagger Sensor
				</UButton>
				<UButton
					icon="i-heroicons-arrow-path"
					color="gray"
					variant="ghost"
					size="sm"
					:loading="loadingDevices"
					@click="fetchDevices"
				>
					Segarkan
				</UButton>
				<UButton
					icon="i-heroicons-plus"
					color="primary"
					size="sm"
					@click="openAddSensorModal"
				>
					Daftarkan Sensor Baru
				</UButton>
			</div>
		</div>

		<!-- Sensor Quick Metrics -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
				<span class="text-xs text-gray-500">Total Sensor Terdaftar</span>
				<div class="flex items-center justify-between mt-1">
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{{ sensorDevices.length }} <span class="text-xs font-normal text-gray-400">Unit</span>
					</p>
					<UIcon name="i-heroicons-cpu-chip" class="w-5 h-5 text-cyan-500" />
				</div>
			</div>
			<div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
				<span class="text-xs text-gray-500">Status Online</span>
				<div class="flex items-center justify-between mt-1">
					<p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
						{{ onlineCount }} <span class="text-xs font-normal text-gray-400">Node</span>
					</p>
					<UIcon name="i-heroicons-signal" class="w-5 h-5 text-emerald-500" />
				</div>
			</div>
			<div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
				<span class="text-xs text-gray-500">Alert Ambang Batas</span>
				<div class="flex items-center justify-between mt-1">
					<p class="text-2xl font-bold text-rose-600 dark:text-rose-400">
						{{ alertCount }} <span class="text-xs font-normal text-gray-400">Warning</span>
					</p>
					<UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-rose-500" />
				</div>
			</div>
			<div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
				<span class="text-xs text-gray-500">Sensor Terpilih Aktif</span>
				<div class="flex items-center justify-between mt-1">
					<p class="text-sm font-bold text-gray-900 dark:text-white truncate">
						{{ activeSensor?.name || 'Belum dipilih' }}
					</p>
					<UBadge v-if="activeSensor" color="primary" variant="subtle" size="xs">
						{{ activeSensor.deviceId }}
					</UBadge>
				</div>
			</div>
		</div>

		<!-- Main Layout: Left Device List, Right Parameter & Graph -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Column 1: Daftar Perangkat Sensor -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
						Daftar Sensor Node
					</h3>
					<span class="text-xs text-gray-400">{{ sensorDevices.length }} unit</span>
				</div>

				<div v-if="loadingDevices" class="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border">
					<UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto text-primary-500" />
				</div>

				<div v-else-if="sensorDevices.length === 0" class="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed">
					<UIcon name="i-heroicons-cpu-chip" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
					<p class="text-xs text-gray-500">Belum ada perangkat sensor yang didaftarkan</p>
					<UButton size="xs" color="primary" class="mt-3" @click="openAddSensorModal">
						Daftarkan Sensor
					</UButton>
				</div>

				<div v-else class="space-y-2.5">
					<div
						v-for="d in sensorDevices"
						:key="d._id"
						class="p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-gray-800"
						:class="
							activeSensor?.deviceId === d.deviceId
								? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm'
								: 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
						"
						@click="activeSensor = d"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span
									class="w-2.5 h-2.5 rounded-full"
									:class="d.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'"
								></span>
								<h4 class="text-sm font-semibold text-gray-900 dark:text-white">
									{{ d.name }}
								</h4>
							</div>
							<UBadge :color="d.status === 'online' ? 'emerald' : 'gray'" size="xs" variant="subtle">
								{{ d.status === 'online' ? 'ONLINE' : 'OFFLINE' }}
							</UBadge>
						</div>

						<div class="mt-2 text-xs text-gray-500 space-y-1">
							<div class="flex justify-between">
								<span>Device ID:</span>
								<span class="font-mono font-medium text-gray-700 dark:text-gray-300">{{ d.deviceId }}</span>
							</div>
							<div class="flex justify-between">
								<span>Lokasi:</span>
								<span class="text-gray-700 dark:text-gray-300">{{ d.location || '-' }}</span>
							</div>
						</div>

						<!-- Latest Parameters Snapshot -->
						<div
							v-if="d.latestTelemetry?.values && Object.keys(d.latestTelemetry.values).length"
							class="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/80 flex items-center gap-3 flex-wrap"
						>
							<div
								v-for="(val, key) in d.latestTelemetry.values"
								:key="key"
								class="text-[11px] px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-900 border font-mono"
							>
								<span class="text-gray-400 capitalize">{{ key }}:</span>
								<span class="font-bold text-gray-900 dark:text-white ml-1">{{ val }}</span>
							</div>
						</div>

						<!-- Action buttons -->
						<div class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-end gap-1">
							<UButton
								size="2xs"
								color="gray"
								variant="ghost"
								icon="i-heroicons-cog-6-tooth"
								@click.stop="openParamModal(d)"
							>
								Parameter
							</UButton>
							<UButton
								size="2xs"
								color="gray"
								variant="ghost"
								icon="i-heroicons-code-bracket"
								@click.stop="openPayloadModal(d)"
							>
								JSON
							</UButton>
							<UButton
								size="2xs"
								color="red"
								variant="ghost"
								icon="i-heroicons-trash"
								@click.stop="confirmDeleteDevice(d)"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Column 2 & 3: Selected Sensor Details & Graph Visualization -->
			<div class="lg:col-span-2 space-y-6">
				<div v-if="activeSensor" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
					<!-- Active Sensor Banner -->
					<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 gap-3">
						<div>
							<div class="flex items-center gap-2">
								<h2 class="text-lg font-bold text-gray-900 dark:text-white">
									{{ activeSensor.name }}
								</h2>
								<UBadge :color="activeSensor.status === 'online' ? 'emerald' : 'gray'" size="xs">
									{{ activeSensor.status.toUpperCase() }}
								</UBadge>
							</div>
							<p class="text-xs text-gray-500 mt-0.5">
								ID: {{ activeSensor.deviceId }} • Lokasi: {{ activeSensor.location || 'Tidak ditentukan' }} • Firmware: {{ activeSensor.firmwareVersion || 'v1.0' }}
							</p>
						</div>

						<div class="flex items-center gap-2">
							<UButton
								size="xs"
								color="primary"
								variant="soft"
								icon="i-heroicons-plus"
								@click="openParamModal(activeSensor)"
							>
								Kelola Parameter
							</UButton>
							<UButton
								size="xs"
								color="emerald"
								variant="ghost"
								icon="i-heroicons-bolt"
								@click="simulateSendReading"
							>
								Simulasi Data Masuk
							</UButton>
						</div>
					</div>

					<!-- Visualisasi Grafik ECharts -->
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<h3 class="text-sm font-bold text-gray-900 dark:text-white">
								Grafik Historis & Real-Time Telemetri
							</h3>
							<span class="text-xs text-gray-400">Time-series Database</span>
						</div>

						<IotSensorHistoryChart
							:device-id="activeSensor.deviceId"
							:available-params="activeSensorParams"
						/>
					</div>

					<!-- Registered Parameters Table -->
					<div class="space-y-2 pt-2">
						<h4 class="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
							Daftar Parameter Terkonfigurasi
						</h4>

						<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
							<table class="w-full text-xs text-left">
								<thead class="bg-gray-50 dark:bg-gray-900/60 text-gray-500">
									<tr>
										<th class="px-3 py-2">Parameter</th>
										<th class="px-3 py-2">Key JSON</th>
										<th class="px-3 py-2">Satuan (Unit)</th>
										<th class="px-3 py-2">Ambang Batas Min / Max</th>
										<th class="px-3 py-2">Nilai Terakhir</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100 dark:divide-gray-800">
									<tr v-for="p in activeSensorParams" :key="p.key">
										<td class="px-3 py-2 font-medium text-gray-900 dark:text-white">
											{{ p.name }}
										</td>
										<td class="px-3 py-2 font-mono text-cyan-600 dark:text-cyan-400">
											{{ p.key }}
										</td>
										<td class="px-3 py-2">{{ p.unit || '-' }}</td>
										<td class="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">
											{{ p.minThreshold !== undefined ? p.minThreshold : '∞' }} — {{ p.maxThreshold !== undefined ? p.maxThreshold : '∞' }}
										</td>
										<td class="px-3 py-2 font-bold font-mono text-emerald-600 dark:text-emerald-400">
											{{ activeSensor.latestTelemetry?.values?.[p.key] ?? '-' }} {{ p.unit }}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div v-else class="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-400">
					<UIcon name="i-heroicons-arrow-left" class="w-8 h-8 mx-auto mb-2 text-gray-300" />
					<p class="text-sm font-semibold">Pilih salah satu sensor di sebelah kiri untuk melihat grafik dan metrik</p>
				</div>
			</div>
		</div>

		<!-- MODAL: DAFTAR SENSOR BARU -->
		<UModal v-model="addSensorModal.isOpen">
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-base font-bold text-gray-900 dark:text-white">
							Daftarkan Sensor IoT Baru
						</h3>
						<UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="addSensorModal.isOpen = false" />
					</div>
				</template>

				<div class="space-y-4">
					<UFormGroup label="Device ID Unik" required help="Gunakan identifier unik seperti SN-001, ESP32-SUHU-01">
						<UInput v-model="addSensorModal.deviceId" placeholder="Contoh: SENSOR-COLDSTORAGE-01" />
					</UFormGroup>
					<UFormGroup label="Nama Sensor" required>
						<UInput v-model="addSensorModal.name" placeholder="Contoh: Sensor Suhu Cold Storage Vaksin" />
					</UFormGroup>
					<UFormGroup label="Lokasi Penempatan">
						<UInput v-model="addSensorModal.location" placeholder="Contoh: Farmasi / Ruang Pendingin" />
					</UFormGroup>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton color="gray" variant="ghost" @click="addSensorModal.isOpen = false">Batal</UButton>
						<UButton color="primary" :loading="addSensorModal.isSaving" @click="saveNewSensor">
							Simpan Sensor
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL: KELOLA PARAMETER DINAMIS -->
		<UModal v-model="paramModal.isOpen" :ui="{ width: 'sm:max-w-xl' }">
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-base font-bold text-gray-900 dark:text-white">
								Kelola Parameter Sensor
							</h3>
							<p class="text-xs text-gray-500">{{ paramModal.deviceName }} ({{ paramModal.deviceId }})</p>
						</div>
						<UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="paramModal.isOpen = false" />
					</div>
				</template>

				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Parameter Terdaftar</span>
						<UButton size="2xs" color="primary" variant="soft" icon="i-heroicons-plus" @click="addParamRow">
							Tambah Parameter
						</UButton>
					</div>

					<div class="space-y-3 max-h-72 overflow-y-auto pr-1">
						<div
							v-for="(p, idx) in paramModal.configs"
							:key="idx"
							class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 relative"
						>
							<button
								type="button"
								class="absolute top-2 right-2 text-gray-400 hover:text-red-500"
								@click="removeParamRow(idx)"
							>
								<UIcon name="i-heroicons-trash" class="w-4 h-4" />
							</button>

							<div class="grid grid-cols-2 gap-2">
								<div>
									<label class="text-[10px] text-gray-500">Nama Parameter</label>
									<UInput v-model="p.name" size="xs" placeholder="e.g. Suhu Ruangan" />
								</div>
								<div>
									<label class="text-[10px] text-gray-500">JSON Key</label>
									<UInput v-model="p.key" size="xs" placeholder="e.g. temperature" />
								</div>
							</div>

							<div class="grid grid-cols-3 gap-2">
								<div>
									<label class="text-[10px] text-gray-500">Satuan (Unit)</label>
									<UInput v-model="p.unit" size="xs" placeholder="e.g. °C" />
								</div>
								<div>
									<label class="text-[10px] text-gray-500">Min Threshold</label>
									<UInput v-model.number="p.minThreshold" type="number" size="xs" placeholder="2" />
								</div>
								<div>
									<label class="text-[10px] text-gray-500">Max Threshold</label>
									<UInput v-model.number="p.maxThreshold" type="number" size="xs" placeholder="8" />
								</div>
							</div>
						</div>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton color="gray" variant="ghost" @click="paramModal.isOpen = false">Batal</UButton>
						<UButton color="primary" :loading="paramModal.isSaving" @click="saveParams">
							Simpan Perubahan
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL: MINI SWAGGER SPEC -->
		<UModal v-model="swaggerModal" :ui="{ width: 'sm:max-w-4xl' }">
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
							<UIcon name="i-heroicons-code-bracket" class="w-5 h-5 text-cyan-500" />
							IoT Sensor API Documentation (Mini-Swagger)
						</h3>
						<UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="swaggerModal = false" />
					</div>
				</template>

				<IotApiExplorer spec-url="/api/iot/sensor/spec" />
			</UCard>
		</UModal>

		<!-- MODAL: PAYLOAD JSON MAPPING -->
		<UModal v-model="payloadModal.isOpen">
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-base font-bold text-gray-900 dark:text-white">
							Mapping JSON Device Sensor
						</h3>
						<UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="payloadModal.isOpen = false" />
					</div>
				</template>

				<pre class="text-xs font-mono bg-gray-900 text-cyan-400 p-3 rounded-lg overflow-x-auto max-h-80">{{ JSON.stringify(payloadModal.data, null, 2) }}</pre>
			</UCard>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'Modul IoT Sensor - e-Health',
	});

	const toast = useToast();
	const loadingDevices = ref(false);
	const sensorDevices = ref<any[]>([]);
	const activeSensor = ref<any>(null);
	const swaggerModal = ref(false);

	const onlineCount = computed(
		() => sensorDevices.value.filter((d) => d.status === 'online').length,
	);
	const alertCount = computed(
		() =>
			sensorDevices.value.filter(
				(d) => d.latestTelemetry?.status === 'danger' || d.latestTelemetry?.status === 'warning',
			).length,
	);

	const activeSensorParams = computed(() => {
		if (activeSensor.value?.sensorConfig && activeSensor.value.sensorConfig.length > 0) {
			return activeSensor.value.sensorConfig;
		}
		return [
			{ key: 'temperature', name: 'Suhu', unit: '°C', minThreshold: 2, maxThreshold: 8 },
			{ key: 'humidity', name: 'Kelembaban', unit: '%', minThreshold: 40, maxThreshold: 70 },
		];
	});

	async function fetchDevices() {
		loadingDevices.value = true;
		try {
			const res = await $fetch<any>('/api/iot/devices');
			const all = res?.data || [];
			// Filter perangkat dengan type sensor atau yang belum memiliki type khusus
			sensorDevices.value = all.filter((d: any) => d.type === 'sensor');
			if (sensorDevices.value.length > 0 && !activeSensor.value) {
				activeSensor.value = sensorDevices.value[0];
			}
		} catch (err: any) {
			toast.add({
				title: 'Gagal memuat perangkat',
				description: err.message,
				color: 'red',
			});
		} finally {
			loadingDevices.value = false;
		}
	}

	// Modal Tambah Sensor
	const addSensorModal = reactive({
		isOpen: false,
		isSaving: false,
		deviceId: '',
		name: '',
		location: '',
	});

	function openAddSensorModal() {
		addSensorModal.deviceId = `SN-${Math.floor(100 + Math.random() * 900)}`;
		addSensorModal.name = '';
		addSensorModal.location = '';
		addSensorModal.isOpen = true;
	}

	async function saveNewSensor() {
		if (!addSensorModal.deviceId || !addSensorModal.name) {
			toast.add({
				title: 'Data belum lengkap',
				description: 'Device ID dan Nama Sensor wajib diisi',
				color: 'amber',
			});
			return;
		}
		addSensorModal.isSaving = true;
		try {
			await $fetch('/api/iot/devices', {
				method: 'POST',
				body: {
					deviceId: addSensorModal.deviceId,
					name: addSensorModal.name,
					location: addSensorModal.location,
					type: 'sensor',
					sensorConfig: [
						{ key: 'temperature', name: 'Suhu Ruang', unit: '°C', minThreshold: 2, maxThreshold: 8 },
						{ key: 'humidity', name: 'Kelembaban', unit: '%', minThreshold: 40, maxThreshold: 70 },
					],
				},
			});
			toast.add({
				title: 'Berhasil',
				description: 'Sensor baru berhasil didaftarkan',
				color: 'emerald',
			});
			addSensorModal.isOpen = false;
			await fetchDevices();
		} catch (err: any) {
			toast.add({
				title: 'Gagal menyimpan sensor',
				description: err.message,
				color: 'red',
			});
		} finally {
			addSensorModal.isSaving = false;
		}
	}

	// Modal Parameter
	const paramModal = reactive({
		isOpen: false,
		isSaving: false,
		deviceId: '',
		deviceName: '',
		configs: [] as any[],
	});

	function openParamModal(device: any) {
		paramModal.deviceId = device.deviceId;
		paramModal.deviceName = device.name;
		paramModal.configs = JSON.parse(
			JSON.stringify(device.sensorConfig || activeSensorParams.value),
		);
		paramModal.isOpen = true;
	}

	function addParamRow() {
		paramModal.configs.push({
			name: 'Parameter Baru',
			key: `param_${Date.now() % 1000}`,
			unit: '',
			minThreshold: undefined,
			maxThreshold: undefined,
		});
	}

	function removeParamRow(idx: number) {
		paramModal.configs.splice(idx, 1);
	}

	async function saveParams() {
		paramModal.isSaving = true;
		try {
			await $fetch('/api/iot/sensor/parameters', {
				method: 'PUT',
				body: {
					deviceId: paramModal.deviceId,
					sensorConfig: paramModal.configs,
				},
			});
			toast.add({
				title: 'Berhasil',
				description: 'Parameter sensor berhasil diperbarui',
				color: 'emerald',
			});
			paramModal.isOpen = false;
			await fetchDevices();
			if (activeSensor.value?.deviceId === paramModal.deviceId) {
				activeSensor.value.sensorConfig = paramModal.configs;
			}
		} catch (err: any) {
			toast.add({
				title: 'Gagal menyimpan parameter',
				description: err.message,
				color: 'red',
			});
		} finally {
			paramModal.isSaving = false;
		}
	}

	// Simulasi Data Masuk (Testing Realtime Ingest)
	async function simulateSendReading() {
		if (!activeSensor.value) return;
		try {
			const temp = (2 + Math.random() * 6).toFixed(1);
			const hum = (50 + Math.random() * 20).toFixed(1);
			await $fetch('/api/iot/sensor/telemetry', {
				method: 'POST',
				body: {
					deviceId: activeSensor.value.deviceId,
					data: {
						temperature: parseFloat(temp),
						humidity: parseFloat(hum),
					},
					connectedSsid: 'Klinik_WiFi_Utama',
					rssi: -60,
				},
			});
			toast.add({
				title: 'Telemetri Terkirim',
				description: `Nilai: Suhu ${temp}°C, Kelembaban ${hum}%`,
				color: 'emerald',
			});
			await fetchDevices();
		} catch (err: any) {
			toast.add({
				title: 'Gagal simulasi',
				description: err.message,
				color: 'red',
			});
		}
	}

	// Payload Modal
	const payloadModal = reactive({
		isOpen: false,
		data: null as any,
	});

	function openPayloadModal(d: any) {
		payloadModal.data = d;
		payloadModal.isOpen = true;
	}

	async function confirmDeleteDevice(d: any) {
		if (!confirm(`Hapus sensor '${d.name}' (${d.deviceId})?`)) return;
		try {
			await $fetch(`/api/iot/devices/${d._id}`, { method: 'DELETE' });
			toast.add({
				title: 'Sensor Dihapus',
				description: `Sensor ${d.name} telah dihapus`,
				color: 'gray',
			});
			if (activeSensor.value?.deviceId === d.deviceId) {
				activeSensor.value = null;
			}
			await fetchDevices();
		} catch (err: any) {
			toast.add({
				title: 'Gagal menghapus sensor',
				description: err.message,
				color: 'red',
			});
		}
	}

	onMounted(() => {
		fetchDevices();
	});
</script>

