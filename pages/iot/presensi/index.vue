<template>
	<div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
		<!-- Header Halaman -->
		<div
			class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800"
		>
			<div>
				<div class="flex items-center gap-3">
					<UButton
						to="/iot"
						icon="i-heroicons-arrow-left"
						color="gray"
						variant="ghost"
						size="sm"
					/>
					<div
						class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800/50 shadow-sm"
					>
						<UIcon name="i-heroicons-identification" class="w-6 h-6" />
					</div>
					<div>
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
							Modul Presensi IoT
						</h1>
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
							Monitoring mesin tap kartu RFID ESP32/Arduino, status device ON/OFF, deteksi WiFi fallback, dan integrasi presensi.
						</p>
					</div>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<UButton
					to="/iot/sensor"
					icon="i-heroicons-chart-bar"
					color="gray"
					variant="ghost"
					size="sm"
				>
					Buka Modul Sensor
				</UButton>
				<UButton
					icon="i-heroicons-academic-cap"
					color="emerald"
					variant="solid"
					size="sm"
					@click="openTutorialModal(null)"
				>
					Tutorial Koneksi IoT
				</UButton>
				<UButton
					icon="i-heroicons-code-bracket"
					color="emerald"
					variant="soft"
					size="sm"
					@click="openApiGuideModal"
				>
					Panduan API Developer
				</UButton>
				<UButton
					icon="i-heroicons-arrow-path"
					color="gray"
					variant="soft"
					size="sm"
					:loading="isLoading"
					@click="refreshAllData"
				>
					Segarkan
				</UButton>
				<UButton
					icon="i-heroicons-identification"
					color="violet"
					variant="soft"
					size="sm"
					@click="openSimulationModal"
				>
					Simulasi Tap RFID
				</UButton>
				<UButton
					icon="i-heroicons-plus"
					color="primary"
					variant="solid"
					size="sm"
					@click="openManualAttendanceModal"
				>
					Presensi Manual
				</UButton>
			</div>
		</div>

		<!-- Top Summary Stat Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<!-- Stat 1: Status Perangkat -->
			<UCard class="shadow-sm border-gray-200 dark:border-gray-800">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-xs font-medium text-gray-500 dark:text-gray-400">
							Perangkat IoT Terdaftar
						</p>
						<div class="flex items-baseline gap-2 mt-1">
							<span class="text-2xl font-bold text-gray-900 dark:text-white">
								{{ deviceStats.total }}
							</span>
							<span class="text-xs text-gray-500">Unit</span>
						</div>
					</div>
					<div
						class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800"
					>
						<UIcon name="i-heroicons-signal" class="w-5 h-5" />
					</div>
				</div>
				<div class="mt-3 flex items-center gap-2 text-xs">
					<span
						class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800"
					>
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
						{{ deviceStats.online }} Online (ON)
					</span>
					<span
						class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium"
					>
						{{ deviceStats.offline }} Offline (OFF)
					</span>
				</div>
			</UCard>

			<!-- Stat 2: Presensi Masuk Hari Ini -->
			<UCard class="shadow-sm border-gray-200 dark:border-gray-800">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-xs font-medium text-gray-500 dark:text-gray-400">
							Presensi Masuk Hari Ini
						</p>
						<div class="flex items-baseline gap-2 mt-1">
							<span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
								{{ attendanceStats.todayMasuk }}
							</span>
							<span class="text-xs text-gray-500">Pegawai</span>
						</div>
					</div>
					<div
						class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800"
					>
						<UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
					</div>
				</div>
				<div class="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
					<span class="text-amber-600 dark:text-amber-400 font-semibold">
						{{ attendanceStats.todayTerlambat }}
					</span>
					<span>tercatat terlambat (&gt;08:00)</span>
				</div>
			</UCard>

			<!-- Stat 3: Presensi Pulang Hari Ini -->
			<UCard class="shadow-sm border-gray-200 dark:border-gray-800">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-xs font-medium text-gray-500 dark:text-gray-400">
							Presensi Pulang Hari Ini
						</p>
						<div class="flex items-baseline gap-2 mt-1">
							<span class="text-2xl font-bold text-blue-600 dark:text-blue-400">
								{{ attendanceStats.todayPulang }}
							</span>
							<span class="text-xs text-gray-500">Pegawai</span>
						</div>
					</div>
					<div
						class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
					>
						<UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-5 h-5" />
					</div>
				</div>
				<div class="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
					<span>Total transaksi hari ini:</span>
					<span class="font-semibold text-gray-900 dark:text-white">
						{{ attendanceStats.todayTotal }} tap
					</span>
				</div>
			</UCard>

			<!-- Stat 4: WiFi Multi-AP Pool -->
			<UCard class="shadow-sm border-gray-200 dark:border-gray-800">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-xs font-medium text-gray-500 dark:text-gray-400">
							WiFi Device Pool
						</p>
						<div class="flex items-baseline gap-2 mt-1">
							<span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
								{{ wifiStats.totalActive }}
							</span>
							<span class="text-xs text-gray-500">SSID Aktif</span>
						</div>
					</div>
					<div
						class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800"
					>
						<UIcon name="i-heroicons-wifi" class="w-5 h-5" />
					</div>
				</div>
				<div class="mt-3 flex items-center justify-between text-xs">
					<span class="text-gray-500">Timeout: {{ wifiStats.timeout_ms }} ms</span>
					<span class="text-emerald-600 dark:text-emerald-400 font-medium">
						GET /api/wifi-config
					</span>
				</div>
			</UCard>
		</div>

		<!-- Navigasi Tab Utama -->
		<UTabs
			:items="tabs"
			v-model="selectedTab"
			class="w-full"
			:ui="{
				list: {
					background: 'bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl',
					marker: { wrapper: 'shadow-sm' },
					tab: { active: 'text-primary-600 dark:text-primary-400 font-semibold' }
				}
			}"
		>
			<!-- TAB 1: STATUS & MONITORING DEVICE (FOKUS UTAMA) -->
			<template #devices>
				<div class="mt-4 space-y-4">
					<!-- Toolbar Perangkat -->
					<div
						class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
					>
						<div>
							<h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
								<UIcon name="i-heroicons-server" class="w-5 h-5 text-primary-500" />
								Daftar Perangkat Presensi IoT
							</h3>
							<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
								Nama perangkat dapat diubah dari sistem. Jika device terhubung ke WiFi baru (fallback), sistem otomatis menambahkan WiFi tersebut.
							</p>
						</div>

						<div class="flex items-center gap-2">
							<UButton
								icon="i-heroicons-plus"
								color="primary"
								variant="solid"
								size="xs"
								@click="openAddDeviceModal"
							>
								Daftarkan Perangkat Baru
							</UButton>
						</div>
					</div>

					<!-- Device Cards Grid / List -->
					<div v-if="devices.length === 0" class="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
						<UIcon name="i-heroicons-cpu-chip" class="w-12 h-12 mx-auto text-gray-400" />
						<h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
							Belum ada perangkat terdaftar
						</h3>
						<p class="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
							Perangkat Arduino akan terdaftar otomatis saat mengirim heartbeat / polling, atau Anda dapat mendaftarkannya secara manual.
						</p>
						<div class="mt-4">
							<UButton size="xs" color="primary" @click="openAddDeviceModal">
								Tambah Perangkat Baru
							</UButton>
						</div>
					</div>

					<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div
							v-for="device in devices"
							:key="device._id"
							class="rounded-xl bg-white dark:bg-gray-900 border transition-all duration-200 p-5 shadow-sm space-y-4 hover:shadow-md"
							:class="device.computedStatus === 'online' ? 'border-emerald-200 dark:border-emerald-800/60 ring-1 ring-emerald-500/20' : 'border-gray-200 dark:border-gray-800'"
						>
							<!-- Header Card Device Presensi -->
							<div class="flex items-start justify-between">
								<div class="flex items-center gap-3 min-w-0">
									<div
										class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
										:class="device.computedStatus === 'online' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'"
									>
										<UIcon name="i-heroicons-cpu-chip" class="w-6 h-6" />
									</div>
									<div class="min-w-0">
										<div class="flex items-center gap-1.5 flex-wrap">
											<h4 class="font-semibold text-sm text-gray-900 dark:text-white truncate" :title="device.name">
												{{ device.name }}
											</h4>
											<UBadge
												color="primary"
												variant="subtle"
												size="xs"
											>
												Presensi RFID
											</UBadge>
										</div>
										<p class="text-xs font-mono text-gray-500 dark:text-gray-400 truncate mt-0.5">
											{{ device.deviceId }}
										</p>
									</div>
								</div>

								<!-- Badge Status ON / OFF -->
								<UBadge
									:color="device.computedStatus === 'online' ? 'emerald' : 'gray'"
									variant="subtle"
									size="xs"
									class="flex items-center gap-1.5 shrink-0"
								>
									<span
										v-if="device.computedStatus === 'online'"
										class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
									></span>
									<span
										v-else
										class="w-2 h-2 rounded-full bg-gray-400"
									></span>
									{{ device.computedStatus === 'online' ? 'ONLINE (ON)' : 'OFFLINE (OFF)' }}
								</UBadge>
							</div>

							<!-- Informasi Koneksi & WiFi -->
							<div class="space-y-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 text-xs">
								<!-- WiFi Terhubung -->
								<div class="flex items-center justify-between">
									<span class="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
										<UIcon name="i-heroicons-wifi" class="w-4 h-4 text-primary-500" />
										WiFi Terhubung
									</span>
									<span
										v-if="device.connectedSsid && device.computedStatus === 'online'"
										class="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate max-w-[160px]"
									>
										{{ device.connectedSsid }}
									</span>
									<span v-else class="text-gray-400 italic">
										Tidak terhubung
									</span>
								</div>

								<!-- IP Address -->
								<div class="flex items-center justify-between">
									<span class="text-gray-500 dark:text-gray-400">IP Address</span>
									<span class="font-mono text-gray-700 dark:text-gray-300">
										{{ device.ipAddress || '-' }}
									</span>
								</div>

								<!-- Kekuatan Sinyal RSSI -->
								<div class="flex items-center justify-between">
									<span class="text-gray-500 dark:text-gray-400">Kekuatan Sinyal</span>
									<span v-if="device.rssi" class="font-medium" :class="getRssiClass(device.rssi)">
										{{ device.rssi }} dBm ({{ getRssiLabel(device.rssi) }})
									</span>
									<span v-else class="text-gray-400">-</span>
								</div>

								<!-- Lokasi -->
								<div class="flex items-center justify-between">
									<span class="text-gray-500 dark:text-gray-400">Lokasi</span>
									<span class="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">
										{{ device.location || 'Pintu Masuk Utama' }}
									</span>
								</div>
							</div>

							<!-- Footer & Aksi Card -->
							<div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
								<span class="text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate max-w-[110px]">
									<UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 shrink-0" />
									{{ formatLastSeen(device.lastSeen) }}
								</span>

								<div class="flex items-center gap-1.5">
									<!-- Tombol Tutorial Koneksi untuk Alat Ini -->
									<UTooltip text="Tutorial Cara Koneksi Alat Ini ke Sistem">
										<UButton
											icon="i-heroicons-book-open"
											color="emerald"
											variant="soft"
											size="xs"
											@click="openTutorialModal(device)"
										>
											Tutorial
										</UButton>
									</UTooltip>

									<!-- Tombol Data & JSON Terstruktur per Device -->
									<UTooltip text="Lihat Data & JSON Device">
										<UButton
											icon="i-heroicons-code-bracket-square"
											color="primary"
											variant="soft"
											size="xs"
											@click="openDeviceDetail(device)"
										>
											Data & JSON
										</UButton>
									</UTooltip>

									<!-- Tombol Ping Nyata -->
									<UTooltip text="Uji Ping Perangkat (Cek balasan online)">
										<UButton
											icon="i-heroicons-bolt"
											color="amber"
											variant="ghost"
											size="xs"
											:loading="devicePinging[device._id]"
											@click="pingDevice(device)"
										/>
									</UTooltip>

									<!-- Tombol Edit Nama / Info -->
									<UTooltip text="Ubah Nama & Lokasi">
										<UButton
											icon="i-heroicons-pencil"
											color="gray"
											variant="ghost"
											size="xs"
											@click="editDevice(device)"
										/>
									</UTooltip>

									<!-- Tombol Hapus (Nuxt UI Modal) -->
									<UTooltip text="Hapus Perangkat">
										<UButton
											icon="i-heroicons-trash"
											color="red"
											variant="ghost"
											size="xs"
											@click="confirmDeleteDevice(device)"
										/>
									</UTooltip>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<!-- TAB 2: TABEL PRESENSI MASUK & PULANG -->
			<template #attendance>
				<div class="mt-4 space-y-4">
					<!-- Filter Card -->
					<div
						class="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
					>
						<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div>
								<h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
									<UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-primary-500" />
									Log Presensi Masuk & Pulang
								</h3>
								<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
									Data kehadiran real-time yang dikirim oleh alat presensi Arduino / tap kartu RFID.
								</p>
							</div>

							<div class="flex items-center gap-2">
								<UButton
									icon="i-heroicons-plus"
									size="xs"
									color="primary"
									@click="openManualAttendanceModal"
								>
									Catat Manual
								</UButton>
							</div>
						</div>

						<!-- Filter Controls -->
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
							<UInput
								v-model="attendanceFilters.search"
								icon="i-heroicons-magnifying-glass"
								placeholder="Cari nama, NIP, UID..."
								size="sm"
								@update:model-value="debouncedFetchAttendance"
							/>

							<USelect
								v-model="attendanceFilters.type"
								:options="[
									{ label: 'Semua Tipe', value: 'all' },
									{ label: 'Masuk (IN)', value: 'masuk' },
									{ label: 'Pulang (OUT)', value: 'pulang' }
								]"
								size="sm"
								@update:model-value="fetchAttendance"
							/>

							<USelect
								v-model="attendanceFilters.status"
								:options="[
									{ label: 'Semua Status', value: 'all' },
									{ label: 'Tepat Waktu', value: 'tepat_waktu' },
									{ label: 'Terlambat', value: 'terlambat' },
									{ label: 'Pulang Cepat', value: 'pulang_cepat' },
									{ label: 'Lembur', value: 'lembur' }
								]"
								size="sm"
								@update:model-value="fetchAttendance"
							/>

							<USelect
								v-model="attendanceFilters.datePreset"
								:options="[
									{ label: 'Hari Ini', value: 'today' },
									{ label: '7 Hari Terakhir', value: '7d' },
									{ label: '30 Hari Terakhir', value: '30d' },
									{ label: 'Semua Waktu', value: 'all' }
								]"
								size="sm"
								@update:model-value="handleDatePresetChange"
							/>
						</div>
					</div>

					<!-- Attendance Table -->
					<div
						class="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
					>
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-sm">
								<thead class="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
									<tr>
										<th scope="col" class="px-4 py-3">Waktu & Tanggal</th>
										<th scope="col" class="px-4 py-3">Pegawai / Pemilik Kartu</th>
										<th scope="col" class="px-4 py-3">UID / NIP</th>
										<th scope="col" class="px-4 py-3">Tipe</th>
										<th scope="col" class="px-4 py-3">Ketepatan</th>
										<th scope="col" class="px-4 py-3">Perangkat IoT</th>
										<th scope="col" class="px-4 py-3">WiFi Terkoneksi</th>
										<th scope="col" class="px-4 py-3 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
									<tr v-if="attendances.length === 0">
										<td colspan="8" class="px-4 py-8 text-center text-gray-500 text-xs">
											Tidak ada data presensi yang sesuai dengan filter.
										</td>
									</tr>
									<tr
										v-for="item in attendances"
										:key="item._id"
										class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
									>
										<!-- Waktu -->
										<td class="px-4 py-3 whitespace-nowrap">
											<div class="font-medium text-gray-900 dark:text-white">
												{{ formatTime(item.timestamp) }}
											</div>
											<div class="text-xs text-gray-500">
												{{ formatDate(item.timestamp) }}
											</div>
										</td>

										<!-- Pegawai -->
										<td class="px-4 py-3 whitespace-nowrap">
											<div class="flex items-center gap-2.5">
												<UAvatar
													:text="getInitials(item.userName)"
													size="xs"
													class="ring-1 ring-gray-200 dark:ring-gray-700"
												/>
												<div>
													<p class="font-semibold text-gray-900 dark:text-gray-100">
														{{ item.userName }}
													</p>
													<span
														class="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
													>
														{{ item.userRole || 'Pegawai' }}
													</span>
												</div>
											</div>
										</td>

										<!-- UID / NIP -->
										<td class="px-4 py-3 whitespace-nowrap">
											<div class="font-mono text-xs text-gray-700 dark:text-gray-300">
												{{ item.uid }}
											</div>
											<div v-if="item.userNip && item.userNip !== item.uid" class="text-[11px] text-gray-500">
												NIP: {{ item.userNip }}
											</div>
										</td>

										<!-- Tipe Masuk / Pulang -->
										<td class="px-4 py-3 whitespace-nowrap">
											<UBadge
												:color="item.type === 'masuk' ? 'emerald' : 'blue'"
												variant="subtle"
												size="xs"
												class="capitalize flex items-center gap-1 font-semibold"
											>
												<UIcon
													:name="item.type === 'masuk' ? 'i-heroicons-arrow-right-on-rectangle' : 'i-heroicons-arrow-left-on-rectangle'"
													class="w-3.5 h-3.5"
												/>
												{{ item.type }}
											</UBadge>
										</td>

										<!-- Status Ketepatan -->
										<td class="px-4 py-3 whitespace-nowrap">
											<UBadge
												:color="getStatusColor(item.status)"
												variant="subtle"
												size="xs"
												class="font-medium"
											>
												{{ formatPunctualityStatus(item.status) }}
											</UBadge>
										</td>

										<!-- Device -->
										<td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
											<span class="font-mono font-medium">{{ item.deviceId }}</span>
											<span v-if="item.deviceName" class="block text-[11px] text-gray-400 truncate max-w-[140px]">
												{{ item.deviceName }}
											</span>
										</td>

										<!-- WiFi Saat Tap -->
										<td class="px-4 py-3 whitespace-nowrap text-xs">
											<span
												v-if="item.connectedSsid"
												class="inline-flex items-center gap-1 font-medium text-primary-600 dark:text-primary-400"
											>
												<UIcon name="i-heroicons-wifi" class="w-3.5 h-3.5" />
												{{ item.connectedSsid }}
											</span>
											<span v-else class="text-gray-400">-</span>
										</td>

										<!-- Aksi -->
										<td class="px-4 py-3 whitespace-nowrap text-right">
											<UButton
												icon="i-heroicons-trash"
												color="red"
												variant="ghost"
												size="xs"
												@click="confirmDeleteAttendance(item)"
											/>
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<!-- Pagination -->
						<div
							v-if="attendancePagination.total > 0"
							class="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500"
						>
							<span>
								Menampilkan {{ (attendancePagination.page - 1) * attendancePagination.pageSize + 1 }} -
								{{ Math.min(attendancePagination.page * attendancePagination.pageSize, attendancePagination.total) }}
								dari {{ attendancePagination.total }} data
							</span>

							<UPagination
								v-model="attendancePagination.page"
								:page-count="attendancePagination.pageSize"
								:total="attendancePagination.total"
								@update:model-value="fetchAttendance"
							/>
						</div>
					</div>
				</div>
			</template>

			<!-- TAB 3: SETTING WIFI DEVICE (MULTI-AP POOL & AUTO-FALLBACK) -->
			<template #wifi>
				<div class="mt-4 space-y-4">
					<!-- Banner Info WiFi Pooling & Fallback -->
					<div
						class="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200"
					>
						<div class="flex items-start gap-3">
							<UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
							<div>
								<h4 class="font-semibold text-sm text-blue-950 dark:text-blue-100">
									Multi-AP WiFi Fallback Otomatis
								</h4>
								<p class="mt-0.5 text-blue-800 dark:text-blue-300 max-w-2xl">
									Alat IoT mem-polling <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded font-mono font-bold">GET /api/wifi-config</code> untuk mendapatkan daftar SSID cadangan. Jika alat terhubung ke jaringan fallback baru, server <strong>otomatis menambahkan SSID tersebut</strong> ke daftar database.
								</p>
							</div>
						</div>

						<div class="flex items-center gap-2 shrink-0">
							<UButton
								icon="i-heroicons-code-bracket"
								color="blue"
								variant="soft"
								size="xs"
								@click="openJsonPreviewModal"
							>
								Lihat JSON Global
							</UButton>
							<UButton
								icon="i-heroicons-plus"
								color="primary"
								variant="solid"
								size="xs"
								@click="openAddWifiModal"
							>
								Tambah WiFi Baru
							</UButton>
						</div>
					</div>

					<!-- Tabel Konfigurasi WiFi -->
					<div
						class="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
					>
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-sm">
								<thead class="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
									<tr>
										<th scope="col" class="px-4 py-3">Prioritas</th>
										<th scope="col" class="px-4 py-3">Nama SSID</th>
										<th scope="col" class="px-4 py-3">Password WiFi</th>
										<th scope="col" class="px-4 py-3">Keterangan / Status Sumber</th>
										<th scope="col" class="px-4 py-3">Status Aktif</th>
										<th scope="col" class="px-4 py-3">Deteksi Perangkat Terhubung</th>
										<th scope="col" class="px-4 py-3 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
									<tr v-if="wifiList.length === 0">
										<td colspan="7" class="px-4 py-8 text-center text-gray-500 text-xs">
											Belum ada konfigurasi WiFi. Klik tombol "Tambah WiFi Baru" di atas.
										</td>
									</tr>
									<tr
										v-for="wifi in wifiList"
										:key="wifi._id"
										class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
									>
										<!-- Prioritas -->
										<td class="px-4 py-3 whitespace-nowrap font-bold text-gray-700 dark:text-gray-300">
											#{{ wifi.priority }}
										</td>

										<!-- SSID -->
										<td class="px-4 py-3 whitespace-nowrap">
											<div class="flex items-center gap-2">
												<UIcon name="i-heroicons-wifi" class="w-4 h-4 text-primary-500" />
												<span class="font-semibold text-gray-900 dark:text-white">
													{{ wifi.ssid }}
												</span>
											</div>
										</td>

										<!-- Password dengan toggle Show/Hide -->
										<td class="px-4 py-3 whitespace-nowrap">
											<div class="flex items-center gap-2">
												<span class="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
													{{ showPasswords[wifi._id] ? wifi.password : '••••••••••••' }}
												</span>
												<UButton
													:icon="showPasswords[wifi._id] ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
													color="gray"
													variant="ghost"
													size="xs"
													@click="togglePasswordVisibility(wifi._id)"
												/>
												<UButton
													icon="i-heroicons-clipboard"
													color="gray"
													variant="ghost"
													size="xs"
													@click="copyToClipboard(wifi.password, 'Password disalin!')"
												/>
											</div>
										</td>

										<!-- Keterangan -->
										<td class="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
											<span v-if="String(wifi.description || '').includes('Otomatis ditambahkan')" class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
												<UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
												{{ wifi.description }}
											</span>
											<span v-else>
												{{ wifi.description || '-' }}
											</span>
										</td>

										<!-- Status Aktif Toggle -->
										<td class="px-4 py-3 whitespace-nowrap">
											<UToggle
												v-model="wifi.isActive"
												@update:model-value="toggleWifiActive(wifi)"
											/>
										</td>

										<!-- Deteksi Perangkat Terhubung -->
										<td class="px-4 py-3 whitespace-nowrap">
											<div v-if="wifi.connectedCount && wifi.connectedCount > 0" class="flex items-center gap-1.5">
												<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
												<UBadge color="emerald" variant="subtle" size="xs">
													Terhubung ke {{ wifi.connectedCount }} Perangkat
												</UBadge>
											</div>
											<span v-else class="text-xs text-gray-400 italic">
												Tidak ada perangkat aktif
											</span>
										</td>

										<!-- Aksi -->
										<td class="px-4 py-3 whitespace-nowrap text-right">
											<div class="flex items-center justify-end gap-1">
												<UButton
													icon="i-heroicons-pencil"
													color="gray"
													variant="ghost"
													size="xs"
													@click="editWifi(wifi)"
												/>
												<UButton
													icon="i-heroicons-trash"
													color="red"
													variant="ghost"
													size="xs"
													@click="confirmDeleteWifi(wifi)"
												/>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</template>

			<!-- TAB 4: TUTORIAL KONEKSI & KODE ARDUINO -->
			<template #guide>
				<div class="mt-4 space-y-6">
					<!-- Card Tutorial Langkah Mudah Koneksi -->
					<div class="p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-4 text-xs">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-300">
								<UIcon name="i-heroicons-academic-cap" class="w-5 h-5 text-emerald-600" />
								Tutorial Cara Menghubungkan Perangkat Presensi ke Sistem SIMPRS
							</div>
							<UBadge color="emerald" variant="subtle" size="xs">Panduan Koneksi Hardware</UBadge>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
							<div class="p-3 rounded-lg bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
								<p class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
									<span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">1</span>
									Setting WiFi Kantor
								</p>
								<p class="text-gray-500">
									Tambahkan SSID & password WiFi kantor pada tab <strong>Setting WiFi Device</strong>. Alat akan mem-polling via <code>GET /api/wifi-config</code>.
								</p>
							</div>

							<div class="p-3 rounded-lg bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
								<p class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
									<span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">2</span>
									Set ID & Upload Sketsa
								</p>
								<p class="text-gray-500">
									Salin sketsa C++ di bawah, atur <code>DEVICE_ID</code> dan <code>BASE_SERVER</code>, lalu upload ke board ESP32 via Arduino IDE.
								</p>
							</div>

							<div class="p-3 rounded-lg bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
								<p class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
									<span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">3</span>
									Cek Status Online
								</p>
								<p class="text-gray-500">
									Begitu alat terhubung WiFi dan mengirim heartbeat, kartu alat di dashboard otomatis menyala hijau <strong>ONLINE (ON)</strong>.
								</p>
							</div>

							<div class="p-3 rounded-lg bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
								<p class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
									<span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">4</span>
									Tap Kartu Presensi
								</p>
								<p class="text-gray-500">
									Tempelkan kartu RFID pegawai. Sistem otomatis mendeteksi Masuk/Pulang dan mencatat transaksi ke tabel SIMPRS.
								</p>
							</div>
						</div>
					</div>

					<!-- Card Ringkasan Endpoint API -->
					<div
						class="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4"
					>
						<h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
							<UIcon name="i-heroicons-code-bracket-square" class="w-5 h-5 text-primary-500" />
							Dokumentasi Endpoint REST API untuk Perangkat Arduino / ESP32
						</h3>

						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<!-- Endpoint 1 -->
							<div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
								<div class="flex items-center justify-between">
									<UBadge color="emerald" variant="solid" size="xs">GET</UBadge>
									<span class="text-xs text-gray-500 font-mono">ArduinoJson v7</span>
								</div>
								<p class="font-mono text-xs font-bold text-gray-900 dark:text-white">
									/api/wifi-config?deviceId=ID
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									Polling kredensial WiFi, timeout, serta menerima nama perangkat terbaru dari server.
								</p>
							</div>

							<!-- Endpoint 2 -->
							<div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
								<div class="flex items-center justify-between">
									<UBadge color="blue" variant="solid" size="xs">POST</UBadge>
									<span class="text-xs text-gray-500 font-mono">Presensi Tap</span>
								</div>
								<p class="font-mono text-xs font-bold text-gray-900 dark:text-white">
									/api/iot/presensi
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									Mencatat presensi masuk/pulang kartu RFID (UID, deviceId, type: auto/masuk/pulang).
								</p>
							</div>

							<!-- Endpoint 3 -->
							<div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
								<div class="flex items-center justify-between">
									<UBadge color="amber" variant="solid" size="xs">POST</UBadge>
									<span class="text-xs text-gray-500 font-mono">Heartbeat & Status</span>
								</div>
								<p class="font-mono text-xs font-bold text-gray-900 dark:text-white">
									/api/iot/heartbeat
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									Kirim detak aktif ON, WiFi terhubung, IP Address, dan RSSI sinyal.
								</p>
							</div>
						</div>
					</div>

					<!-- Kode Lengkap Arduino C++ -->
					<div
						class="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
					>
						<div class="p-4 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<UIcon name="i-heroicons-document-text" class="w-5 h-5 text-primary-500" />
								<span class="font-semibold text-sm text-gray-900 dark:text-white">
									Sketsa Lengkap ESP32 / Arduino (ArduinoJson v7 Ready)
								</span>
							</div>

							<UButton
								icon="i-heroicons-clipboard-document"
								size="xs"
								color="gray"
								variant="soft"
								@click="copyToClipboard(arduinoCodeSample, 'Kode Arduino berhasil disalin!')"
							>
								Salin Kode
							</UButton>
						</div>

						<div class="p-4 bg-gray-950 overflow-x-auto text-xs font-mono text-emerald-400 leading-relaxed">
							<pre>{{ arduinoCodeSample }}</pre>
						</div>
					</div>
				</div>
			</template>
		</UTabs>

		<!-- MODAL A: DETAIL & JSON TERSTRUKTUR PER DEVICE (Baru!) -->
		<UModal v-model="deviceDetailModal.isOpen" :ui="{ width: 'sm:max-w-3xl' }">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<div class="flex items-start justify-between">
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
								:class="deviceDetailModal.device?.computedStatus === 'online' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'"
							>
								<UIcon name="i-heroicons-cpu-chip" class="w-6 h-6" />
							</div>
							<div>
								<div class="flex items-center gap-2">
									<h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
										{{ deviceDetailModal.device?.name || 'Detail Perangkat' }}
									</h3>
									<UBadge
										:color="deviceDetailModal.device?.computedStatus === 'online' ? 'emerald' : 'gray'"
										variant="subtle"
										size="xs"
										class="flex items-center gap-1 font-semibold"
									>
										<span v-if="deviceDetailModal.device?.computedStatus === 'online'" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
										{{ deviceDetailModal.device?.computedStatus === 'online' ? 'ONLINE (ON)' : 'OFFLINE (OFF)' }}
									</UBadge>
								</div>
								<p class="text-xs font-mono text-gray-500 mt-0.5">
									Device ID: {{ deviceDetailModal.device?.deviceId }} · Lokasi: {{ deviceDetailModal.device?.location || '-' }}
								</p>
							</div>
						</div>

						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark"
							class="-my-1"
							@click="deviceDetailModal.isOpen = false"
						/>
					</div>
				</template>

				<div v-if="deviceDetailModal.isLoading" class="p-8 text-center text-gray-500">
					<UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto text-primary-500" />
					<p class="mt-2 text-xs">Memuat data dan konfigurasi JSON perangkat...</p>
				</div>

				<div v-else class="space-y-4">
					<!-- Sub-Navigasi di dalam Modal Detail -->
					<div class="flex border-b border-gray-200 dark:border-gray-800 gap-4 text-xs font-semibold">
						<button
							type="button"
							class="pb-2 transition-colors border-b-2"
							:class="deviceDetailModal.activeTab === 0 ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="deviceDetailModal.activeTab = 0"
						>
							Format JSON (ArduinoJson v7)
						</button>
						<button
							type="button"
							class="pb-2 transition-colors border-b-2"
							:class="deviceDetailModal.activeTab === 1 ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="deviceDetailModal.activeTab = 1"
						>
							Telemetri & Status Jaringan
						</button>
						<button
							type="button"
							class="pb-2 transition-colors border-b-2"
							:class="deviceDetailModal.activeTab === 2 ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="deviceDetailModal.activeTab = 2"
						>
							Presensi di Mesin Ini ({{ deviceDetailModal.recentAttendances.length }})
						</button>
						<button
							type="button"
							class="pb-2 transition-colors border-b-2 flex items-center gap-1"
							:class="deviceDetailModal.activeTab === 3 ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="deviceDetailModal.activeTab = 3"
						>
							<UIcon name="i-heroicons-academic-cap" class="w-3.5 h-3.5" />
							Tutorial Koneksi
						</button>
					</div>

					<!-- Tab 0: Format JSON Terstruktur -->
					<div v-if="deviceDetailModal.activeTab === 0" class="space-y-3">
						<div class="flex items-center justify-between text-xs text-gray-500">
							<span>URL Endpoint Polling Perangkat:</span>
							<code class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[11px] text-primary-600 dark:text-primary-400">
								GET /api/wifi-config?deviceId={{ deviceDetailModal.device?.deviceId }}
							</code>
						</div>

						<div class="p-4 rounded-xl bg-gray-950 text-emerald-400 font-mono text-xs overflow-x-auto relative">
							<pre>{{ JSON.stringify(deviceDetailModal.arduinoJson, null, 2) }}</pre>
						</div>

						<div class="flex justify-end">
							<UButton
								icon="i-heroicons-clipboard"
								color="gray"
								variant="soft"
								size="xs"
								@click="copyToClipboard(JSON.stringify(deviceDetailModal.arduinoJson, null, 2), 'JSON Perangkat berhasil disalin!')"
							>
								Salin Format JSON
							</UButton>
						</div>
					</div>

					<!-- Tab 1: Telemetri & Jaringan -->
					<div v-else-if="deviceDetailModal.activeTab === 1" class="space-y-3 text-xs">
						<div class="grid grid-cols-2 gap-3">
							<div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
								<p class="text-gray-500">WiFi SSID Terhubung</p>
								<p class="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
									{{ deviceDetailModal.device?.connectedSsid || 'Tidak terhubung' }}
								</p>
							</div>

							<div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
								<p class="text-gray-500">IP Address Lokal</p>
								<p class="font-mono font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
									{{ deviceDetailModal.device?.ipAddress || '-' }}
								</p>
							</div>

							<div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
								<p class="text-gray-500">Kekuatan Sinyal (RSSI)</p>
								<p class="font-semibold text-sm mt-0.5" :class="getRssiClass(deviceDetailModal.device?.rssi || 0)">
									{{ deviceDetailModal.device?.rssi ? deviceDetailModal.device.rssi + ' dBm' : '-' }}
								</p>
							</div>

							<div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
								<p class="text-gray-500">Auto-Fallback WiFi</p>
								<p class="font-semibold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
									Aktif & Otomatis Terdata
								</p>
							</div>
						</div>

						<div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
							<span class="text-gray-500">Waktu Terakhir Aktif:</span>
							<span class="font-medium text-gray-800 dark:text-gray-200">
								{{ formatLastSeen(deviceDetailModal.device?.lastSeen) }}
							</span>
						</div>
					</div>

					<!-- Tab 2: Presensi di Device Ini -->
					<div v-else-if="deviceDetailModal.activeTab === 2" class="space-y-3">
						<div class="flex items-center justify-between text-xs text-gray-500">
							<span>Riwayat tap khusus pada alat <strong>{{ deviceDetailModal.device?.name }}</strong></span>
							<span>Total: {{ deviceDetailModal.stats.totalHistorical }} tap</span>
						</div>

						<div v-if="deviceDetailModal.recentAttendances.length === 0" class="p-6 text-center text-xs text-gray-400">
							Belum ada riwayat tap presensi yang masuk melalui alat ini.
						</div>

						<div v-else class="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
							<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-xs text-left">
								<thead class="bg-gray-50 dark:bg-gray-800/60 font-semibold text-gray-500">
									<tr>
										<th class="px-3 py-2">Waktu</th>
										<th class="px-3 py-2">Pegawai</th>
										<th class="px-3 py-2">UID / NIP</th>
										<th class="px-3 py-2">Tipe</th>
										<th class="px-3 py-2">Ketepatan</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
									<tr v-for="att in deviceDetailModal.recentAttendances" :key="att._id">
										<td class="px-3 py-2 whitespace-nowrap">{{ formatTime(att.timestamp) }}</td>
										<td class="px-3 py-2 font-semibold text-gray-900 dark:text-white">{{ att.userName }}</td>
										<td class="px-3 py-2 font-mono text-gray-500">{{ att.uid }}</td>
										<td class="px-3 py-2">
											<UBadge :color="att.type === 'masuk' ? 'emerald' : 'blue'" variant="subtle" size="xs">
												{{ att.type }}
											</UBadge>
										</td>
										<td class="px-3 py-2">
											<UBadge :color="getStatusColor(att.status)" variant="subtle" size="xs">
												{{ formatPunctualityStatus(att.status) }}
											</UBadge>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<!-- Tab 3: Tutorial Koneksi Alat Ini -->
					<div v-else-if="deviceDetailModal.activeTab === 3" class="space-y-3 text-xs">
						<div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
							<p class="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
								<UIcon name="i-heroicons-academic-cap" class="w-4 h-4 text-emerald-600" />
								Panduan Singkat Menghubungkan {{ deviceDetailModal.device?.name }}
							</p>
							<p class="text-emerald-800 dark:text-emerald-400">
								Masukkan konfigurasi berikut pada sketsa Arduino C++ ESP32 Anda:
							</p>
							<div class="p-2.5 rounded-lg bg-gray-950 text-emerald-400 font-mono text-[11px]">
								<code>const char* DEVICE_ID = "{{ deviceDetailModal.device?.deviceId }}";<br>const char* BASE_SERVER = "http://IP_SERVER_SIMPRS:3000";</code>
							</div>
						</div>

						<div class="space-y-2">
							<div class="p-3 rounded-lg border border-gray-200 dark:border-gray-800 space-y-1">
								<p class="font-semibold text-gray-900 dark:text-white">1. Endpoint Polling WiFi Multi-AP</p>
								<code class="text-primary-600 dark:text-primary-400 font-mono text-[11px]">GET /api/wifi-config?deviceId={{ deviceDetailModal.device?.deviceId }}</code>
							</div>
							<div class="p-3 rounded-lg border border-gray-200 dark:border-gray-800 space-y-1">
								<p class="font-semibold text-gray-900 dark:text-white">2. Endpoint Lapor Status Online (Heartbeat)</p>
								<code class="text-primary-600 dark:text-primary-400 font-mono text-[11px]">POST /api/iot/heartbeat</code>
							</div>
							<div class="p-3 rounded-lg border border-gray-200 dark:border-gray-800 space-y-1">
								<p class="font-semibold text-gray-900 dark:text-white">3. Endpoint Tap Kartu Presensi RFID</p>
								<code class="text-primary-600 dark:text-primary-400 font-mono text-[11px]">POST /api/iot/presensi</code>
							</div>
						</div>

						<div class="flex justify-end pt-1">
							<UButton
								size="xs"
								color="emerald"
								variant="soft"
								icon="i-heroicons-code-bracket"
								@click="openTutorialModal(deviceDetailModal.device)"
							>
								Buka Sketsa & Tutorial Lengkap
							</UButton>
						</div>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end">
						<UButton color="gray" variant="soft" @click="deviceDetailModal.isOpen = false">
							Tutup
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL B: KONFIRMASI HAPUS DENGAN NUXT UI (Gantikan Popup Browser Confirm!) -->
		<UModal v-model="confirmModal.isOpen" :ui="{ width: 'sm:max-w-md' }">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/80 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
							<UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
						</div>
						<div>
							<h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
								{{ confirmModal.title }}
							</h3>
							<p class="text-xs text-gray-500 mt-0.5">
								Konfirmasi tindakan permanen
							</p>
						</div>
					</div>
				</template>

				<div class="py-2 text-sm text-gray-700 dark:text-gray-300">
					{{ confirmModal.message }}
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton
							color="gray"
							variant="soft"
							:disabled="confirmModal.isDeleting"
							@click="confirmModal.isOpen = false"
						>
							Batal
						</UButton>
						<UButton
							color="red"
							variant="solid"
							:loading="confirmModal.isDeleting"
							@click="executeConfirmedAction"
						>
							{{ confirmModal.confirmText || 'Ya, Hapus' }}
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL 1: Tambah / Edit WiFi -->
		<UModal v-model="wifiModal.isOpen">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
							{{ wifiModal.isEdit ? 'Edit Konfigurasi WiFi' : 'Tambah Jaringan WiFi Baru' }}
						</h3>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark"
							class="-my-1"
							@click="wifiModal.isOpen = false"
						/>
					</div>
				</template>

				<div class="space-y-4">
					<UFormGroup label="Nama SSID WiFi" required>
						<UInput
							v-model="wifiModal.form.ssid"
							placeholder="Contoh: Kantor_Utama"
							icon="i-heroicons-wifi"
						/>
					</UFormGroup>

					<UFormGroup label="Password WiFi" required>
						<UInput
							v-model="wifiModal.form.password"
							placeholder="Masukkan password WiFi"
							icon="i-heroicons-key"
						/>
					</UFormGroup>

					<div class="grid grid-cols-2 gap-4">
						<UFormGroup label="Prioritas Fallback">
							<UInput
								v-model.number="wifiModal.form.priority"
								type="number"
								min="1"
								placeholder="1"
							/>
						</UFormGroup>

						<UFormGroup label="Timeout Koneksi (ms)">
							<UInput
								v-model.number="wifiModal.form.timeoutMs"
								type="number"
								placeholder="12000"
							/>
						</UFormGroup>
					</div>

					<UFormGroup label="Keterangan / Lokasi Access Point">
						<UInput
							v-model="wifiModal.form.description"
							placeholder="Contoh: Ruang Poli & Front Office"
						/>
					</UFormGroup>

					<div class="flex items-center gap-3 pt-2">
						<UToggle v-model="wifiModal.form.isActive" />
						<span class="text-xs text-gray-700 dark:text-gray-300 font-medium">
							Aktifkan SSID ini untuk disajikan ke perangkat IoT
						</span>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton color="gray" variant="soft" @click="wifiModal.isOpen = false">
							Batal
						</UButton>
						<UButton
							color="primary"
							:loading="wifiModal.isSaving"
							@click="saveWifiConfig"
						>
							Simpan Konfigurasi
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL 2: Tambah / Edit Device Presensi IoT (Clean & Disertai Tutorial Koneksi) -->
		<UModal v-model="deviceModal.isOpen" :ui="{ width: 'sm:max-w-2xl' }">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 border border-primary-200 dark:border-primary-800 shrink-0">
								<UIcon name="i-heroicons-identification" class="w-6 h-6" />
							</div>
							<div>
								<h3 class="text-base font-bold leading-6 text-gray-900 dark:text-white">
									{{ deviceModal.isEdit ? 'Ubah Informasi Mesin Presensi' : 'Daftarkan Mesin Presensi IoT Baru' }}
								</h3>
								<p class="text-xs text-gray-500 mt-0.5">
									Konfigurasi perangkat presensi RFID dan ikuti petunjuk koneksi ke mikrokontroler.
								</p>
							</div>
						</div>

						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark"
							class="-my-1"
							@click="deviceModal.isOpen = false"
						/>
					</div>
				</template>

				<div class="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
					<!-- Identitas Perangkat Presensi -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<UFormGroup label="Device ID (Hardware ID)" required help="Kode unik yang disetting pada kodingan Arduino">
							<UInput
								v-model="deviceModal.form.deviceId"
								:disabled="deviceModal.isEdit"
								placeholder="Contoh: ESP32_PRESENSI_01"
								icon="i-heroicons-cpu-chip"
							/>
						</UFormGroup>

						<UFormGroup label="Nama Mesin Presensi" required help="Nama yang tampil di sistem SIMPRS">
							<UInput
								v-model="deviceModal.form.name"
								placeholder="Contoh: Mesin Presensi Pintu Utama"
							/>
						</UFormGroup>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<UFormGroup label="Lokasi Pemasangan">
							<UInput
								v-model="deviceModal.form.location"
								placeholder="Contoh: Lantai 1 - Pintu Masuk Pegawai"
								icon="i-heroicons-map-pin"
							/>
						</UFormGroup>

						<UFormGroup label="Catatan Tambahan">
							<UInput
								v-model="deviceModal.form.notes"
								placeholder="Contoh: Modul ESP32 + RFID RC522"
							/>
						</UFormGroup>
					</div>

					<!-- TUTORIAL CARA MENGKONEKSIKAN KE IOT DEVICE -->
					<div class="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
								<UIcon name="i-heroicons-academic-cap" class="w-5 h-5 text-emerald-600" />
								Tutorial Cara Menghubungkan Alat Presensi ke Sistem
							</div>
							<UBadge color="emerald" variant="subtle" size="xs">Panduan Koneksi</UBadge>
						</div>

						<p class="text-emerald-800 dark:text-emerald-400">
							Ikuti 4 langkah mudah untuk mengkoneksikan perangkat Arduino / ESP32 presensi Anda ke server e-Health:
						</p>

						<div class="space-y-2.5">
							<!-- Langkah 1: Setting WiFi -->
							<div class="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
								<p class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
									<span class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 flex items-center justify-center text-[11px]">1</span>
									Koneksi WiFi Kantor Otomatis (Multi-AP)
								</p>
								<p class="text-gray-600 dark:text-gray-400 pl-6">
									Pastikan SSID & Password WiFi kantor telah ditambahkan di tab <strong>Setting WiFi Device</strong>. Perangkat akan otomatis meminta daftar WiFi melalui endpoint:
									<code class="block font-mono text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">GET /api/wifi-config?deviceId={{ deviceModal.form.deviceId || 'ESP32_PRESENSI_01' }}</code>
								</p>
							</div>

							<!-- Langkah 2: Setting Firmware Arduino -->
							<div class="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
								<p class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
									<span class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 flex items-center justify-center text-[11px]">2</span>
									Pasang Device ID & IP Server di Kodingan Arduino
								</p>
								<p class="text-gray-600 dark:text-gray-400 pl-6">
									Salin konstanta berikut ke sketsa Arduino C++ mikrokontroler Anda:
								</p>
								<div class="ml-6 p-2 rounded bg-gray-950 text-emerald-400 font-mono text-[11px]">
									<code>const char* DEVICE_ID = "{{ deviceModal.form.deviceId || 'ESP32_PRESENSI_01' }}";<br>const char* BASE_SERVER = "http://IP_SERVER_SIMPRS:3000";</code>
								</div>
							</div>

							<!-- Langkah 3: Deteksi Status ON / OFF -->
							<div class="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
								<p class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
									<span class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 flex items-center justify-center text-[11px]">3</span>
									Deteksi Status Online Nyata (Heartbeat)
								</p>
								<p class="text-gray-600 dark:text-gray-400 pl-6">
									Saat alat dinyalakan, loop program akan memanggil <code class="font-mono text-emerald-600">POST /api/iot/heartbeat</code> tiap 30 detik. Status pada kartu perangkat di dashboard akan langsung berubah menjadi <strong class="text-emerald-600">ONLINE (ON)</strong>.
								</p>
							</div>

							<!-- Langkah 4: Tap Kartu RFID Presensi -->
							<div class="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
								<p class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
									<span class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 flex items-center justify-center text-[11px]">4</span>
									Tap Kartu RFID & Masuk/Pulang Otomatis
								</p>
								<p class="text-gray-600 dark:text-gray-400 pl-6">
									Saat pegawai menempelkan kartu RFID ke modul RC522, alat memanggil <code class="font-mono text-emerald-600">POST /api/iot/presensi</code>. Sistem otomatis mengenali pegawai, menentukan status Masuk / Pulang dan Tepat Waktu / Terlambat, membunyikan buzzer 2x, dan mencatat transaksi langsung ke tabel presensi.
								</p>
							</div>
						</div>

						<div class="flex justify-end pt-1">
							<UButton
								size="xs"
								color="emerald"
								variant="solid"
								icon="i-heroicons-code-bracket"
								@click="openTutorialModal(deviceModal.form)"
							>
								Lihat Sketsa Firmware C++ Lengkap
							</UButton>
						</div>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton color="gray" variant="soft" @click="deviceModal.isOpen = false">
							Batal
						</UButton>
						<UButton
							color="primary"
							:loading="deviceModal.isSaving"
							@click="saveDevice"
						>
							{{ deviceModal.isEdit ? 'Simpan Perubahan' : 'Daftarkan Mesin Presensi' }}
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL 3: Presensi Manual -->
		<UModal v-model="manualModal.isOpen">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
							Catat Presensi Manual
						</h3>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark"
							class="-my-1"
							@click="manualModal.isOpen = false"
						/>
					</div>
				</template>

				<div class="space-y-4">
					<UFormGroup label="Pilih Pegawai / Dokter" required>
						<USelect
							v-model="manualModal.form.userId"
							:options="staffOptions"
							placeholder="-- Pilih Pegawai / Dokter --"
						/>
					</UFormGroup>

					<div class="grid grid-cols-2 gap-4">
						<UFormGroup label="Tipe Presensi" required>
							<USelect
								v-model="manualModal.form.type"
								:options="[
									{ label: 'Masuk (IN)', value: 'masuk' },
									{ label: 'Pulang (OUT)', value: 'pulang' }
								]"
							/>
						</UFormGroup>

						<UFormGroup label="Status Ketepatan">
							<USelect
								v-model="manualModal.form.status"
								:options="[
									{ label: 'Tepat Waktu', value: 'tepat_waktu' },
									{ label: 'Terlambat', value: 'terlambat' },
									{ label: 'Pulang Cepat', value: 'pulang_cepat' },
									{ label: 'Lembur', value: 'lembur' }
								]"
							/>
						</UFormGroup>
					</div>

					<UFormGroup label="Catatan">
						<UInput
							v-model="manualModal.form.notes"
							placeholder="Alasan input manual (misal: kartu RFID tertinggal)"
						/>
					</UFormGroup>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton color="gray" variant="soft" @click="manualModal.isOpen = false">
							Batal
						</UButton>
						<UButton
							color="primary"
							:loading="manualModal.isSaving"
							@click="saveManualAttendance"
						>
							Catat Presensi
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL 4: Simulasi Tap RFID (Pengujian Langsung) -->
		<UModal v-model="simModal.isOpen">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<UIcon name="i-heroicons-identification" class="w-5 h-5 text-violet-500" />
							<h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
								Simulasi Tap Kartu RFID / Perangkat Arduino
							</h3>
						</div>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark"
							class="-my-1"
							@click="simModal.isOpen = false"
						/>
					</div>
				</template>

				<div class="space-y-4">
					<p class="text-xs text-gray-500">
						Gunakan fitur ini untuk menguji respon endpoint <code class="font-bold">/api/iot/presensi</code> seolah-olah dipanggil langsung dari alat ESP32/Arduino.
					</p>

					<UFormGroup label="Pilih Perangkat Pengirim" required>
						<USelect
							v-model="simModal.form.deviceId"
							:options="deviceOptions"
							placeholder="-- Pilih Perangkat --"
						/>
					</UFormGroup>

					<UFormGroup label="UID Kartu RFID / NIP" required>
						<UInput
							v-model="simModal.form.uid"
							placeholder="Contoh: A1B2C3D4 atau NIP Pegawai"
							icon="i-heroicons-credit-card"
						/>
					</UFormGroup>

					<div class="grid grid-cols-2 gap-4">
						<UFormGroup label="Mode Tipe Presensi">
							<USelect
								v-model="simModal.form.type"
								:options="[
									{ label: 'Otomatis (Auto-Detect)', value: 'auto' },
									{ label: 'Paksa Masuk (IN)', value: 'masuk' },
									{ label: 'Paksa Pulang (OUT)', value: 'pulang' }
								]"
							/>
						</UFormGroup>

						<UFormGroup label="SSID WiFi Terhubung">
							<USelect
								v-model="simModal.form.connectedSsid"
								:options="wifiOptions"
								placeholder="Pilih WiFi"
							/>
						</UFormGroup>
					</div>

					<div v-if="simModal.result" class="p-3 rounded-lg bg-gray-950 text-emerald-400 text-xs font-mono">
						<p class="font-bold text-white mb-1">Respon Server (ArduinoJson v7):</p>
						<pre>{{ JSON.stringify(simModal.result, null, 2) }}</pre>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton color="gray" variant="soft" @click="simModal.isOpen = false">
							Tutup
						</UButton>
						<UButton
							color="violet"
							:loading="simModal.isSubmitting"
							@click="submitSimulatedTap"
						>
							Kirim Simulasi Tap
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL 5: Preview Raw JSON Global Endpoint /api/wifi-config -->
		<UModal v-model="jsonModal.isOpen">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<UIcon name="i-heroicons-code-bracket" class="w-5 h-5 text-primary-500" />
							<h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
								Format JSON Global: GET /api/wifi-config
							</h3>
						</div>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark"
							class="-my-1"
							@click="jsonModal.isOpen = false"
						/>
					</div>
				</template>

				<div class="space-y-3">
					<p class="text-xs text-gray-500">
						Format ini 100% kompatibel dengan <strong>ArduinoJson v7</strong> dan dapat langsung diparsing oleh ESP8266/ESP32.
					</p>

					<div class="p-4 rounded-xl bg-gray-950 text-emerald-400 font-mono text-xs overflow-x-auto">
						<pre>{{ jsonModal.rawJson }}</pre>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-between items-center w-full">
						<span class="text-xs text-gray-400">Endpoint: /api/wifi-config</span>
						<UButton
							color="primary"
							size="xs"
							@click="copyToClipboard(jsonModal.rawJson, 'JSON berhasil disalin!')"
						>
							Salin JSON
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL 6: TUTORIAL MENGHUBUNGKAN PERANGKAT PRESENSI IOT KE SISTEM -->
		<UModal v-model="tutorialModal.isOpen" :ui="{ width: 'sm:max-w-4xl' }">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 border border-emerald-200 dark:border-emerald-800 shrink-0">
								<UIcon name="i-heroicons-academic-cap" class="w-6 h-6" />
							</div>
							<div>
								<div class="flex items-center gap-2">
									<h3 class="text-base font-bold leading-6 text-gray-900 dark:text-white">
										Tutorial Menghubungkan Perangkat Presensi IoT ke Sistem
									</h3>
									<UBadge v-if="tutorialModal.device" color="primary" variant="subtle" size="xs">
										{{ tutorialModal.device.name }} ({{ tutorialModal.device.deviceId }})
									</UBadge>
								</div>
								<p class="text-xs text-gray-500 mt-0.5">
									Panduan perakitan modul ESP32 + RFID RC522, setting WiFi multi-AP, dan integrasi presensi otomatis.
								</p>
							</div>
						</div>

						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark"
							class="-my-1"
							@click="tutorialModal.isOpen = false"
						/>
					</div>
				</template>

				<div class="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
					<!-- Tab Navigasi Tutorial -->
					<div class="flex border-b border-gray-200 dark:border-gray-800 font-medium">
						<button
							type="button"
							class="pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5"
							:class="tutorialModal.activeTab === 0
								? 'border-primary-500 text-primary-600 font-semibold'
								: 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="tutorialModal.activeTab = 0"
						>
							<UIcon name="i-heroicons-queue-list" class="w-4 h-4" />
							4 Langkah Mudah Koneksi
						</button>
						<button
							type="button"
							class="pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5"
							:class="tutorialModal.activeTab === 1
								? 'border-primary-500 text-primary-600 font-semibold'
								: 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="tutorialModal.activeTab = 1"
						>
							<UIcon name="i-heroicons-wrench" class="w-4 h-4" />
							Wiring Pinout Hardware
						</button>
						<button
							type="button"
							class="pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5"
							:class="tutorialModal.activeTab === 2
								? 'border-primary-500 text-primary-600 font-semibold'
								: 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="tutorialModal.activeTab = 2"
						>
							<UIcon name="i-heroicons-code-bracket" class="w-4 h-4" />
							Source Code Arduino C++
						</button>
						<button
							type="button"
							class="pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5"
							:class="tutorialModal.activeTab === 3
								? 'border-primary-500 text-primary-600 font-semibold'
								: 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="tutorialModal.activeTab = 3"
						>
							<UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4" />
							Troubleshooting
						</button>
					</div>

					<!-- TAB 0: 4 LANGKAH MUDAH KONEKSI -->
					<div v-if="tutorialModal.activeTab === 0" class="space-y-3.5">
						<!-- Step 1 -->
						<div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1.5">
							<div class="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
								<span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center text-xs">1</span>
								<span>Tambahkan WiFi Kantor di Tab Setting WiFi Device</span>
							</div>
							<p class="text-gray-600 dark:text-gray-400 pl-8">
								Buka tab <strong>Setting WiFi Device (Multi-AP)</strong> di dashboard ini, lalu masukkan SSID dan Password WiFi kantor/klinik. Mikrokontroler tidak perlu di-flash ulang saat ganti password WiFi, karena alat akan otomatis mem-polling konfigurasi terbaru dari server.
							</p>
						</div>

						<!-- Step 2 -->
						<div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1.5">
							<div class="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
								<span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center text-xs">2</span>
								<span>Isikan Device ID & Alamat Server pada Firmware Arduino</span>
							</div>
							<p class="text-gray-600 dark:text-gray-400 pl-8">
								Buka Arduino IDE dan buka sketsa C++ (tersedia di tab <em>Source Code</em>). Sesuaikan 2 baris konfigurasi berikut:
							</p>
							<div class="ml-8 p-2.5 rounded-lg bg-gray-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
								<code>const char* DEVICE_ID = "{{ tutorialModal.device?.deviceId || 'ESP32_PRESENSI_01' }}";<br>const char* BASE_SERVER = "http://IP_KOMPUTER_SERVER:3000"; // Contoh: http://192.168.1.100:3000</code>
							</div>
						</div>

						<!-- Step 3 -->
						<div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1.5">
							<div class="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
								<span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center text-xs">3</span>
								<span>Upload ke ESP32 & Pantau Status Online Nyata</span>
							</div>
							<p class="text-gray-600 dark:text-gray-400 pl-8">
								Sambungkan kabel USB ESP32 dan klik <strong>Upload</strong> pada Arduino IDE. Setelah berhasil, buka <em>Serial Monitor (115200 baud)</em>. Perangkat akan terhubung ke WiFi dan mengirim <code>POST /api/iot/heartbeat</code>. Status pada kartu perangkat di dashboard otomatis menyala hijau <strong>ONLINE (ON)</strong>!
							</p>
						</div>

						<!-- Step 4 -->
						<div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1.5">
							<div class="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
								<span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center text-xs">4</span>
								<span>Hubungkan Kartu RFID dengan Pegawai & Siap Digunakan</span>
							</div>
							<p class="text-gray-600 dark:text-gray-400 pl-8">
								Tempelkan kartu RFID pegawai ke modul RC522. Sistem secara otomatis mengenali identitas pegawai, mendeteksi jam hadir (Masuk / Pulang), mengevaluasi ketepatan waktu (Tepat Waktu / Terlambat), membunyikan buzzer 2x tanda sukses, dan log kehadiran langsung muncul di <strong>Tabel Presensi Masuk & Pulang</strong>.
							</p>
						</div>
					</div>

					<!-- TAB 1: WIRING PINOUT HARDWARE -->
					<div v-else-if="tutorialModal.activeTab === 1" class="space-y-3">
						<p class="text-gray-500">
							Hubungkan pin modul RFID RC522 dan Buzzer ke pin board ESP32 sesuai tabel berikut:
						</p>

						<div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
							<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left">
								<thead class="bg-gray-50 dark:bg-gray-800/60 font-semibold text-gray-700 dark:text-gray-300">
									<tr>
										<th class="px-3 py-2">Pin RFID RC522</th>
										<th class="px-3 py-2">Pin ESP32 (GPIO)</th>
										<th class="px-3 py-2">Keterangan / Fungsi</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 dark:divide-gray-800 font-mono text-[11px]">
									<tr>
										<td class="px-3 py-2 font-bold text-primary-600">SDA (SS)</td>
										<td class="px-3 py-2 font-bold">GPIO 21</td>
										<td class="px-3 py-2 font-sans text-gray-500">SPI Slave Select</td>
									</tr>
									<tr>
										<td class="px-3 py-2 font-bold text-primary-600">SCK</td>
										<td class="px-3 py-2 font-bold">GPIO 18</td>
										<td class="px-3 py-2 font-sans text-gray-500">SPI Clock</td>
									</tr>
									<tr>
										<td class="px-3 py-2 font-bold text-primary-600">MOSI</td>
										<td class="px-3 py-2 font-bold">GPIO 23</td>
										<td class="px-3 py-2 font-sans text-gray-500">SPI Master Out Slave In</td>
									</tr>
									<tr>
										<td class="px-3 py-2 font-bold text-primary-600">MISO</td>
										<td class="px-3 py-2 font-bold">GPIO 19</td>
										<td class="px-3 py-2 font-sans text-gray-500">SPI Master In Slave Out</td>
									</tr>
									<tr>
										<td class="px-3 py-2 font-bold text-primary-600">RST</td>
										<td class="px-3 py-2 font-bold">GPIO 22</td>
										<td class="px-3 py-2 font-sans text-gray-500">Reset Pin Modul</td>
									</tr>
									<tr>
										<td class="px-3 py-2 font-bold text-amber-600">3.3V (VCC)</td>
										<td class="px-3 py-2 font-bold">3.3V</td>
										<td class="px-3 py-2 font-sans text-red-500 font-semibold">Wajib 3.3V (Jangan ke 5V agar modul tidak rusak!)</td>
									</tr>
									<tr>
										<td class="px-3 py-2 font-bold text-gray-600">GND</td>
										<td class="px-3 py-2 font-bold">GND</td>
										<td class="px-3 py-2 font-sans text-gray-500">Grounding</td>
									</tr>
									<tr>
										<td class="px-3 py-2 font-bold text-violet-600">Buzzer (+)</td>
										<td class="px-3 py-2 font-bold">GPIO 4</td>
										<td class="px-3 py-2 font-sans text-gray-500">Indikator suara bunyi beep saat tap berhasil/gagal</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<!-- TAB 2: SOURCE CODE ARDUINO C++ -->
					<div v-else-if="tutorialModal.activeTab === 2" class="space-y-3">
						<div class="flex items-center justify-between">
							<p class="text-gray-500">
								Sketsa lengkap ESP32 siap upload dengan integrasi <strong>ArduinoJson v7</strong>, WiFiMulti, dan RFID:
							</p>
							<UButton
								size="xs"
								color="primary"
								variant="soft"
								icon="i-heroicons-clipboard-document"
								@click="copyToClipboard(arduinoCodeSample, 'Kode Arduino berhasil disalin!')"
							>
								Salin Sketsa C++
							</UButton>
						</div>

						<div class="p-3.5 rounded-xl bg-gray-950 text-emerald-400 font-mono text-[11px] max-h-96 overflow-y-auto">
							<pre>{{ arduinoCodeSample }}</pre>
						</div>
					</div>

					<!-- TAB 3: TROUBLESHOOTING -->
					<div v-else-if="tutorialModal.activeTab === 3" class="space-y-3">
						<div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1">
							<p class="font-bold text-gray-900 dark:text-white">Status perangkat di dashboard tetap OFFLINE (OFF)?</p>
							<p class="text-gray-500">
								Pastikan komputer server dan ESP32 berada dalam satu jaringan WiFi / LAN yang sama. Periksa Serial Monitor untuk memastikan IP server dapat dijangkau dan WiFi telah terhubung.
							</p>
						</div>

						<div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1">
							<p class="font-bold text-gray-900 dark:text-white">Kartu RFID ditempel tapi tidak ada respon?</p>
							<p class="text-gray-500">
								Periksa kabel jumper pin SPI (SDA, SCK, MOSI, MISO, RST). Pastikan tegangan VCC terhubung ke 3.3V, bukan 5V.
							</p>
						</div>

						<div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1">
							<p class="font-bold text-gray-900 dark:text-white">Buzzer berbunyi panjang (Beep Gagal)?</p>
							<p class="text-gray-500">
								Artinya UID kartu belum terdaftar pada data pegawai atau akun pegawai sedang tidak aktif. Daftarkan kartu tersebut pada profil pegawai terkait.
							</p>
						</div>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end">
						<UButton color="gray" variant="soft" @click="tutorialModal.isOpen = false">
							Tutup Panduan
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>

		<!-- MODAL 7: PANDUAN API DEVELOPER & SEMUA ENDPOINT HTTP (GET, POST, PUT, DELETE) -->
		<UModal v-model="apiGuideModal.isOpen" :ui="{ width: 'sm:max-w-4xl' }">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 border border-emerald-200 dark:border-emerald-800 shrink-0">
								<UIcon name="i-heroicons-code-bracket" class="w-6 h-6" />
							</div>
							<div>
								<h3 class="text-base font-bold leading-6 text-gray-900 dark:text-white">
									Panduan API Developer & Dokumentasi Endpoint IoT
								</h3>
								<p class="text-xs text-gray-500 mt-0.5">
									Daftar lengkap endpoint (GET, POST, PUT, DELETE), format ArduinoJson v7, dan firmware C++.
								</p>
							</div>
						</div>

						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark"
							class="-my-1"
							@click="apiGuideModal.isOpen = false"
						/>
					</div>
				</template>

				<div class="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
					<!-- Tab Navigasi Panduan -->
					<div class="flex border-b border-gray-200 dark:border-gray-800 font-medium overflow-x-auto">
						<button
							type="button"
							class="pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0"
							:class="apiGuideModal.activeTab === 0
								? 'border-primary-500 text-primary-600 font-semibold'
								: 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="apiGuideModal.activeTab = 0"
						>
							<UIcon name="i-heroicons-play" class="w-4 h-4 text-primary-500" />
							Mini-Swagger Interaktif
						</button>
						<button
							type="button"
							class="pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0"
							:class="apiGuideModal.activeTab === 1
								? 'border-primary-500 text-primary-600 font-semibold'
								: 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="apiGuideModal.activeTab = 1"
						>
							<UIcon name="i-heroicons-table-cells" class="w-4 h-4" />
							Ringkasan Endpoint
						</button>
						<button
							type="button"
							class="pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0"
							:class="apiGuideModal.activeTab === 2
								? 'border-primary-500 text-primary-600 font-semibold'
								: 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="apiGuideModal.activeTab = 2"
						>
							<UIcon name="i-heroicons-wifi" class="w-4 h-4" />
							Jaringan & WiFi (GET/POST)
						</button>
						<button
							type="button"
							class="pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0"
							:class="apiGuideModal.activeTab === 3
								? 'border-primary-500 text-primary-600 font-semibold'
								: 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="apiGuideModal.activeTab = 3"
						>
							<UIcon name="i-heroicons-identification" class="w-4 h-4" />
							Presensi RFID (POST)
						</button>
						<button
							type="button"
							class="pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0"
							:class="apiGuideModal.activeTab === 4
								? 'border-primary-500 text-primary-600 font-semibold'
								: 'border-transparent text-gray-500 hover:text-gray-700'"
							@click="apiGuideModal.activeTab = 4"
						>
							<UIcon name="i-heroicons-cpu-chip" class="w-4 h-4" />
							Firmware Arduino C++
						</button>
					</div>

					<!-- TAB 0: MINI SWAGGER INTERAKTIF -->
					<div v-if="apiGuideModal.activeTab === 0" class="pt-2">
						<IotApiExplorer spec-url="/api/iot/presensi/spec" />
					</div>

					<!-- TAB 1: RINGKASAN SEMUA ENDPOINT -->
					<div v-else-if="apiGuideModal.activeTab === 1" class="space-y-3">
						<p class="text-gray-500">
							Sistem e-Health menyediakan API lengkap untuk komunikasi dua arah dengan perangkat Arduino / ESP32:
						</p>

						<div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
							<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left">
								<thead class="bg-gray-50 dark:bg-gray-800/60 font-semibold text-gray-700 dark:text-gray-300">
									<tr>
										<th class="px-3 py-2 w-20">Method</th>
										<th class="px-3 py-2">Endpoint</th>
										<th class="px-3 py-2">Tujuan / Fungsi</th>
										<th class="px-3 py-2">Akses</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 dark:divide-gray-800 font-mono text-[11px]">
									<tr>
										<td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">GET</span></td>
										<td class="px-3 py-2 font-bold text-gray-900 dark:text-white">/api/wifi-config</td>
										<td class="px-3 py-2 font-sans text-gray-600 dark:text-gray-400">Polling kredensial multi-AP WiFi + kirim status jaringan via query</td>
										<td class="px-3 py-2 font-sans"><UBadge color="emerald" variant="subtle" size="xs">Public / Hardware</UBadge></td>
									</tr>
									<tr>
										<td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">POST</span></td>
										<td class="px-3 py-2 font-bold text-gray-900 dark:text-white">/api/iot/heartbeat</td>
										<td class="px-3 py-2 font-sans text-gray-600 dark:text-gray-400">Cek status online, update IP address, SSID, dan kekuatan sinyal RSSI</td>
										<td class="px-3 py-2 font-sans"><UBadge color="emerald" variant="subtle" size="xs">Public / Hardware</UBadge></td>
									</tr>
									<tr>
										<td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">POST</span></td>
										<td class="px-3 py-2 font-bold text-gray-900 dark:text-white">/api/iot/presensi</td>
										<td class="px-3 py-2 font-sans text-gray-600 dark:text-gray-400">Kirim tap UID kartu RFID presensi pegawai (masuk / pulang)</td>
										<td class="px-3 py-2 font-sans"><UBadge color="emerald" variant="subtle" size="xs">Public / Hardware</UBadge></td>
									</tr>
									<tr>
										<td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">POST</span></td>
										<td class="px-3 py-2 font-bold text-gray-900 dark:text-white">/api/iot/sensor/telemetry</td>
										<td class="px-3 py-2 font-sans text-gray-600 dark:text-gray-400">Kirim data pembacaan sensor (suhu, kelembaban, tetesan infus, dll.)</td>
										<td class="px-3 py-2 font-sans"><UBadge color="emerald" variant="subtle" size="xs">Public / Hardware</UBadge></td>
									</tr>
									<tr>
										<td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">POST</span></td>
										<td class="px-3 py-2 font-bold text-gray-900 dark:text-white">/api/iot/device-name</td>
										<td class="px-3 py-2 font-sans text-gray-600 dark:text-gray-400">Sinkronisasi / ganti nama perangkat IoT dari hardware</td>
										<td class="px-3 py-2 font-sans"><UBadge color="emerald" variant="subtle" size="xs">Public / Hardware</UBadge></td>
									</tr>
									<tr>
										<td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">POST</span></td>
										<td class="px-3 py-2 font-bold text-gray-900 dark:text-white">/api/iot/devices/:id/ping</td>
										<td class="px-3 py-2 font-sans text-gray-600 dark:text-gray-400">Ping nyata server ke IP Arduino (aktif hanya jika ada balasan)</td>
										<td class="px-3 py-2 font-sans"><UBadge color="gray" variant="subtle" size="xs">Admin Panel</UBadge></td>
									</tr>
									<tr>
										<td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">GET</span></td>
										<td class="px-3 py-2 font-bold text-gray-900 dark:text-white">/api/iot/devices/:id/data</td>
										<td class="px-3 py-2 font-sans text-gray-600 dark:text-gray-400">Ambil data terstruktur & mapping JSON per device</td>
										<td class="px-3 py-2 font-sans"><UBadge color="gray" variant="subtle" size="xs">Admin Panel</UBadge></td>
									</tr>
									<tr>
										<td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">CRUD</span></td>
										<td class="px-3 py-2 font-bold text-gray-900 dark:text-white">/api/iot/wifi</td>
										<td class="px-3 py-2 font-sans text-gray-600 dark:text-gray-400">Kelola daftar WiFi SSID & password (GET, POST, PUT, DELETE)</td>
										<td class="px-3 py-2 font-sans"><UBadge color="gray" variant="subtle" size="xs">Admin Panel</UBadge></td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<!-- TAB 1: PANDUAN JARINGAN & WIFI -->
					<div v-else-if="apiGuideModal.activeTab === 1" class="space-y-4">
						<div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
							<div class="flex items-center gap-2">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">GET</span>
								<code class="font-bold text-sm text-gray-900 dark:text-white">/api/wifi-config</code>
							</div>
							<p class="text-gray-500">
								Endpoint pooling multi-AP WiFi. Arduino dapat memanggil endpoint ini untuk mendapatkan daftar SSID & Password.
								Mendukung query parameter: <code>?deviceId=ESP32_01&connected_ssid=Kantor_Utama&ip=192.168.1.100&rssi=-65</code>.
							</p>
							<div class="p-3 rounded-lg bg-gray-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
								<pre>{
  "status": "success",
  "data": [
    { "ssid": "Kantor_Utama", "password": "passwordUtama123" },
    { "ssid": "Kantor_Cadangan", "password": "passwordCadangan456" }
  ],
  "timeout_ms": 12000
}</pre>
							</div>
						</div>

						<div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
							<div class="flex items-center gap-2">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">POST</span>
								<code class="font-bold text-sm text-gray-900 dark:text-white">/api/iot/heartbeat</code>
							</div>
							<p class="text-gray-500">
								Laporan berkala status jaringan dari Arduino loop (setiap 30-60 detik). Jika SSID yang dilaporkan belum ada di database, sistem <strong>otomatis menambahkan WiFi fallback</strong> tersebut!
							</p>
							<div class="p-3 rounded-lg bg-gray-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
								<pre>// Request Body JSON:
{
  "deviceId": "ESP32_ATTENDANCE_01",
  "connected_ssid": "Kantor_Utama",
  "ip": "192.168.1.105",
  "rssi": -65,
  "free_ram": 184520
}

