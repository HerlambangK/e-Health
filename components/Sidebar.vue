<template>
	<div
		class="sidebar transition-all duration-300 ease-in-out"
		:class="{ 'is-collapsed': isCollapsed }"
	>
		<!-- Header / Logo Card -->
		<header class="logo-card">
			<!-- Expanded State -->
			<template v-if="!isCollapsed">
				<NuxtLink
					:to="brandDestination"
					class="logo-link group"
					aria-label="e-Health dashboard"
					@click="$emit('close')"
				>
					<img
						src="/img/logo.png"
						alt="e-Health"
						class="h-8 w-auto max-w-[130px] object-contain transition-transform duration-200 group-hover:scale-105"
					/>
				</NuxtLink>
				<UTooltip text="Ciutkan menu" :popper="{ placement: 'bottom' }">
					<UButton
						icon="i-heroicons-chevron-double-left"
						@click="$emit('toggle-collapse')"
						square
						color="gray"
						variant="ghost"
						size="xs"
						class="toggle-btn"
						aria-label="Ciutkan sidebar"
					/>
				</UTooltip>
			</template>

			<!-- Collapsed State -->
			<template v-else>
				<UTooltip text="e-Health SIMPRS" :popper="{ placement: 'right' }">
					<NuxtLink
						:to="brandDestination"
						class="logo-link--compact group"
						aria-label="e-Health dashboard"
						@click="$emit('close')"
					>
						<img
							src="/img/logo.png"
							alt="e-Health"
							class="h-7 w-7 object-contain transition-transform duration-200 group-hover:scale-110"
						/>
					</NuxtLink>
				</UTooltip>
				<UTooltip text="Perluas menu" :popper="{ placement: 'right' }">
					<UButton
						icon="i-heroicons-chevron-double-right"
						@click="$emit('toggle-collapse')"
						square
						color="gray"
						variant="ghost"
						size="xs"
						class="toggle-btn"
						aria-label="Perluas sidebar"
					/>
				</UTooltip>
			</template>
		</header>

		<!-- Navigation Menu -->
		<nav class="menu">
			<ul role="list" class="menu-list">
				<li class="flex-1 overflow-y-auto overflow-x-hidden pr-0.5 space-y-1">
					<div
						v-for="item in navigation"
						:key="item.name"
						class="nav-item-wrapper"
					>
						<!-- Collapsed Navigation Item with Tooltip -->
						<UTooltip
							v-if="isCollapsed"
							:text="item.name"
							:popper="{ placement: 'right', offsetDistance: 12 }"
							class="w-full flex justify-center"
						>
							<NuxtLink
								:to="item.href"
								class="navlink-collapsed"
								:class="{
									'navlink-collapsed--active': isItemActive(item.href),
								}"
								:aria-label="item.name"
								@click="$emit('close')"
							>
								<Icon
									:name="item.icon"
									class="navlink-icon"
									aria-hidden="true"
								/>
							</NuxtLink>
						</UTooltip>

						<!-- Expanded Navigation Item -->
						<NuxtLink
							v-else
							:to="item.href"
							class="navlink-expanded group"
							:class="{ 'navlink-expanded--active': isItemActive(item.href) }"
							@click="$emit('close')"
						>
							<div class="flex items-center gap-3 min-w-0">
								<Icon
									:name="item.icon"
									class="navlink-icon"
									aria-hidden="true"
								/>
								<span class="navlink-text truncate">{{ item.name }}</span>
							</div>
							<span
								v-if="isItemActive(item.href)"
								class="w-1.5 h-4 rounded-full bg-primary-500 dark:bg-primary-400 shrink-0"
							/>
						</NuxtLink>
					</div>
				</li>

				<!-- User Profile Section at Bottom -->
				<li class="user-settings">
					<!-- Collapsed User Avatar with Tooltip & Dropdown -->
					<UDropdown
						v-if="isCollapsed"
						:items="userSettings"
						:ui="{ width: 'w-60' }"
						:popper="{ placement: 'right-end', offsetDistance: 14 }"
						class="w-full flex justify-center"
					>
						<UTooltip
							:text="`${userEmail || 'Pengguna'} (${roleBadge.label})`"
							:popper="{ placement: 'right' }"
						>
							<button
								type="button"
								class="user-btn-collapsed group"
								aria-label="Menu Pengguna"
							>
								<UAvatar
									:text="initials"
									size="sm"
									class="ring-2 ring-primary-500/30 dark:ring-primary-400/30 transition-transform group-hover:scale-105"
								/>
							</button>
						</UTooltip>

						<template #header>
							<div
								class="px-3 py-2 text-left border-b border-gray-100 dark:border-gray-800"
							>
								<p class="text-[11px] text-gray-500 dark:text-gray-400">
									Signed in as
								</p>
								<p
									class="text-xs font-semibold text-gray-900 dark:text-white truncate"
								>
									{{ userEmail }}
								</p>
								<div class="mt-1.5 flex items-center gap-1.5">
									<span
										class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
										:class="roleBadge.bg"
									>
										{{ roleBadge.label }}
									</span>
									<span
										class="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium"
									>
										<span
											class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
										></span>
										Online
									</span>
								</div>
							</div>
						</template>
					</UDropdown>

					<!-- Expanded User Profile Button with Dropdown -->
					<UDropdown
						v-else
						:items="userSettings"
						:ui="{ width: 'w-60' }"
						:popper="{ placement: 'top-start', offsetDistance: 8 }"
						class="w-full"
					>
						<button
							type="button"
							class="user-btn-expanded group"
							aria-label="Menu Pengguna"
						>
							<div class="flex items-center gap-2.5 min-w-0">
								<UAvatar
									:text="initials"
									size="sm"
									class="ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
								/>
								<div class="flex flex-col min-w-0 text-left">
									<span
										class="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate"
									>
										{{ userName }}
									</span>
									<div class="flex items-center gap-1 mt-0.5">
										<span
											class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border"
											:class="roleBadge.bg"
										>
											{{ roleBadge.label }}
										</span>
									</div>
								</div>
							</div>
							<Icon
								name="heroicons:ellipsis-vertical"
								class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 shrink-0"
							/>
						</button>

						<template #header>
							<div
								class="px-3 py-2 text-left border-b border-gray-100 dark:border-gray-800"
							>
								<p class="text-[11px] text-gray-500 dark:text-gray-400">
									Signed in as
								</p>
								<p
									class="text-xs font-semibold text-gray-900 dark:text-white truncate"
								>
									{{ userEmail }}
								</p>
								<div class="mt-1.5 flex items-center gap-1.5">
									<span
										class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
										:class="roleBadge.bg"
									>
										{{ roleBadge.label }}
									</span>
									<span
										class="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium"
									>
										<span
											class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
										></span>
										Online
									</span>
								</div>
							</div>
						</template>
					</UDropdown>
				</li>
			</ul>
		</nav>
	</div>
