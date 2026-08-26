<script lang="ts" setup>
	// import type { UserDocument } from "~/server/models/User";
	const { data, signOut } = useAuth();
	import { ref, onMounted } from 'vue';
	import dayjs from 'dayjs';
	import 'dayjs/locale/id';
	dayjs.locale('id');
	const currentDate = dayjs();
	function formatDate(date: dayjs.Dayjs) {
		// Format date to "dddd, DD MMMM YYYY"
		return date.format('dddd, DD MMMM YYYY');
	}
	const formattedCurrentDate = formatDate(currentDate);
	// const { showSubscriptionModal, accessPortal } = useSubscription();

	const currentTime = ref('');

	const { notifications, unreadCount, markAsRead, markAllAsRead } =
		useNotifications();
	const showNotifications = ref(false);

	function formatTimeAgo(dateStr: string) {
		const now = Date.now();
		const date = new Date(dateStr).getTime();
		const diff = now - date;
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return 'Baru saja';
		if (minutes < 60) return `${minutes} menit lalu`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours} jam lalu`;
		const days = Math.floor(hours / 24);
		return `${days} hari lalu`;
	}

	onMounted(() => {
		updateCurrentTime();
		setInterval(updateCurrentTime, 1000); // Perbarui setiap detik
	});

	function updateCurrentTime() {
		const now = new Date();
		currentTime.value = now.toLocaleTimeString();
	}
	const dropdownItems = computed(() => [
		[
			{
				label: 'Profile',
				slot: 'profile',
				disabled: true,
			},
		],
		[
			{
				label: 'Profil Akun & Notifikasi',
				icon: 'i-heroicons-user-circle',
				click: () => {
					useRouter().push('/profile');
				},
			},
			{
				label: 'Billing',
				icon: 'i-heroicons-credit-card',
				click: () => {
					useRouter().push('/patient-record/billing');
				},
			},
			...(data.value?.user?.role === 'admin'
				? [
						{
							label: 'Pengaturan',
							icon: 'i-heroicons-cog-6-tooth',
							click: () => {
								useRouter().push('/settings');
							},
						},
					]
				: []),
		],
		[
			{
				label: 'Sign out',
				icon: 'i-heroicons-arrow-left-on-rectangle',
				click: handleSignout,
			},
		],
	]);

	async function handleSignout() {
		await signOut();
	}
</script>
<template>
	<div>
		<header class="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
			<div>
				<div class="flex justify-between">
					<span class="hidden md:block font-semibold text-xm md:text-md">
						<!-- Senin, 12 Desember 2023  tanggal hari ini-->
						<p>{{ formattedCurrentDate }}</p>
					</span>
					<div class="md:hidden block">
						<AdminNavburger />
					</div>

					<div class="inline-flex justify-end gap-4 items-center">
						<slot name="actions"></slot>

						<UButton color="white" variant="solid" size="xs">
							{{ currentTime }}
						</UButton>
						<ColorSwitcher />

						<!-- Notification Bell -->
						<div class="relative">
							<UButton
								icon="i-heroicons-bell"
								variant="ghost"
								color="gray"
								size="sm"
								@click="showNotifications = !showNotifications"
								class="relative"
								aria-label="Notifikasi"
							>
								<template v-if="unreadCount > 0">
									<span
										class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800 animate-pulse"
									>
										{{ unreadCount > 99 ? '99+' : unreadCount }}
									</span>
								</template>
							</UButton>

							<!-- Backdrop to close popup on outside click -->
							<div
								v-if="showNotifications"
								class="fixed inset-0 z-40"
								@click="showNotifications = false"
							></div>

							<!-- Notification Dropdown Panel -->
							<div
								v-if="showNotifications"
								class="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 max-h-[30rem] flex flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 z-50 overflow-hidden"
							>
								<div
									class="flex items-center justify-between border-b px-4 py-3 bg-gray-50/70 dark:bg-gray-800/80 dark:border-gray-700"
								>
									<div class="flex items-center gap-2">
										<h3
											class="text-sm font-semibold text-gray-900 dark:text-white"
										>
											Notifikasi
										</h3>
										<UBadge
											v-if="unreadCount > 0"
											color="red"
											variant="subtle"
											size="xs"
											>{{ unreadCount }} Baru</UBadge
										>
									</div>
									<UButton
										v-if="unreadCount > 0"
										variant="link"
										size="xs"
										color="primary"
										@click="markAllAsRead"
										>Tandai semua dibaca</UButton
									>
								</div>
								<div class="overflow-y-auto flex-1 max-h-[22rem]">
									<div
										v-if="notifications.length === 0"
										class="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
									>
										<UIcon
											name="i-heroicons-bell-slash"
											class="w-8 h-8 mx-auto mb-2 text-gray-400"
										/>
										Belum ada notifikasi baru
									</div>
									<div v-else>
										<div
											v-for="notif in notifications"
											:key="notif._id"
											:class="[
												'flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition',
												!notif.isRead
													? 'bg-primary-50/40 dark:bg-primary-950/20'
													: '',
											]"
											@click="markAsRead(notif._id)"
										>
											<div class="flex-shrink-0 mt-0.5 text-lg">
												<span v-if="notif.type === 'queue_call'">📢</span>
												<span v-else-if="notif.type === 'prescription_ready'"
													>💊</span
												>
												<span v-else-if="notif.type === 'encounter_update'"
													>🏥</span
												>
												<span v-else-if="notif.type === 'admission'">🛏️</span>
												<span v-else-if="notif.type === 'discharge'">✅</span>
												<span v-else-if="notif.type === 'billing_update'"
													>💰</span
												>
												<span
													v-else-if="
														notif.type === 'login' ||
														notif.type === 'login_success'
													"
													>🔑</span
												>
												<span v-else-if="notif.type === 'login_failed'"
													>⚠️</span
												>
												<span v-else-if="notif.type === 'email_blast_complete'"
													>📧</span
												>
												<span v-else>🔔</span>
											</div>
											<div class="flex-1 min-w-0">
												<div class="flex items-center justify-between gap-1">
													<p
														class="text-xs font-semibold text-gray-900 dark:text-white truncate"
													>
														{{ notif.title }}
													</p>
													<span
														v-if="!notif.isRead"
														class="h-2 w-2 rounded-full bg-primary-500 shrink-0"
													></span>
												</div>
												<p
													class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5"
												>
													{{ notif.message }}
												</p>
												<p
													class="text-[11px] text-gray-400 dark:text-gray-500 mt-1"
												>
													{{ formatTimeAgo(notif.createdAt) }}
												</p>
											</div>
										</div>
									</div>
								</div>

								<div
									v-if="data?.user?.role === 'admin'"
									class="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-center"
								>
									<NuxtLink
										to="/settings"
										@click="showNotifications = false"
										class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-1"
									>
										<UIcon name="i-heroicons-cog-6-tooth" class="w-3.5 h-3.5" />
										Pengaturan Notifikasi & Email
									</NuxtLink>
								</div>
							</div>
						</div>

						<UDropdown :items="dropdownItems">
							<UIcon name="i-heroicons-user-circle" class="w-6 h-6" />

							<template #profile>
								<div class="text-left">
									<p>Signed in as</p>
									<p class="truncate font-medium text-gray-900 dark:text-white">
										{{ data?.user?.email ? data?.user?.email : 'none' }}
										<!-- herlambangk25@gmail.com -->
									</p>
									<span
										class="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300"
									>
										<span class="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
										Online
									</span>
								</div>
							</template>
						</UDropdown>
					</div>
				</div>
			</div>
		</header>

		<main v-if="$slots.default" class="my-4">
			<UContainer>
				<slot />
			</UContainer>
		</main>
	</div>
</template>

<style></style>