// Respon JSON:
{
  "status": "success",
  "message": "Heartbeat received",
  "device_name": "Mesin Presensi Poli Jantung",
  "is_online": true
}</pre>
							</div>
						</div>
					</div>

					<!-- TAB 2: PANDUAN PRESENSI RFID -->
					<div v-else-if="apiGuideModal.activeTab === 2" class="space-y-3">
						<div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
							<div class="flex items-center gap-2">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">POST</span>
								<code class="font-bold text-sm text-gray-900 dark:text-white">/api/iot/presensi</code>
							</div>
							<p class="text-gray-500">
								Merekam tap kartu RFID dari modul RC522 / PN532. Parameter <code>type: "auto"</code> otomatis menentukan apakah pegawai sedang masuk atau pulang berdasarkan riwayat hari ini.
							</p>
							<div class="p-3 rounded-lg bg-gray-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
								<pre>// Request Body JSON:
{
  "deviceId": "ESP32_ATTENDANCE_01",
  "uid": "A1B2C3D4",
  "type": "auto",
  "connected_ssid": "Kantor_Utama",
  "ip": "192.168.1.105"
}

// Respon JSON (Format Kompatibel ArduinoJson v7):
{
  "status": "success",
  "message": "Presensi masuk berhasil dicatat",
  "user": {
    "name": "dr. Budi Santoso, Sp.JP",
    "nip": "198501012010121001",
    "role": "dokter",
    "department": "Poli Jantung"
  },
  "attendance": {
    "type": "masuk",
    "status": "tepat_waktu",
    "timestamp": "2026-11-01T07:45:12.000Z"
  },
  "lcd_message": "Selamat Pagi!\\ndr. Budi Santoso",
  "buzzer_beep": 1
}</pre>
							</div>
						</div>
					</div>

					<!-- TAB 3: PANDUAN SENSOR IOT -->
					<div v-else-if="apiGuideModal.activeTab === 3" class="space-y-3">
						<div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
							<div class="flex items-center gap-2">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">POST</span>
								<code class="font-bold text-sm text-gray-900 dark:text-white">/api/iot/sensor/telemetry</code>
							</div>
							<p class="text-gray-500">
								Mengirim pembacaan parameter sensor secara berkala (misal suhu DHT22, kelembaban, tetesan infus). Server otomatis mengecek threshold dan memicu notifikasi jika di luar batas aman.
							</p>
							<div class="p-3 rounded-lg bg-gray-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
								<pre>// Request Body JSON:
{
  "deviceId": "ESP32_SENSOR_FARMASI_01",
  "values": {
    "temperature": 24.5,
    "humidity": 60.2
  },
  "connected_ssid": "Kantor_Utama",
  "ip": "192.168.1.106",
  "rssi": -62
}