</template>

<script setup lang="ts">
	import { accountNavigationLinks } from '~/utils';
	import { normalizeRole } from '~/utils/permissions';

	const { data, signOut } = useAuth();
	const route = useRoute();

	interface Props {
		closeButton?: boolean;
		isCollapsed?: boolean;
	}
	withDefaults(defineProps<Props>(), {
		closeButton: false,
		isCollapsed: false,
	});

	const emit = defineEmits<{
		(e: 'toggle-collapse'): void;
		(e: 'close'): void;
	}>();

	const userRole = computed(() => normalizeRole(data.value?.user?.role));

	const brandDestination = computed(() => {
		return userRole.value === 'admin' ? '/admin' : '/dashboard';
	});

	const navigation = computed(() =>
		accountNavigationLinks.filter((item: any) => {
			if (!item.roles || !Array.isArray(item.roles)) return true;
			return item.roles.includes(userRole.value);
		}),
	);

	const userEmail = computed(() => data.value?.user?.email || '');

	const userName = computed(() => {
		const user = data.value?.user as any;
		if (user?.name) return user.name;
		if (userEmail.value) {
			const prefix = userEmail.value.split('@')[0];
			return prefix.charAt(0).toUpperCase() + prefix.slice(1);
		}
		return 'Pengguna';
	});

	const initials = computed(() => {
		const user = data.value?.user as any;
		if (user?.name) {
			const parts = user.name.trim().split(/\s+/);
			if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
			return parts[0].slice(0, 2).toUpperCase();
		}
		if (userEmail.value) {
			return userEmail.value.slice(0, 2).toUpperCase();
		}
		return 'EH';
	});

	const roleBadge = computed(() => {
		const role = userRole.value;
		switch (role) {
			case 'admin':
				return {
					label: 'Admin',
					bg: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800/50',
				};
			case 'doctor':
				return {
					label: 'Dokter',
					bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
				};
			case 'nurse':
				return {
					label: 'Perawat',
					bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
				};
			case 'pharmacist':
				return {
					label: 'Apoteker',
					bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
				};
			case 'receptionist':
				return {
					label: 'Resepsionis',
					bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
				};
			case 'billing':
				return {
					label: 'Billing',
					bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50',
				};
			default:
				return {
					label: 'Pasien',
					bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
				};
		}
	});

	function isItemActive(href: string): boolean {
		if (!href) return false;
		if (route.path === href) return true;
		if (href === '/patient-record') {
			return (
				route.path === '/patient-record' ||
				route.path.startsWith('/patient-record/rekam-medis')
			);
		}
		if (href === '/admin') {
			return route.path === '/admin';
		}
		if (href === '/pendaftaran') {
			return (
				route.path === '/pendaftaran' &&
				!route.path.startsWith('/pendaftaran/antrian')
			);
		}
		if (href !== '/' && href !== '/dashboard' && href !== '/admin') {
			return route.path.startsWith(href + '/');
		}
		return false;
	}

	const userSettings = computed(() => [
		[
			{
				label: 'Signed in',
				slot: 'header',
				disabled: true,
			},
		],
		[
			{
				label: 'Profil Akun',
				icon: 'i-heroicons-user-circle',
				to: '/profile',
				click: () => emit('close'),
			},
			...(data.value?.user?.role === 'admin'
				? [
						{
							label: 'Pengaturan Notifikasi',
							icon: 'i-heroicons-cog-6-tooth',
							to: '/settings',
							click: () => emit('close'),
						},
					]
				: []),
			...(data.value?.user?.role === 'patient' ||
			data.value?.user?.role === 'admin' ||
			data.value?.user?.role === 'billing'
				? [
						{
							label: 'Billing & Tagihan',
							icon: 'i-heroicons-credit-card',
							to: '/patient-record/billing',
							click: () => emit('close'),
						},
					]
				: []),
		],
		[
			{
				label: 'Sign out',
				icon: 'i-heroicons-arrow-left-on-rectangle',
				click: () => signOut({ callbackUrl: '/auth/signin' }),
			},
		],
	]);
