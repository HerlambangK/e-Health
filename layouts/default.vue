<template>
	<div
		class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col relative"
	>
		<!-- Desktop Sidebar -->
		<aside
			:class="[
				'hidden md:flex flex-col min-h-screen fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out',
				isCollapsed ? 'w-20' : 'w-64',
			]"
			aria-label="Sidebar Menu"
		>
			<Sidebar
				:is-collapsed="isCollapsed"
				@toggle-collapse="toggleSidebar"
			/>
		</aside>

		<!-- Main Content Area -->
		<div
			:class="[
				'min-h-screen flex flex-col flex-1 transition-all duration-300 ease-in-out',
				isCollapsed ? 'md:ml-20' : 'md:ml-64',
			]"
		>
			<Navbar />
			<main class="flex-1 p-3 md:p-5">
				<slot />
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
	const { isCollapsed, toggleSidebar } = useSidebar();
</script>

<style scoped></style>
