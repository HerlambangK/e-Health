<template>
	<UPopover :popper="{ placement: 'bottom-start' }">
		<UButton
			color="white"
			icon="i-heroicons-bars-3"
			size="sm"
			aria-label="Buka Menu Navigasi"
		/>

		<template #panel="{ close }">
			<div
				class="w-64 max-h-[80vh] overflow-y-auto p-2 space-y-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl"
			>
				<NuxtLink
					v-for="item in items"
					:key="item.name"
					:to="item.href"
					class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
					:class="[
						route.path === item.href
							? 'bg-primary-50 text-primary-700 dark:bg-primary-950/70 dark:text-primary-300 font-semibold'
							: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
					]"
					@click="close"
				>
					<Icon :name="item.icon" class="w-5 h-5 shrink-0" aria-hidden="true" />
					<span class="truncate">{{ item.name }}</span>
				</NuxtLink>
			</div>
		</template>
	</UPopover>
</template>

<script setup lang="ts">
	import { accountNavigationLinks } from '~/utils';
	import { normalizeRole } from '~/utils/permissions';

	const { data } = useAuth();
	const route = useRoute();
	const userRole = computed(() => normalizeRole(data.value?.user?.role));

	const items = computed(() =>
		accountNavigationLinks.filter((item: any) => {
			if (!item.roles || !Array.isArray(item.roles)) return true;
			return item.roles.includes(userRole.value);
		}),
	);
</script>

<style></style>