</script>

<style scoped>
	.sidebar {
		@apply flex h-full flex-col gap-y-3 overflow-x-hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 select-none;
		scrollbar-width: thin;
		scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
	}

	.sidebar.is-collapsed {
		@apply px-2 py-3;
	}

	/* Header Logo Card */
	.logo-card {
		@apply flex shrink-0 items-center justify-between gap-2 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-gray-50/90 dark:bg-gray-900/70 p-2 transition-all duration-200;
	}

	.is-collapsed .logo-card {
		@apply flex-col justify-center gap-1.5 p-1.5;
	}

	.logo-link {
		@apply flex items-center min-w-0;
	}

	.logo-link--compact {
		@apply flex items-center justify-center p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/60 transition-colors;
	}

	.toggle-btn {
		@apply shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200;
	}

	/* Navigation */
	.menu {
		@apply flex flex-1 flex-col min-h-0;
	}

	.menu-list {
		@apply flex flex-1 flex-col justify-between h-full;
	}

	.nav-item-wrapper {
		@apply w-full;
	}

	/* Collapsed Navlink */
	.navlink-collapsed {
		@apply flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800/80 dark:hover:text-white;
	}

	.navlink-collapsed--active {
		@apply bg-primary-50 text-primary-600 dark:bg-primary-950/70 dark:text-primary-300 font-semibold shadow-sm ring-1 ring-primary-500/25;
	}

	/* Expanded Navlink */
	.navlink-expanded {
		@apply flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800/80 dark:hover:text-white;
	}

	.navlink-expanded--active {
		@apply bg-primary-50 text-primary-700 dark:bg-primary-950/70 dark:text-primary-300 font-semibold shadow-sm border border-primary-100/80 dark:border-primary-800/40;
	}

	.navlink-icon {
		@apply h-5 w-5 shrink-0 transition-transform duration-150;
	}

	.navlink-expanded:hover .navlink-icon,
	.navlink-collapsed:hover .navlink-icon {
		@apply scale-110;
	}

	.navlink-text {
		@apply text-sm leading-5;
	}

	/* User Settings Footer */
	.user-settings {
		@apply mt-auto pt-3 border-t border-gray-200/80 dark:border-gray-800/80;
	}

	.is-collapsed .user-settings {
		@apply pt-2;
	}

	.user-btn-collapsed {
		@apply flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800/80;
	}

	.user-btn-expanded {
		@apply flex w-full items-center justify-between gap-2 rounded-xl p-2 transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800/80;
	}
</style>