// Respon JSON (Format ArduinoJson v7):
{
  "status": "success",
  "message": "Telemetry received successfully",
  "device_id": "ESP32_SENSOR_FARMASI_01",
  "condition": "normal",
  "alert": null,
  "server_time": 1730452930
}</pre>
							</div>
						</div>
					</div>

					<!-- TAB 4: CONTOH KODE ARDUINO C++ -->
					<div v-else-if="apiGuideModal.activeTab === 4" class="space-y-3">
						<div class="flex items-center justify-between">
							<p class="text-gray-500">
								Contoh kode C++ ESP32 menggunakan library resmi <strong>WiFi.h</strong>, <strong>HTTPClient.h</strong>, dan <strong>ArduinoJson.h (v7)</strong>:
							</p>
							<UButton
								size="xs"
								color="primary"
								variant="soft"
								@click="copyToClipboard(arduinoCodeSample, 'Kode Arduino C++ berhasil disalin!')"
							>
								Salin Kode C++
							</UButton>
						</div>

						<div class="p-3.5 rounded-xl bg-gray-950 text-emerald-400 font-mono text-[11px] max-h-96 overflow-y-auto">
							<pre>{{ arduinoCodeSample }}</pre>
						</div>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end">
						<UButton color="gray" variant="soft" @click="apiGuideModal.isOpen = false">
							Tutup
						</UButton>
					</div>
				</template>
			</UCard>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	const toast = useToast();

	// State Utama
	const isLoading = ref(false);
	const selectedTab = ref(0);

	const tabs = [
		{ label: 'Status & Monitoring Device (ON/OFF)', slot: 'devices', icon: 'i-heroicons-signal' },
		{ label: 'Tabel Presensi Masuk & Pulang', slot: 'attendance', icon: 'i-heroicons-clipboard-document-list' },
		{ label: 'Setting WiFi Device (Multi-AP)', slot: 'wifi', icon: 'i-heroicons-wifi' },
		{ label: 'Tutorial Koneksi & Kode Arduino', slot: 'guide', icon: 'i-heroicons-academic-cap' },
	];

	// Data Perangkat
	const devices = ref<any[]>([]);
	const deviceStats = ref({ total: 0, online: 0, offline: 0 });
	const devicePinging = ref<Record<string, boolean>>({});

	// Data Presensi
	const attendances = ref<any[]>([]);
	const attendanceStats = ref({
		todayTotal: 0,
		todayMasuk: 0,
		todayPulang: 0,
		todayTerlambat: 0,
	});
	const attendancePagination = ref({
		page: 1,
		pageSize: 15,
		total: 0,
	});
	const attendanceFilters = ref({
		search: '',
		type: 'all',
		status: 'all',
		datePreset: 'today',
		deviceId: 'all',
		dateFrom: '',
		dateTo: '',
	});

	// Data WiFi
	const wifiList = ref<any[]>([]);
	const wifiStats = ref({ totalActive: 0, timeout_ms: 12000 });
	const showPasswords = ref<Record<string, boolean>>({});

	// Data Staff / Dokter untuk modal
	const staffList = ref<any[]>([]);

	// Modal States
	const confirmModal = ref({
		isOpen: false,
		title: '',
		message: '',
		confirmText: 'Ya, Hapus',
		isDeleting: false,
		action: null as (() => Promise<void>) | null,
	});

	const deviceDetailModal = ref({
		isOpen: false,
		isLoading: false,
		device: null as any,
		arduinoJson: null as any,
		recentAttendances: [] as any[],
		stats: { todayMasuk: 0, todayPulang: 0, totalHistorical: 0 },
		activeTab: 0,
	});

	const wifiModal = ref({
		isOpen: false,
		isEdit: false,
		isSaving: false,
		targetId: '',
		form: {
			ssid: '',
			password: '',
			priority: 1,
			isActive: true,
			description: '',
			timeoutMs: 12000,
		},
	});

	const deviceModal = ref({
		isOpen: false,
		isEdit: false,
		isSaving: false,
		targetId: '',
		form: {
			deviceId: '',
			name: '',
			location: '',
			notes: '',
		},
	});

	const tutorialModal = ref({
		isOpen: false,
		device: null as any,
		activeTab: 0,
	});

	const apiGuideModal = ref({
		isOpen: false,
		activeTab: 0,
	});

	const manualModal = ref({
		isOpen: false,
		isSaving: false,
		form: {
			userId: '',
			type: 'masuk',
			status: 'tepat_waktu',
			notes: '',
		},
	});

	const simModal = ref({
		isOpen: false,
		isSubmitting: false,
		result: null as any,
		form: {
			deviceId: '',
			uid: '',
			type: 'auto',
			connectedSsid: '',
		},
	});

	const jsonModal = ref({
		isOpen: false,
		rawJson: '',
	});

	// Options Dropdown
	const staffOptions = computed(() =>
		staffList.value.map((s) => ({
			label: `${s.name} (${s.nip || s.role}) - ${s.department}`,
			value: s.id,
		})),
	);

	const deviceOptions = computed(() => {
		if (devices.value.length === 0) {
			return [{ label: 'ESP32_ATTENDANCE_01 (Default)', value: 'ESP32_ATTENDANCE_01' }];
		}
		return devices.value.map((d) => ({
			label: `${d.name} (${d.deviceId})`,
			value: d.deviceId,
		}));
	});

	const wifiOptions = computed(() =>
		wifiList.value.map((w) => ({
			label: `${w.ssid} (${w.description || 'Aktif'})`,
			value: w.ssid,
		})),
	);

	// Fetch Devices
	const fetchDevices = async () => {
		try {
			const res: any = await $fetch('/api/iot/devices');
			if (res?.data) {
				devices.value = res.data.devices || [];
				deviceStats.value = res.data.stats || { total: 0, online: 0, offline: 0 };
			}
		} catch (error: any) {
			console.error('Fetch devices error:', error);
		}
	};

	// Fetch WiFi
	const fetchWifi = async () => {
		try {
			const res: any = await $fetch('/api/iot/wifi');
			if (res?.data) {
				wifiList.value = res.data.wifis || [];
				wifiStats.value = {
					totalActive: res.data.totalActive || 0,
					timeout_ms: res.data.timeout_ms || 12000,
				};
			}
		} catch (error: any) {
			console.error('Fetch wifi error:', error);
		}
	};

	// Fetch Attendances
	const fetchAttendance = async () => {
		try {
			const params: Record<string, any> = {
				page: attendancePagination.value.page,
				pageSize: attendancePagination.value.pageSize,
				search: attendanceFilters.value.search,
				type: attendanceFilters.value.type,
				status: attendanceFilters.value.status,
				deviceId: attendanceFilters.value.deviceId,
			};

			if (attendanceFilters.value.dateFrom) params.dateFrom = attendanceFilters.value.dateFrom;
			if (attendanceFilters.value.dateTo) params.dateTo = attendanceFilters.value.dateTo;

			const res: any = await $fetch('/api/iot/attendance', { params });
			if (res?.data) {
				attendances.value = res.data.items || [];
				attendanceStats.value = res.data.stats || {
					todayTotal: 0,
					todayMasuk: 0,
					todayPulang: 0,
					todayTerlambat: 0,
				};
			}
			if (res?.meta) {
				attendancePagination.value.total = res.meta.total || 0;
			}
		} catch (error: any) {
			console.error('Fetch attendance error:', error);
		}
	};

	// Fetch Staff List
	const fetchStaff = async () => {
		try {
			const res: any = await $fetch('/api/iot/staff');
			if (res?.data) {
				staffList.value = res.data;
			}
		} catch (error: any) {
			console.error('Fetch staff error:', error);
		}
	};

	// Refresh All Data
	const refreshAllData = async () => {
		isLoading.value = true;
		try {
			await Promise.all([fetchDevices(), fetchWifi(), fetchAttendance(), fetchStaff()]);
			toast.add({
				title: 'Data Diperbarui',
				description: 'Status perangkat, log presensi, dan data WiFi berhasil disegarkan.',
				color: 'emerald',
			});
		} finally {
			isLoading.value = false;
		}
	};

	// Debounce search
	let searchTimeout: any = null;
	const debouncedFetchAttendance = () => {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			attendancePagination.value.page = 1;
			fetchAttendance();
		}, 300);
	};

	// Date preset handler
	const handleDatePresetChange = (preset: string) => {
		const now = new Date();
		if (preset === 'today') {
			const todayStr = now.toISOString().split('T')[0];
			attendanceFilters.value.dateFrom = todayStr;
			attendanceFilters.value.dateTo = todayStr;
		} else if (preset === '7d') {
			const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			attendanceFilters.value.dateFrom = past.toISOString().split('T')[0];
			attendanceFilters.value.dateTo = now.toISOString().split('T')[0];
		} else if (preset === '30d') {
			const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			attendanceFilters.value.dateFrom = past.toISOString().split('T')[0];
			attendanceFilters.value.dateTo = now.toISOString().split('T')[0];
		} else {
			attendanceFilters.value.dateFrom = '';
			attendanceFilters.value.dateTo = '';
		}
		attendancePagination.value.page = 1;
		fetchAttendance();
	};

	// Nuxt UI Confirm Action Executor
	const executeConfirmedAction = async () => {
		if (!confirmModal.value.action) return;
		confirmModal.value.isDeleting = true;
		try {
			await confirmModal.value.action();
			confirmModal.value.isOpen = false;
		} catch (err: any) {
			toast.add({
				title: 'Gagal',
				description: err?.data?.error?.message || err?.message || 'Tindakan gagal dilakukan',
				color: 'red',
			});
		} finally {
			confirmModal.value.isDeleting = false;
		}
	};

	// Open Per-Device Detail & JSON Modal
	const openDeviceDetail = async (device: any) => {
		deviceDetailModal.value = {
			isOpen: true,
			isLoading: true,
			device: { ...device },
			arduinoJson: null,
			recentAttendances: [],
			stats: { todayMasuk: 0, todayPulang: 0, totalHistorical: 0 },
			activeTab: 0,
		};

		try {
			const res: any = await $fetch(`/api/iot/devices/${device._id}/data`);
			if (res?.data) {
				deviceDetailModal.value.device = res.data.device;
				deviceDetailModal.value.arduinoJson = res.data.arduinoJson;
				deviceDetailModal.value.recentAttendances = res.data.recentAttendances || [];
				deviceDetailModal.value.stats = res.data.stats || { todayMasuk: 0, todayPulang: 0, totalHistorical: 0 };
			}
		} catch (err: any) {
			toast.add({ title: 'Gagal', description: 'Gagal mengambil data perangkat', color: 'red' });
		} finally {
			deviceDetailModal.value.isLoading = false;
		}
	};

	// WiFi Actions
	const openAddWifiModal = () => {
		wifiModal.value = {
			isOpen: true,
			isEdit: false,
			isSaving: false,
			targetId: '',
			form: {
				ssid: '',
				password: '',
				priority: wifiList.value.length + 1,
				isActive: true,
				description: '',
				timeoutMs: 12000,
			},
		};
	};

	const editWifi = (item: any) => {
		wifiModal.value = {
			isOpen: true,
			isEdit: true,
			isSaving: false,
			targetId: item._id,
			form: {
				ssid: item.ssid,
				password: item.password,
				priority: item.priority || 1,
				isActive: item.isActive !== false,
				description: item.description || '',
				timeoutMs: item.timeoutMs || 12000,
			},
		};
	};

	const saveWifiConfig = async () => {
		if (!wifiModal.value.form.ssid || !wifiModal.value.form.password) {
			toast.add({
				title: 'Validasi Gagal',
				description: 'SSID dan Password WiFi wajib diisi.',
				color: 'red',
			});
			return;
		}

		wifiModal.value.isSaving = true;
		try {
			if (wifiModal.value.isEdit) {
				await $fetch(`/api/iot/wifi/${wifiModal.value.targetId}`, {
					method: 'PUT',
					body: wifiModal.value.form,
				});
				toast.add({ title: 'Berhasil', description: 'Konfigurasi WiFi diperbarui.', color: 'emerald' });
			} else {
				await $fetch('/api/iot/wifi', {
					method: 'POST',
					body: wifiModal.value.form,
				});
				toast.add({ title: 'Berhasil', description: 'WiFi baru berhasil ditambahkan.', color: 'emerald' });
			}
			wifiModal.value.isOpen = false;
			await fetchWifi();
		} catch (error: any) {
			toast.add({
				title: 'Gagal',
				description: error?.data?.error?.message || 'Gagal menyimpan WiFi',
				color: 'red',
			});
		} finally {
			wifiModal.value.isSaving = false;
		}
	};

	const toggleWifiActive = async (wifi: any) => {
		try {
			await $fetch(`/api/iot/wifi/${wifi._id}`, {
				method: 'PUT',
				body: { isActive: wifi.isActive },
			});
			toast.add({
				title: 'Status Diperbarui',
				description: `WiFi ${wifi.ssid} ${wifi.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
				color: 'emerald',
			});
		} catch (error: any) {
			wifi.isActive = !wifi.isActive;
			toast.add({ title: 'Gagal', description: 'Gagal mengubah status WiFi', color: 'red' });
		}
	};

	// Konfirmasi Hapus WiFi dengan Nuxt UI Modal
	const confirmDeleteWifi = (wifi: any) => {
		confirmModal.value = {
			isOpen: true,
			title: 'Hapus Konfigurasi WiFi?',
			message: `Apakah Anda yakin ingin menghapus konfigurasi WiFi '${wifi.ssid}'? Perangkat yang mengandalkan SSID ini tidak akan menerimanya lagi saat pooling.`,
			confirmText: 'Ya, Hapus WiFi',
			isDeleting: false,
			action: async () => {
				await $fetch(`/api/iot/wifi/${wifi._id}`, { method: 'DELETE' });
				toast.add({ title: 'WiFi Dihapus', description: `WiFi ${wifi.ssid} berhasil dihapus.`, color: 'emerald' });
				await fetchWifi();
			},
		};
	};

	const togglePasswordVisibility = (id: string) => {
		showPasswords.value[id] = !showPasswords.value[id];
	};

	// Device Actions
	const openTutorialModal = (device: any) => {
		tutorialModal.value = {
			isOpen: true,
			device: device || devices.value[0] || null,
			activeTab: 0,
		};
	};

	const openApiGuideModal = () => {
		apiGuideModal.value.isOpen = true;
	};

	const openAddDeviceModal = () => {
		deviceModal.value = {
			isOpen: true,
			isEdit: false,
			isSaving: false,
			targetId: '',
			form: {
				deviceId: `ESP32_PRESENSI_${Date.now().toString().slice(-4)}`,
				name: 'Mesin Presensi Pintu Utama',
				location: 'Lantai 1 - Pintu Masuk Pegawai',
				notes: 'Modul ESP32 + RFID RC522',
			},
		};
	};

	const editDevice = (item: any) => {
		deviceModal.value = {
			isOpen: true,
			isEdit: true,
			isSaving: false,
			targetId: item._id,
			form: {
				deviceId: item.deviceId,
				name: item.name,
				location: item.location || '',
				notes: item.notes || '',
			},
		};
	};

	const saveDevice = async () => {
		if (!deviceModal.value.form.deviceId) {
			toast.add({ title: 'Validasi', description: 'Device ID wajib diisi.', color: 'red' });
			return;
		}

		deviceModal.value.isSaving = true;
		try {
			if (deviceModal.value.isEdit) {
				await $fetch(`/api/iot/devices/${deviceModal.value.targetId}`, {
					method: 'PUT',
					body: deviceModal.value.form,
				});
				toast.add({ title: 'Berhasil', description: 'Informasi dan nama perangkat diperbarui.', color: 'emerald' });
			} else {
				await $fetch('/api/iot/devices', {
					method: 'POST',
					body: deviceModal.value.form,
				});
				toast.add({ title: 'Berhasil', description: 'Perangkat berhasil didaftarkan.', color: 'emerald' });
			}
			deviceModal.value.isOpen = false;
			await fetchDevices();
		} catch (error: any) {
			toast.add({
				title: 'Gagal',
				description: error?.data?.error?.message || 'Gagal menyimpan perangkat',
				color: 'red',
			});
		} finally {
			deviceModal.value.isSaving = false;
		}
	};

	// Uji Ping Nyata (Aktif jika ada balasan, tetap offline jika tidak)
	const pingDevice = async (device: any) => {
		devicePinging.value[device._id] = true;
		try {
			const res: any = await $fetch(`/api/iot/devices/${device._id}/ping`, { method: 'POST' });
			if (res?.data?.isOnline) {
				toast.add({
					title: 'Perangkat ONLINE',
					description: res.data.message || `Balasan diterima dari ${device.name}. Status: ONLINE.`,
					color: 'emerald',
					icon: 'i-heroicons-check-circle',
				});
			} else {
				toast.add({
					title: 'Perangkat OFFLINE',
					description: res.data.message || `Tidak ada balasan dari ${device.name}. Status tetap OFFLINE.`,
					color: 'amber',
					icon: 'i-heroicons-exclamation-triangle',
				});
			}
			await fetchDevices();
		} catch (error: any) {
			toast.add({
				title: 'Ping Gagal',
				description: error?.data?.error?.message || 'Tidak ada balasan dari perangkat.',
				color: 'red',
			});
		} finally {
			devicePinging.value[device._id] = false;
		}
	};

	// Konfirmasi Hapus Perangkat dengan Nuxt UI Modal (Gantikan browser confirm())
	const confirmDeleteDevice = (device: any) => {
		confirmModal.value = {
			isOpen: true,
			title: 'Hapus Perangkat IoT?',
			message: `Apakah Anda yakin ingin menghapus perangkat '${device.name}' (${device.deviceId})? Riwayat transaksi dan identitas perangkat ini akan dihapus dari sistem.`,
			confirmText: 'Ya, Hapus Perangkat',
			isDeleting: false,
			action: async () => {
				await $fetch(`/api/iot/devices/${device._id}`, { method: 'DELETE' });
				toast.add({ title: 'Dihapus', description: `Perangkat '${device.name}' berhasil dihapus.`, color: 'emerald' });
				await fetchDevices();
			},
		};
	};

	// Attendance Actions
	const openManualAttendanceModal = () => {
		manualModal.value = {
			isOpen: true,
			isSaving: false,
			form: {
				userId: staffList.value[0]?.id || '',
				type: 'masuk',
				status: 'tepat_waktu',
				notes: 'Input presensi manual oleh admin',
			},
		};
	};

	const saveManualAttendance = async () => {
		if (!manualModal.value.form.userId) {
			toast.add({ title: 'Validasi', description: 'Pilih pegawai terlebih dahulu.', color: 'red' });
			return;
		}

		manualModal.value.isSaving = true;
		try {
			await $fetch('/api/iot/attendance', {
				method: 'POST',
				body: manualModal.value.form,
			});
			toast.add({ title: 'Presensi Dicatat', description: 'Data kehadiran manual berhasil disimpan.', color: 'emerald' });
			manualModal.value.isOpen = false;
			await fetchAttendance();
		} catch (error: any) {
			toast.add({
				title: 'Gagal',
				description: error?.data?.error?.message || 'Gagal menyimpan presensi',
				color: 'red',
			});
		} finally {
			manualModal.value.isSaving = false;
		}
	};

	// Konfirmasi Hapus Log Presensi dengan Nuxt UI Modal
	const confirmDeleteAttendance = (item: any) => {
		confirmModal.value = {
			isOpen: true,
			title: 'Hapus Log Presensi?',
			message: `Apakah Anda yakin ingin menghapus catatan presensi '${item.userName}' (${item.type}) pada ${formatDate(item.timestamp)}?`,
			confirmText: 'Ya, Hapus Presensi',
			isDeleting: false,
			action: async () => {
				await $fetch(`/api/iot/attendance/${item._id}`, { method: 'DELETE' });
				toast.add({ title: 'Dihapus', description: 'Record presensi berhasil dihapus.', color: 'emerald' });
				await fetchAttendance();
			},
		};
	};

	// Simulation Actions
	const openSimulationModal = () => {
		simModal.value = {
			isOpen: true,
			isSubmitting: false,
			result: null,
			form: {
				deviceId: devices.value[0]?.deviceId || 'ESP32_ATTENDANCE_01',
				uid: staffList.value[0]?.rfidCardId || staffList.value[0]?.nip || 'A1B2C3D4',
				type: 'auto',
				connectedSsid: wifiList.value[0]?.ssid || 'Kantor_Utama',
			},
		};
	};

	const submitSimulatedTap = async () => {
		if (!simModal.value.form.uid) {
			toast.add({ title: 'Validasi', description: 'Masukkan UID kartu RFID.', color: 'red' });
			return;
		}

		simModal.value.isSubmitting = true;
		try {
			const res: any = await $fetch('/api/iot/presensi', {
				method: 'POST',
				body: simModal.value.form,
			});
			simModal.value.result = res;
			toast.add({
				title: 'Simulasi Berhasil',
				description: res.message || 'Presensi berhasil dicatat!',
				color: 'emerald',
			});
			await Promise.all([fetchAttendance(), fetchDevices()]);
		} catch (error: any) {
			toast.add({
				title: 'Gagal',
				description: error?.message || 'Gagal mengirim simulasi tap',
				color: 'red',
			});
		} finally {
			simModal.value.isSubmitting = false;
		}
	};

	// JSON Modal Global Preview
	const openJsonPreviewModal = async () => {
		try {
			const res = await $fetch('/api/wifi-config');
			jsonModal.value.rawJson = JSON.stringify(res, null, 2);
			jsonModal.value.isOpen = true;
		} catch (error: any) {
			toast.add({ title: 'Gagal', description: 'Gagal mengambil endpoint wifi-config', color: 'red' });
		}
	};

	// Utilities
	const copyToClipboard = (text: string, msg: string) => {
		navigator.clipboard.writeText(text);
		toast.add({ title: 'Disalin!', description: msg, color: 'emerald' });
	};

	const formatLastSeen = (dateStr: string) => {
		if (!dateStr) return 'Belum pernah aktif';
		const date = new Date(dateStr);
		const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
		if (diffSec < 60) return `${diffSec} detik lalu`;
		if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
		if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
		return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
	};

	const formatTime = (dateStr: string) => {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	};

	const formatDate = (dateStr: string) => {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	};

	const getInitials = (name: string) => {
		if (!name) return 'PG';
		const parts = name.trim().split(/\s+/);
		if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
		return parts[0].slice(0, 2).toUpperCase();
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'tepat_waktu':
				return 'emerald';
			case 'terlambat':
				return 'amber';
			case 'pulang_cepat':
				return 'rose';
			case 'lembur':
				return 'purple';
			default:
				return 'gray';
		}
	};

	const formatPunctualityStatus = (status: string) => {
		switch (status) {
			case 'tepat_waktu':
				return 'Tepat Waktu';
			case 'terlambat':
				return 'Terlambat';
			case 'pulang_cepat':
				return 'Pulang Cepat';
			case 'lembur':
				return 'Lembur';
			default:
				return status;
		}
	};

	const getRssiClass = (rssi: number) => {
		if (rssi >= -60) return 'text-emerald-600 dark:text-emerald-400 font-bold';
		if (rssi >= -75) return 'text-amber-600 dark:text-amber-400 font-semibold';
		return 'text-rose-600 dark:text-rose-400';
	};

	const getRssiLabel = (rssi: number) => {
		if (rssi >= -60) return 'Sangat Kuat';
		if (rssi >= -75) return 'Bagus';
		return 'Lemah';
	};

	// Sample Arduino C++ Code
	const arduinoCodeSample = `/*
  ==============================================================
  SKETSA ARDUINO / ESP32: PRESENSI IOT DENGAN MULTI-AP WIFI POOL
  Library Pendukung:
    - ArduinoJson v7.x (Benoit Blanchon)
    - WiFi & HTTPClient (Bawaan ESP32 / ESP8266)
    - MFRC522 (Untuk modul RFID RC522)
  ==============================================================
*/

#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN   22
#define SS_PIN    21
#define BUZZER    4

const char* DEVICE_ID = "ESP32_ATTENDANCE_01";
const char* BASE_SERVER = "http://192.168.1.10:3000"; // Sesuaikan dengan IP Server SIMPRS
String currentDeviceName = "Mesin Presensi"; // Dapat diubah dari Dashboard Web

WiFiMulti wifiMulti;
MFRC522 rfid(SS_PIN, RST_PIN);
unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 30000; // 30 detik

// 1. FUNGSI POOLING KONFIGURASI WIFI & NAMA PERANGKAT DARI SERVER
void fetchAndConfigureWifi() {
  Serial.println("[WIFI] Meminta konfigurasi WiFi dari server...");
  HTTPClient http;
  String url = String(BASE_SERVER) + "/api/wifi-config?deviceId=" + DEVICE_ID;
  http.begin(url);
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    Serial.println("[WIFI] Response received: " + payload);

    // Parsing JSON menggunakan ArduinoJson v7
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error && doc["status"] == "success") {
      // Sinkronkan nama perangkat yang diatur di Web Dashboard
      if (doc["device_name"].is<const char*>()) {
        currentDeviceName = doc["device_name"].as<String>();
        Serial.printf("[DEVICE] Nama Perangkat Resmi: %s\\n", currentDeviceName.c_str());
      }

      JsonArray wifiList = doc["data"].as<JsonArray>();
      for (JsonObject item : wifiList) {
        const char* ssid = item["ssid"];
        const char* pass = item["password"];
        wifiMulti.addAP(ssid, pass);
        Serial.printf("[WIFI] Mendaftarkan AP: %s\\n", ssid);
      }
    }
  }
  http.end();
}

// 2. FUNGSI LAPOR STATUS DEVICE (DETEKSI WIFI TERHUBUNG & STATUS ON)
void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(BASE_SERVER) + "/api/iot/heartbeat";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["deviceName"] = currentDeviceName;
  doc["status"] = "online";
  doc["connectedSsid"] = WiFi.SSID();
  doc["ipAddress"] = WiFi.localIP().toString();
  doc["rssi"] = WiFi.RSSI();

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode == HTTP_CODE_OK) {
    String resp = http.getString();
    JsonDocument resDoc;
    deserializeJson(resDoc, resp);
    // Update nama jika admin mengubahnya di web
    if (resDoc["device"]["name"].is<const char*>()) {
      currentDeviceName = resDoc["device"]["name"].as<String>();
    }
    Serial.printf("[HEARTBEAT] Sukses dilaporkan (%s). Sinyal: %d dBm\\n", currentDeviceName.c_str(), WiFi.RSSI());
  }
  http.end();
}

