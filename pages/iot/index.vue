<template>
	<div class="space-y-6">
		<!-- Page Header -->
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div class="flex items-center gap-3">
				<div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
					<UIcon name="i-heroicons-cpu-chip" class="w-7 h-7" />
				</div>
				<div>
					<h1 class="text-xl font-bold text-gray-900 dark:text-white">
						Platform IoT Modular
					</h1>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
						Pilih modul bisnis untuk monitoring perangkat, integrasi hardware, dan dokumentasi API.
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<UBadge color="emerald" variant="subtle" size="md">
					<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
					Core Engine Active
				</UBadge>
			</div>
		</div>

		<!-- Module Selection Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- CARD 1: MODUL PRESENSI IOT -->
			<div
				class="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-500/50 flex flex-col justify-between"
			>
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
							<UIcon name="i-heroicons-identification" class="w-6 h-6" />
						</div>
						<UBadge color="emerald" variant="soft">
							Modul Presensi
						</UBadge>
					</div>

					<div>
						<h2 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
							Integrasi Device Presensi (RFID)
						</h2>
						<p class="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
							Monitoring mesin tap kartu RFID ESP32/Arduino, log kehadiran pegawai masuk dan pulang, rekap shift, registrasi device, serta Mini-Swagger API Presensi.
						</p>
					</div>

					<div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
						<div class="flex items-center gap-2">
							<UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-500 shrink-0" />
							<span>Daftar & Konfigurasi Mesin Tap RFID</span>
						</div>
						<div class="flex items-center gap-2">
							<UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-500 shrink-0" />
							<span>Tabel Rekap Masuk/Pulang & Manual Input</span>
						</div>
						<div class="flex items-center gap-2">
							<UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-500 shrink-0" />
							<span>Mini-Swagger & Tutorial Integrasi Kode Arduino</span>
						</div>
					</div>
				</div>

				<div class="pt-6 mt-4">
					<UButton
						to="/iot/presensi"
						color="emerald"
						block
						size="md"
						icon="i-heroicons-arrow-right"
						trailing
					>
						Buka Modul Presensi
					</UButton>
				</div>
			</div>

			<!-- CARD 2: MODUL IOT SENSOR -->
			<div
				class="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-cyan-500/50 flex flex-col justify-between"
			>
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div class="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
							<UIcon name="i-heroicons-chart-bar" class="w-6 h-6" />
						</div>
						<UBadge color="cyan" variant="soft">
							Modul Sensor & Telemetri
						</UBadge>
					</div>

					<div>
						<h2 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
							Monitoring Sensor & Visualisasi Grafik
						</h2>
						<p class="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
							Pemantauan parameter fisik (suhu cold storage vaksin, kelembaban ruang operasi, tekanan gas medis), parameter management dinamis, dan grafik time-series ECharts.
						</p>
					</div>

					<div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
						<div class="flex items-center gap-2">
							<UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-cyan-500 shrink-0" />
							<span>Dynamic Parameter Management (Suhu, RH, Bar, V)</span>
						</div>
						<div class="flex items-center gap-2">
							<UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-cyan-500 shrink-0" />
							<span>Visualisasi Grafik ECharts Historis & Real-time</span>
						</div>
						<div class="flex items-center gap-2">
							<UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-cyan-500 shrink-0" />
							<span>Mini-Swagger Sensor & Alerting Ambang Batas</span>
						</div>
					</div>
				</div>

				<div class="pt-6 mt-4">
					<UButton
						to="/iot/sensor"
						color="cyan"
						block
						size="md"
						icon="i-heroicons-arrow-right"
						trailing
					>
						Buka Modul IoT Sensor
					</UButton>
				</div>
			</div>
		</div>

		<!-- Shared Infrastructure Quick Info -->
		<div class="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
			<div class="flex items-center gap-2">
				<UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-gray-400" />
				<span>Shared IoT Core mengelola registrasi hardware, heartbeat online/offline, dan Multi-AP WiFi fallback secara terpadu.</span>
			</div>
			<div class="font-mono text-[11px] bg-white dark:bg-gray-900 px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700">
				WiFi Pool Endpoint: GET /api/wifi-config
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'IoT Platform Modular - e-Health',
	});
</script>
