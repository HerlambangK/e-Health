<template>
	<div class="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
		<!-- Header Banner & Avatar Card -->
		<UCard
			class="shadow-sm border-gray-200 dark:border-gray-800 overflow-hidden relative"
		>
			<div
				class="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-600 via-sky-600 to-indigo-700 opacity-90"
			></div>

			<div class="relative pt-12 sm:pt-14 px-2 sm:px-4">
				<div
					class="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
				>
					<div
						class="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left"
					>
						<!-- Avatar -->
						<div class="relative">
							<div
								class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white dark:bg-gray-800 p-1.5 shadow-xl ring-4 ring-white dark:ring-gray-900 flex items-center justify-center"
							>
								<div
									class="w-full h-full rounded-xl bg-gradient-to-tr from-primary-600 to-sky-400 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-inner"
								>
									{{ userInitials }}
								</div>
							</div>
							<span
								class="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"
								title="Akun Aktif"
							></span>
						</div>

						<!-- Identity Info -->
						<div class="space-y-1 pb-1">
							<div
								class="flex flex-wrap items-center justify-center sm:justify-start gap-2"
							>
								<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
									{{ form.name || 'Nama Pengguna' }}
								</h1>
								<UBadge
									:color="roleBadgeColor"
									variant="subtle"
									size="sm"
									class="capitalize font-semibold"
								>
									{{ form.role || 'Staff' }}
								</UBadge>
							</div>
							<p
								class="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center justify-center sm:justify-start gap-1.5"
							>
								<UIcon
									name="i-heroicons-briefcase"
									class="w-4 h-4 text-primary-500"
								/>
								<span>{{ form.position || 'Staf Medis / SIMPRS' }}</span>
								<span class="text-gray-400">&bull;</span>
								<span>{{ form.department || 'Unit SIMPRS' }}</span>
							</p>
							<p
								class="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1"
							>
								<UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5" />
								<span>{{ form.email }}</span>
								<span v-if="form.phone" class="text-gray-400 ml-2">&bull;</span>
								<span v-if="form.phone" class="flex items-center gap-1 ml-1">
									<UIcon name="i-heroicons-phone" class="w-3.5 h-3.5" />
									{{ form.phone }}
								</span>
							</p>
						</div>
					</div>

					<!-- Save Action Button on Header -->
					<div
						class="flex items-center justify-center sm:justify-end gap-2 pb-1"
					>
						<UButton
							icon="i-heroicons-check"
							color="primary"
							size="md"
							:loading="isSaving"
							@click="saveProfile"
							class="px-5 shadow-sm"
						>
							Simpan Perubahan
						</UButton>
					</div>
				</div>
			</div>
		</UCard>

		<!-- Main Form Layout: 2 Columns on Large Screens -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left Column: Data Diri & Kepegawaian (2 Cols) -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Card 1: Informasi Pribadi & Posisi -->
				<UCard class="shadow-sm border-gray-200 dark:border-gray-800">
					<template #header>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<UIcon
									name="i-heroicons-user"
									class="w-5 h-5 text-primary-500"
								/>
								<h2
									class="text-base font-semibold text-gray-900 dark:text-white"
								>
									Informasi Akun & Kepegawaian
								</h2>
							</div>
							<span class="text-xs text-gray-500 dark:text-gray-400"
								>Data Terverifikasi</span
							>
						</div>
					</template>

					<div class="space-y-4">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<UFormGroup
								label="Nama Lengkap / Nama Akun"
								required
								help="Nama lengkap resmi staf atau penanggung jawab"
							>
								<UInput
									v-model="form.name"
									placeholder="Contoh: dr. Herlambang Kurniawan, Sp.A"
									icon="i-heroicons-user"
								/>
							</UFormGroup>

							<UFormGroup
								label="Nomor HP / WhatsApp"
								help="Nomor kontak aktif untuk koordinasi"
							>
								<UInput
									v-model="form.phone"
									placeholder="Contoh: 081234567890"
									icon="i-heroicons-phone"
								/>
							</UFormGroup>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<UFormGroup
								label="Posisi / Jabatan Struktural"
								help="Jabatan di instansi rumah sakit"
							>
								<UInput
									v-model="form.position"
									placeholder="Contoh: Kepala Instalasi SIMRS & TI"
									icon="i-heroicons-briefcase"
								/>
							</UFormGroup>

							<UFormGroup
								label="Departemen / Unit Kerja"
								help="Unit instalasi penempatan kerja"
							>
								<UInput
									v-model="form.department"
									placeholder="Contoh: Divisi IT & Rekam Medis"
									icon="i-heroicons-building-office"
								/>
							</UFormGroup>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<UFormGroup
								label="NIP / ID Pegawai"
								help="Nomor identitas staf (opsional)"
							>
								<UInput
									v-model="form.nip"
									placeholder="Contoh: 198501012010011002"
									icon="i-heroicons-identification"
								/>
							</UFormGroup>

							<UFormGroup
								label="Peran Akses Sistem (Role)"
								help="Tingkat izin hak akses pada sistem SIMPRS"
							>
								<UInput
									:model-value="form.role?.toUpperCase()"
									disabled
									icon="i-heroicons-shield-check"
									class="bg-gray-50 dark:bg-gray-800/50"
								/>
							</UFormGroup>
						</div>
					</div>
				</UCard>

				<!-- Card 2: Keamanan & Ganti Password -->
				<UCard class="shadow-sm border-gray-200 dark:border-gray-800">
					<template #header>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<UIcon name="i-heroicons-key" class="w-5 h-5 text-amber-500" />
								<h2
									class="text-base font-semibold text-gray-900 dark:text-white"
								>
									Keamanan Akun & Ganti Kata Sandi
								</h2>
							</div>
							<span class="text-xs text-gray-500 dark:text-gray-400"
								>Opsional</span
							>
						</div>
					</template>

					<div class="space-y-4">
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Kosongkan bagian ini jika Anda tidak ingin mengubah kata sandi
							akun saat ini.
						</p>

						<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<UFormGroup label="Kata Sandi Saat Ini">
								<UInput
									v-model="passwordForm.currentPassword"
									type="password"
									placeholder="••••••••"
									icon="i-heroicons-lock-closed"
								/>
							</UFormGroup>

							<UFormGroup label="Kata Sandi Baru">
								<UInput
									v-model="passwordForm.newPassword"
									type="password"
									placeholder="Min. 6 Karakter"
									icon="i-heroicons-lock-closed"
								/>
							</UFormGroup>

							<UFormGroup label="Ulangi Sandi Baru">
								<UInput
									v-model="passwordForm.confirmPassword"
									type="password"
									placeholder="Ulangi sandi baru"
									icon="i-heroicons-lock-closed"
								/>
							</UFormGroup>
						</div>
					</div>
				</UCard>
			</div>

			<!-- Right Column: Konfigurasi Email & Notifikasi Sistem (1 Col) -->
			<div class="space-y-6">
				<!-- Card 3: Konfigurasi Email Notifikasi Utama (CRITICAL) -->
				<UCard
					class="shadow-md border-primary-200 dark:border-primary-900 ring-1 ring-primary-500/20"
				>
					<template #header>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<UIcon
									name="i-heroicons-bell-alert"
									class="w-5 h-5 text-primary-500"
								/>
								<h2
									class="text-base font-semibold text-gray-900 dark:text-white"
								>
									Email Notifikasi Sistem
								</h2>
							</div>
							<UBadge
								:color="form.receiveNotifications ? 'green' : 'gray'"
								variant="subtle"
								size="xs"
							>
								{{ form.receiveNotifications ? 'Penerima Aktif' : 'Nonaktif' }}
							</UBadge>
						</div>
					</template>

					<div class="space-y-5">
						<!-- Notice Banner -->
						<div
							class="p-3 rounded-lg bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-800/50 text-xs text-primary-900 dark:text-primary-200 space-y-1.5"
						>
							<div class="flex items-center gap-1.5 font-semibold">
								<UIcon
									name="i-heroicons-information-circle"
									class="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0"
								/>
								Pusat Notifikasi Seluruh Kegiatan Sistem
							</div>
							<p class="leading-relaxed text-gray-600 dark:text-gray-300">
								Email profil ini akan menjadi tujuan pengiriman laporan login,
								antrian, resep farmasi, billing, dan seluruh aktivitas
								operasional SIMPRS secara otomatis.
							</p>
						</div>

						<!-- Email Input -->
						<UFormGroup
							label="Alamat Email Utama Profil"
							required
							help="Email ini terhubung langsung ke notifikasi sistem"
						>
							<UInput
								v-model="form.email"
								type="email"
								placeholder="nama@sejahterasehat.co.id"
								icon="i-heroicons-envelope"
								class="font-medium"
							/>
						</UFormGroup>

						<!-- Notification Toggle -->
						<div class="pt-2 border-t dark:border-gray-800 space-y-3">
							<div class="flex items-center justify-between">
								<div>
									<span
										class="text-sm font-semibold text-gray-900 dark:text-white block"
									>
										Terima Semua Notifikasi
									</span>
									<span class="text-xs text-gray-500 dark:text-gray-400">
										Kirimkan salinan kegiatan sistem ke email di atas
									</span>
								</div>
								<UToggle v-model="form.receiveNotifications" size="md" />
							</div>

							<!-- Category badges -->
							<div class="pt-2 space-y-2">
								<span
									class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block"
								>
									Cakupan Kegiatan yang Diterima:
								</span>
								<div class="flex flex-wrap gap-1.5">
									<UBadge color="gray" variant="soft" size="xs"
										>🔑 Login & Security</UBadge
									>
									<UBadge color="gray" variant="soft" size="xs"
										>🏥 Antrian Poli</UBadge
									>
									<UBadge color="gray" variant="soft" size="xs"
										>💊 Resep Farmasi</UBadge
									>
									<UBadge color="gray" variant="soft" size="xs"
										>🛏️ Rawat Inap</UBadge
									>
									<UBadge color="gray" variant="soft" size="xs"
										>💳 Billing</UBadge
									>
									<UBadge color="gray" variant="soft" size="xs"
										>📢 System Alert</UBadge
									>
								</div>
							</div>
						</div>

						<!-- Quick Test Button -->
						<div class="pt-4 border-t dark:border-gray-800">
							<UButton
								icon="i-heroicons-paper-airplane"
								color="gray"
								variant="solid"
								block
								size="sm"
								:loading="isTestingEmail"
								@click="testNotificationToProfile"
							>
								Uji Coba Kirim ke Email Ini
							</UButton>
						</div>
					</div>
				</UCard>

				<!-- Card 4: Info Status Akun -->
				<UCard
					class="shadow-sm border-gray-200 dark:border-gray-800 text-xs space-y-2.5"
				>
					<div class="flex justify-between py-1 border-b dark:border-gray-800">
						<span class="text-gray-500">Status Akun:</span>
						<span
							class="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
							Aktif & Terverifikasi
						</span>
					</div>
					<div class="flex justify-between py-1 border-b dark:border-gray-800">
						<span class="text-gray-500">Terakhir Login:</span>
						<span class="font-medium text-gray-900 dark:text-white">
							{{ formatLastLogin(form.lastLogin) }}
						</span>
					</div>
					<div class="flex justify-between py-1">
						<span class="text-gray-500">ID Pengguna:</span>
						<span class="font-mono text-gray-600 dark:text-gray-400">
							{{ form._id ? form._id.slice(-8) : '-' }}
						</span>
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from 'vue';
	import { useAuth } from '#imports';
	import { useNotifications } from '~/composables/useNotifications';

	const { data: authData } = useAuth();
	const toast = useToast();
	const { fetchNotifications, fetchUnreadCount } = useNotifications();

	const isLoading = ref(true);
	const isSaving = ref(false);
	const isTestingEmail = ref(false);

	const form = ref({
		_id: '',
		name: '',
		email: '',
		phone: '',
		position: '',
		department: '',
		nip: '',
		role: 'admin',
		receiveNotifications: true,
		lastLogin: '',
	});

	const passwordForm = ref({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	const userInitials = computed(() => {
		if (form.value.name) {
			const parts = form.value.name.trim().split(/\s+/);
			if (parts.length >= 2) {
				return (parts[0][0] + parts[1][0]).toUpperCase();
			}
			return form.value.name.slice(0, 2).toUpperCase();
		}
		if (form.value.email) {
			return form.value.email.slice(0, 2).toUpperCase();
		}
		return 'EH';
	});

	const roleBadgeColor = computed(() => {
		switch (form.value.role) {
			case 'admin':
				return 'red';
			case 'doctor':
				return 'blue';
			case 'nurse':
				return 'emerald';
			case 'pharmacist':
				return 'purple';
			case 'billing':
				return 'amber';
			case 'receptionist':
				return 'teal';
			default:
				return 'gray';
		}
	});

	function formatLastLogin(dateStr?: string) {
		if (!dateStr) return 'Baru saja';
		try {
			return new Date(dateStr).toLocaleString('id-ID', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch {
			return dateStr;
		}
	}

	async function loadProfile() {
		isLoading.value = true;
		try {
			const res: any = await $fetch('/api/user/profile');
			const userData = res?.data || res;
			if (userData) {
				form.value = {
					_id: userData._id || userData.id || '',
					name: userData.name || '',
					email: userData.email || '',
					phone: userData.phone || '',
					position: userData.position || '',
					department: userData.department || '',
					nip: userData.nip || '',
					role: userData.role || 'admin',
					receiveNotifications: userData.receiveNotifications !== false,
					lastLogin: userData.lastLogin || '',
				};
			}
		} catch (err: any) {
			console.error('Failed to load profile:', err);
			// Fallback to session user
			if (authData.value?.user) {
				const u = authData.value.user as any;
				form.value.name = u.name || '';
				form.value.email = u.email || '';
				form.value.role = u.role || 'admin';
			}
		} finally {
			isLoading.value = false;
		}
	}

	async function saveProfile() {
		if (!form.value.email || !form.value.email.includes('@')) {
			toast.add({
				title: 'Email Tidak Valid',
				description: 'Mohon masukkan alamat email yang valid untuk notifikasi.',
				color: 'red',
				icon: 'i-heroicons-exclamation-triangle',
			});
			return;
		}

		if (!form.value.name) {
			toast.add({
				title: 'Nama Wajib Diisi',
				description: 'Mohon lengkapi nama akun Anda.',
				color: 'red',
				icon: 'i-heroicons-exclamation-triangle',
			});
			return;
		}

		if (passwordForm.value.newPassword) {
			if (!passwordForm.value.currentPassword) {
				toast.add({
					title: 'Kata Sandi Diperlukan',
					description:
						'Masukkan kata sandi saat ini untuk verifikasi keamanan.',
					color: 'red',
					icon: 'i-heroicons-lock-closed',
				});
				return;
			}
			if (
				passwordForm.value.newPassword !== passwordForm.value.confirmPassword
			) {
				toast.add({
					title: 'Kata Sandi Tidak Cocok',
					description:
						'Konfirmasi kata sandi baru tidak sama dengan kata sandi baru.',
					color: 'red',
					icon: 'i-heroicons-exclamation-circle',
				});
				return;
			}
			if (passwordForm.value.newPassword.length < 6) {
				toast.add({
					title: 'Kata Sandi Terlalu Pendek',
					description: 'Kata sandi baru minimal 6 karakter.',
					color: 'red',
					icon: 'i-heroicons-exclamation-circle',
				});
				return;
			}
		}

		isSaving.value = true;
		try {
			const payload: any = {
				name: form.value.name,
				email: form.value.email,
				phone: form.value.phone,
				position: form.value.position,
				department: form.value.department,
				nip: form.value.nip,
				receiveNotifications: form.value.receiveNotifications,
			};

			if (passwordForm.value.newPassword) {
				payload.currentPassword = passwordForm.value.currentPassword;
				payload.newPassword = passwordForm.value.newPassword;
			}

			const res: any = await $fetch('/api/user/profile', {
				method: 'PUT',
				body: payload,
			});

			toast.add({
				title: 'Profil Berhasil Disimpan',
				description: `Data profil dan alamat email penerima notifikasi (${form.value.email}) berhasil disinkronkan ke sistem.`,
				color: 'green',
				icon: 'i-heroicons-check-circle',
			});

			// Clear password fields
			passwordForm.value = {
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			};

			// Reload fresh profile
			await loadProfile();
		} catch (err: any) {
			console.error('Failed to save profile:', err);
			toast.add({
				title: 'Gagal Menyimpan Profil',
				description:
					err?.data?.message ||
					err?.message ||
					'Terjadi kesalahan saat menyimpan profil.',
				color: 'red',
				icon: 'i-heroicons-x-circle',
			});
		} finally {
			isSaving.value = false;
		}
	}

	async function testNotificationToProfile() {
		if (!form.value.email || !form.value.email.includes('@')) {
			toast.add({
				title: 'Email Tidak Valid',
				description:
					'Mohon isi email terlebih dahulu sebelum melakukan uji coba.',
				color: 'red',
			});
			return;
		}

		isTestingEmail.value = true;
		try {
			const res: any = await $fetch('/api/settings/test-notification', {
				method: 'POST',
				body: {
					email: form.value.email,
				},
			});

			await fetchNotifications();
			await fetchUnreadCount();

			toast.add({
				title: 'Uji Coba Berhasil Dikirim',
				description: `Notifikasi uji coba berhasil dikirimkan ke email profil ${form.value.email}. Silakan cek inbox Anda.`,
				color: 'green',
				icon: 'i-heroicons-paper-airplane',
			});
		} catch (err: any) {
			console.error('Test notification failed:', err);
			toast.add({
				title: 'Uji Coba Gagal',
				description:
					err?.data?.message ||
					err?.message ||
					'Gagal mengirimkan notifikasi uji coba.',
				color: 'red',
				icon: 'i-heroicons-exclamation-triangle',
			});
		} finally {
			isTestingEmail.value = false;
		}
	}

	onMounted(() => {
		loadProfile();
	});
</script>