// 3. FUNGSI CATAT PRESENSI MASUK / PULANG DARI RFID
void sendAttendance(String uid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERR] WiFi tidak terhubung! Presensi dibatalkan.");
    return;
  }

  HTTPClient http;
  String url = String(BASE_SERVER) + "/api/iot/presensi";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["uid"] = uid;
  doc["type"] = "auto"; // Auto detect masuk vs pulang berdasarkan jam & hari ini
  doc["connectedSsid"] = WiFi.SSID();

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode == HTTP_CODE_OK) {
    String response = http.getString();
    JsonDocument resDoc;
    deserializeJson(resDoc, response);

    const char* name = resDoc["data"]["name"];
    const char* type = resDoc["data"]["type"];
    const char* time = resDoc["data"]["time"];

    Serial.printf("[SUKSES] %s (%s) pukul %s\\n", name, type, time);

    // Beep 2x tanda sukses
    tone(BUZZER, 2000, 150);
    delay(200);
    tone(BUZZER, 2000, 150);
  } else {
    // Beep panjang tanda gagal
    tone(BUZZER, 800, 500);
  }
  http.end();
}

// 4. FUNGSI KIRIM TELEMETRI SENSOR IOT (UNTUK DEVICE SENSOR)
void sendSensorTelemetry(float temperature, float humidity) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(BASE_SERVER) + "/api/iot/sensor/telemetry";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["values"]["temperature"] = temperature;
  doc["values"]["humidity"] = humidity;
  doc["connected_ssid"] = WiFi.SSID();
  doc["ip"] = WiFi.localIP().toString();
  doc["rssi"] = WiFi.RSSI();

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode == HTTP_CODE_OK) {
    String resp = http.getString();
    JsonDocument resDoc;
    deserializeJson(resDoc, resp);
    const char* cond = resDoc["condition"];
    Serial.printf("[SENSOR] Telemetri terkirim! Status: %s\\n", cond);
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  SPI.begin();
  rfid.PCD_Init();

  // Hubungkan ke WiFi awal untuk fetch config pertama kali
  WiFi.begin("Kantor_Utama", "passwordUtama123");
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  // Ambil list Multi-AP lengkap dari server
  fetchAndConfigureWifi();
  sendHeartbeat();
  Serial.println("\\n[IOT] Sistem Siap Menerima Tap Kartu RFID!");
}

void loop() {
  // 1. Maintain WiFi Connection (Otomatis switch jika SSID utama putus)
  if (wifiMulti.run() != WL_CONNECTED) {
    Serial.println("[WIFI] Sedang mencari AP yang tersedia...");
    delay(1000);
    return;
  }

  // 2. Kirim Heartbeat Periodik
  if (millis() - lastHeartbeat > HEARTBEAT_INTERVAL) {
    lastHeartbeat = millis();
    sendHeartbeat();
  }

  // 3. Deteksi Tap Kartu RFID
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  // Baca UID kartu
  String uidStr = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uidStr += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uidStr += String(rfid.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();
  Serial.println("[RFID] Kartu terdeteksi: " + uidStr);

  sendAttendance(uidStr);
  rfid.PICC_HaltA();
  delay(1000);
}`;

	// Lifecycle Hook
	onMounted(async () => {
		// Set default date range to today
		const todayStr = new Date().toISOString().split('T')[0];
		attendanceFilters.value.dateFrom = todayStr;
		attendanceFilters.value.dateTo = todayStr;

		await Promise.all([fetchDevices(), fetchWifi(), fetchAttendance(), fetchStaff()]);
	});
</script>
