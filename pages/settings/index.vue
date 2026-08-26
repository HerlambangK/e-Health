<template>
	<div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
		<!-- Header -->
		<div
			class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b dark:border-gray-800"
		>
			<div>
				<h1
					class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
				>
					<UIcon
						name="i-heroicons-cog-6-tooth"
						class="w-7 h-7 text-primary-500"
					/>
					Pengaturan Notifikasi & Email
				</h1>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
					Kelola penerima notifikasi otomatis (login, antrian, resep, rawat
					inap, dll.) dan uji coba pengiriman email.
				</p>
			</div>
			<div class="flex items-center gap-2">
				<UButton
					icon="i-heroicons-paper-airplane"
					color="primary"
					variant="solid"
					:loading="isTesting"
					@click="sendTestNotification"
				>
					Kirim Test Notifikasi
				</UButton>
			</div>
		</div>

		<!-- Top Grid: SMTP & Quick Stats -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- SMTP Config Info -->
			<UCard
				class="lg:col-span-2 shadow-sm border-gray-200 dark:border-gray-800"
			>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<UIcon
								name="i-heroicons-envelope"
								class="w-5 h-5 text-primary-500"
							/>
							<h2 class="text-base font-semibold text-gray-900 dark:text-white">
								Status SMTP Server (Pengirim)
							</h2>
						</div>
						<UBadge
							color="green"
							variant="subtle"
							size="sm"
							class="flex items-center gap-1"
						>
							<span
								class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
							></span>
							Aktif & Terkonfigurasi
						</UBadge>
					</div>
				</template>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
					<div
						class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50"
					>
						<p class="text-xs text-gray-500 dark:text-gray-400">Server Host</p>
						<p
							class="font-medium text-gray-900 dark:text-gray-100 mt-0.5 truncate"
						>
							{{ smtpConfig.host }}
						</p>
					</div>
					<div
						class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50"
					>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Email Pengirim (From)
						</p>
						<p
							class="font-medium text-gray-900 dark:text-gray-100 mt-0.5 truncate"
						>
							{{ smtpConfig.from }}
						</p>
					</div>
					<div
						class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50"
					>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Port & Enkripsi
						</p>
						<p class="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
							{{ smtpConfig.port }} (SSL/TLS)
						</p>
					</div>
				</div>
			</UCard>

			<!-- Quick Test Panel -->
			<UCard
				class="shadow-sm border-gray-200 dark:border-gray-800 flex flex-col justify-between"
			>
				<template #header>
					<div class="flex items-center gap-2">
						<UIcon name="i-heroicons-bolt" class="w-5 h-5 text-amber-500" />
						<h2 class="text-base font-semibold text-gray-900 dark:text-white">
							Uji Coba Cepat
						</h2>
					</div>
				</template>
				<div class="space-y-3">
					<UFormGroup
						label="Email Tujuan Spesifik (Opsional)"
						help="Kosongkan untuk mengirim ke semua email penerima aktif"
					>
						<UInput
							v-model="testEmail"
							placeholder="Contoh: admin@rs.com"
							icon="i-heroicons-at-symbol"
						/>
					</UFormGroup>
					<UButton
						block
						color="primary"
						variant="solid"
						icon="i-heroicons-paper-airplane"
						:loading="isTesting"
						@click="sendTestNotification"
					>
						Kirim Uji Coba Sekarang
					</UButton>
				</div>
			</UCard>
		</div>

		<!-- Email Recipients CRUD Table -->
		<UCard class="shadow-sm border-gray-200 dark:border-gray-800">
			<template #header>
				<div
					class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
				>
					<div>
						<h2
							class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
						>
							<UIcon
								name="i-heroicons-user-group"
								class="w-5 h-5 text-primary-500"
							/>
							Daftar Email Penerima Notifikasi Admin
						</h2>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
							Setiap kali ada login, panggilan antrian, atau update penting,
							notifikasi akan diteruskan ke email-email aktif berikut.
						</p>
					</div>
					<UButton
						icon="i-heroicons-plus"
						color="primary"
						size="sm"
						@click="openAddModal"
					>
						Tambah Email Penerima
					</UButton>
				</div>
			</template>

			<!-- Table -->
			<UTable
				:rows="emails"
				:columns="columns"
				:loading="pending"
				:empty-state="{
					icon: 'i-heroicons-inbox',
					label:
						'Belum ada email penerima. Klik Tambah Email Penerima untuk menambahkan.',
				}"
			>
				<template #name-data="{ row }">
					<div class="font-medium text-gray-900 dark:text-white">
						{{ row.name }}
					</div>
				</template>

				<template #email-data="{ row }">
					<span
						class="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded"
					>
						{{ row.email }}
					</span>
				</template>

				<template #notificationTypes-data="{ row }">
					<div class="flex flex-wrap gap-1 max-w-md">
						<UBadge
							v-for="type in row.notificationTypes"
							:key="type"
							:color="getTypeBadgeColor(type)"
							variant="soft"
							size="xs"
						>
							{{ getTypeLabel(type) }}
						</UBadge>
					</div>
				</template>

				<template #isActive-data="{ row }">
					<div class="flex items-center gap-2">
						<UToggle v-model="row.isActive" @change="toggleStatus(row)" />
						<span
							class="text-xs"
							:class="
								row.isActive
									? 'text-green-600 dark:text-green-400 font-medium'
									: 'text-gray-400'
							"
						>
							{{ row.isActive ? 'Aktif' : 'Nonaktif' }}
						</span>
					</div>
				</template>

				<template #actions-data="{ row }">
					<div class="flex items-center gap-1">
						<UTooltip text="Edit Pengaturan">
							<UButton
								icon="i-heroicons-pencil-square"
								size="xs"
								color="gray"
								variant="ghost"
								@click="openEditModal(row)"
							/>
						</UTooltip>
						<UTooltip text="Hapus Penerima">
							<UButton
								icon="i-heroicons-trash"
								size="xs"
								color="red"
								variant="ghost"
								@click="deleteEmail(row._id)"
							/>
						</UTooltip>
					</div>
				</template>
			</UTable>
		</UCard>

		<!-- Modal Add/Edit -->
		<UModal v-model="isModalOpen" :ui="{ width: 'sm:max-w-lg' }">
			<UCard
				:ui="{
					ring: '',
					divide: 'divide-y divide-gray-100 dark:divide-gray-800',
				}"
			>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-base font-semibold text-gray-900 dark:text-white">
							{{ isEditing ? 'Edit' : 'Tambah' }} Email Penerima Notifikasi
						</h3>
						<UButton
							color="gray"
							variant="ghost"
							icon="i-heroicons-x-mark-20-solid"
							class="-my-1"
							@click="isModalOpen = false"
						/>
					</div>
				</template>

				<form @submit.prevent="saveEmail" class="space-y-4 py-2">
					<UFormGroup
						label="Nama Label / Penerima"
						required
						help="Contoh: Admin Pendaftaran / Kepala Rekam Medis"
					>
						<UInput
							v-model="form.name"
							placeholder="Nama Label"
							icon="i-heroicons-user"
							required
						/>
					</UFormGroup>

					<UFormGroup
						label="Alamat Email"
						required
						help="Email yang akan menerima salinan notifikasi"
					>
						<UInput
							v-model="form.email"
							type="email"
							placeholder="contoh@rs.com"
							icon="i-heroicons-envelope"
							required
						/>
					</UFormGroup>

					<UFormGroup
						label="Tipe Notifikasi yang Diterima"
						help="Pilih Semua Notifikasi atau pilih tipe spesifik di bawah"
					>
						<div class="grid grid-cols-2 gap-2 pt-1">
							<div
								v-for="opt in notificationTypeOptions"
								:key="opt.value"
								class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition text-xs"
								@click="toggleTypeSelection(opt.value)"
							>
								<UCheckbox
									:model-value="form.notificationTypes.includes(opt.value)"
									@update:model-value="() => toggleTypeSelection(opt.value)"
								/>
								<span class="font-medium text-gray-700 dark:text-gray-300">{{
									opt.label
								}}</span>
							</div>
						</div>
					</UFormGroup>

					<UFormGroup label="Status Penerimaan">
						<div class="flex items-center gap-2">
							<UToggle v-model="form.isActive" />
							<span class="text-sm text-gray-700 dark:text-gray-300">
								{{
									form.isActive
										? 'Aktif menerima email'
										: 'Nonaktifkan sementara'
								}}
							</span>
						</div>
					</UFormGroup>

					<div
						class="flex justify-end gap-2 pt-4 border-t dark:border-gray-800"
					>
						<UButton color="gray" variant="ghost" @click="isModalOpen = false"
							>Batal</UButton
						>
						<UButton type="submit" color="primary" :loading="isSaving"
							>Simpan Data</UButton
						>
					</div>
				</form>
			</UCard>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue';

	const toast = useToast();

	const columns = [
		{ key: 'name', label: 'Nama / Label', sortable: true },
		{ key: 'email', label: 'Alamat Email', sortable: true },
		{ key: 'notificationTypes', label: 'Tipe Notifikasi yang Diterima' },
		{ key: 'isActive', label: 'Status' },
		{ key: 'actions', label: 'Aksi' },
	];

	const notificationTypeOptions = [
		{ value: 'Semua', label: '📢 Semua Notifikasi' },
		{ value: 'login_success', label: '🔑 Login Berhasil' },
		{ value: 'login_failed', label: '⚠️ Login Gagal / Ditolak' },
		{ value: 'queue_call', label: '🗣️ Antrian Dipanggil' },
		{ value: 'prescription_ready', label: '💊 Resep Siap' },
		{ value: 'encounter_update', label: '🏥 Kunjungan Diperbarui' },
		{ value: 'admission', label: '🛏️ Admisi Rawat Inap' },
		{ value: 'discharge', label: '✅ Discharge Pasien' },
		{ value: 'billing_update', label: '💰 Invoice & Tagihan' },
		{ value: 'email_blast_complete', label: '📧 Email Blast Selesai' },
		{ value: 'system', label: '⚙️ Sistem & Uji Coba' },
	];

	function getTypeLabel(typeVal: string) {
		if (typeVal === 'login') return '🔑 Login (Semua)';
		const found = notificationTypeOptions.find((o) => o.value === typeVal);
		return found ? found.label : typeVal;
	}

	function getTypeBadgeColor(typeVal: string) {
		if (typeVal === 'Semua' || typeVal === 'all') return 'primary';
		if (typeVal === 'login_success' || typeVal === 'login') return 'emerald';
		if (typeVal === 'login_failed') return 'red';
		if (typeVal === 'billing_update') return 'amber';
		if (typeVal === 'admission' || typeVal === 'discharge') return 'indigo';
		return 'gray';
	}

	// Fetch data
	const {
		data: response,
		pending,
		refresh,
	} = await useFetch<any>('/api/settings/notification-emails');

	const emails = computed(() => {
		if (Array.isArray(response.value?.data)) return response.value.data;
		if (Array.isArray(response.value?.data?.items))
			return response.value.data.items;
		return [];
	});

	// Modal state
	const isModalOpen = ref(false);
	const isEditing = ref(false);
	const isSaving = ref(false);
	const currentId = ref('');

	const form = ref({
		name: '',
		email: '',
		isActive: true,
		notificationTypes: ['Semua'],
	});

	function openAddModal() {
		isEditing.value = false;
		currentId.value = '';
		form.value = {
			name: '',
			email: '',
			isActive: true,
			notificationTypes: ['Semua'],
		};
		isModalOpen.value = true;
	}

	function openEditModal(row: any) {
		isEditing.value = true;
		currentId.value = row._id;
		form.value = {
			name: row.name || '',
			email: row.email || '',
			isActive: row.isActive !== false,
			notificationTypes: Array.isArray(row.notificationTypes)
				? [...row.notificationTypes]
				: ['Semua'],
		};
		isModalOpen.value = true;
	}

	function toggleTypeSelection(val: string) {
		if (val === 'Semua') {
			form.value.notificationTypes = ['Semua'];
			return;
		}

		// If selecting specific type, remove 'Semua'
		let current = form.value.notificationTypes.filter((t) => t !== 'Semua');
		if (current.includes(val)) {
			current = current.filter((t) => t !== val);
		} else {
			current.push(val);
		}

		if (current.length === 0) {
			current = ['Semua'];
		}
		form.value.notificationTypes = current;
	}

	async function saveEmail() {
		if (!form.value.name || !form.value.email) {
			toast.add({
				title: 'Validasi Gagal',
				description: 'Nama dan Email wajib diisi',
				color: 'red',
			});
			return;
		}

		isSaving.value = true;
		try {
			const url = isEditing.value
				? `/api/settings/notification-emails/${currentId.value}`
				: '/api/settings/notification-emails';

			const method = isEditing.value ? 'PUT' : 'POST';

			await $fetch(url, {
				method,
				body: form.value,
			});

			toast.add({
				title: isEditing.value ? 'Berhasil Diperbarui' : 'Berhasil Ditambahkan',
				description: `Email ${form.value.email} berhasil disimpan`,
				color: 'green',
			});
			isModalOpen.value = false;
			refresh();
		} catch (error: any) {
			toast.add({
				title: 'Gagal Menyimpan',
				description:
					error.data?.error?.message ||
					error.data?.message ||
					'Terjadi kesalahan sistem',
				color: 'red',
			});
		} finally {
			isSaving.value = false;
		}
	}

	async function toggleStatus(row: any) {
		try {
			await $fetch(`/api/settings/notification-emails/${row._id}`, {
				method: 'PUT',
				body: { isActive: row.isActive },
			});
			toast.add({
				title: 'Status Diperbarui',
				description: `Status ${row.email} kini ${row.isActive ? 'Aktif' : 'Nonaktif'}`,
				color: 'green',
			});
		} catch (error: any) {
			row.isActive = !row.isActive; // revert on fail
			toast.add({
				title: 'Gagal Mengubah Status',
				description: error.data?.error?.message || 'Gagal mengubah status',
				color: 'red',
			});
		}
	}

	async function deleteEmail(id: string) {
		if (!confirm('Yakin ingin menghapus email penerima notifikasi ini?'))
			return;

		try {
			await $fetch(`/api/settings/notification-emails/${id}`, {
				method: 'DELETE',
			});
			toast.add({
				title: 'Berhasil Dihapus',
				description: 'Data email telah dihapus',
				color: 'green',
			});
			refresh();
		} catch (error: any) {
			toast.add({
				title: 'Gagal Menghapus',
				description: error.data?.error?.message || 'Gagal menghapus data',
				color: 'red',
			});
		}
	}

	// Test Notification
	const testEmail = ref('');
	const isTesting = ref(false);

	async function sendTestNotification() {
		isTesting.value = true;
		try {
			const res = await $fetch<any>('/api/settings/test-notification', {
				method: 'POST',
				body: { email: testEmail.value || undefined },
			});
			toast.add({
				title: '🔔 Test Notifikasi Terkirim!',
				description:
					res.data?.message ||
					'Notifikasi WebSocket dan email percobaan berhasil dikirim ke server.',
				color: 'green',
				timeout: 6000,
			});
		} catch (error: any) {
			toast.add({
				title: 'Gagal Mengirim Test',
				description:
					error.data?.error?.message ||
					error.data?.message ||
					'Gagal mengirim test notifikasi',
				color: 'red',
			});
		} finally {
			isTesting.value = false;
		}
	}

	const smtpConfig = {
		host: 'smtp.gmail.com (Default Env)',
		from: 'Notifikasi e-Health (Env)',
		port: '587 / 465',
	};
</script>
