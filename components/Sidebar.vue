<template>
  <div class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="header">
      <NuxtLink to="/dashboard" class="logo">
        <Logo v-if="!isCollapsed" class="h-auto w-24 m-4 p-4" role="img" />
        <Logo v-else class="h-auto w-8 m-2 p-2" role="img" />
      </NuxtLink>
      <UButton
        :icon="isCollapsed ? 'i-heroicons-chevron-double-right' : 'i-heroicons-chevron-double-left'"
        @click="$emit('toggle-collapse')"
        square
        color="white"
        variant="ghost"
        size="sm"
        class="toggle-btn"
      />
    </div>
    <nav class="menu">
      <ul role="list" class="menu-list">
        <li>
          <ul role="list" class="submenu">
            <li v-for="item in navigation" :key="item.name">
              <UTooltip
                v-if="isCollapsed"
                :text="item.name"
                :popper="{ placement: 'right' }"
              >
                <NuxtLink
                  @click="$emit('close')"
                  :to="item.href"
                  class="navlink group"
                >
                  <Icon
                    :name="item.icon"
                    class="navlink-icon"
                    aria-hidden="true"
                  />
                </NuxtLink>
              </UTooltip>
              <NuxtLink
                v-else
                @click="$emit('close')"
                :to="item.href"
                class="navlink group"
              >
                <Icon
                  :name="item.icon"
                  class="navlink-icon"
                  aria-hidden="true"
                />
                <span>{{ item.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </li>
        <li class="user-settings">
          <UDropdown
            :items="userSettings"
            class="user-settings-dropdown"
            :ui="{ width: 'w-[14rem]' }"
            :popper="{ placement: 'bottom-start' }"
          >
            <button class="user-settings-button">
              <div class="user-avatar">
                <UAvatar
                  src="https://randomuser.me/api/portraits/thumb/men/75.jpg"
                  alt="as"
                  :size="isCollapsed ? 'sm' : 'md'"
                />
              </div>
              <span v-if="!isCollapsed" class="user-name">
                {{ data?.user?.email ? data?.user?.email : "none" }}
              </span>
              <Icon
                v-if="!isCollapsed"
                name="heroicons:ellipsis-vertical"
                class="user-settings-icon"
              />
            </button>
          </UDropdown>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { accountNavigationLinks } from "~/utils";
import { normalizeRole } from "~/utils/permissions";

const { data, signOut } = useAuth();

interface Props {
  closeButton?: boolean;
  isCollapsed?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  closeButton: false,
  isCollapsed: false,
});

const emit = defineEmits<{
  (e: 'toggle-collapse'): void;
  (e: 'close'): void;
}>();

const route = useRoute();
// const selectedFilter = ref("all");

// const isAccountRoute = computed(
//   () =>
//     route.path === "/dashboard" ||
//     route.path === "/dashboard/" ||
//     route.path === "/dashboard/get-started" ||
//     route.path === "/dashboard/get-started/" ||
//     accountNavigationLinks.map((item) => item.href).includes(route.path)
// );

// const navigation = computed(() =>
//   isAccountRoute.value : accountNavigationLinks : accountNavigationLinks
// );
const userRole = computed(() => normalizeRole(data.value?.user?.role));
const navigation = computed(() =>
  accountNavigationLinks.filter((item: any) => {
    if (!item.roles || !Array.isArray(item.roles)) return true;
    return item.roles.includes(userRole.value);
  })
);

const userSettings = [
  [
    {
      label: "All Projects",
      icon: "i-heroicons-cog-6-tooth",
      to: "/dashboard/",
    },
    {
      label: "Billing & Invoices",
      icon: "i-heroicons-currency-rupee",
      to: "/dashboard/billing",
    },
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: () => signOut(),
      // click: props.clear,
    },
  ],
];
</script>

<style scoped>
.sidebar {
  @apply flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 px-4;
}

.sidebar.is-collapsed {
  @apply px-2;
}

.header {
  @apply flex h-14 shrink-0 items-center justify-between gap-1;
}

.is-collapsed .header {
  @apply flex-col h-auto gap-2 pt-2;
}

.logo {
  @apply flex items-center;
}

.is-collapsed .logo {
  @apply justify-center;
}

.toggle-btn {
  @apply shrink-0;
}

.is-collapsed .toggle-btn {
  @apply rotate-180;
}

.logo-icon {
  @apply h-6 w-auto;
}

.menu {
  @apply flex flex-1 flex-col;
}

.project-dropdown {
  @apply mb-8 w-full;
}

.project-button {
  @apply text-left p-1.5;
}

.project-name {
  @apply flex-grow text-sm;
}

.menu-list {
  @apply flex flex-1 flex-col gap-y-7;
}

.submenu {
  @apply space-y-1;
}

.navlink {
  @apply flex gap-x-3 items-center rounded-md px-2 py-1.5 text-sm leading-6 font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-100 hover:dark:bg-gray-800;
}

.is-collapsed .navlink {
  @apply justify-center px-0;
}

.navlink.router-link-exact-active {
  @apply bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white;
}

.navlink-icon {
  @apply h-5 w-5 shrink-0;
}

.filter-header {
  @apply text-xs font-semibold leading-6 text-gray-400;
}

.filter-list {
  @apply mt-2 space-y-1;
}

.filter-button {
  @apply flex items-center text-left gap-x-3 rounded-md py-1.5 px-2 text-sm font-semibold text-gray-700 dark:text-gray-400 hover:bg-gray-100 hover:dark:bg-gray-800 w-full;
}

.filter-button.selected {
  @apply bg-gray-100 dark:bg-gray-800;
}

.filter-icon {
  @apply h-2 w-2;
}

.filter-name {
  @apply flex-1;
}

.user-settings {
  @apply -mx-4 mt-auto relative;
}

.is-collapsed .user-settings {
  @apply -mx-2;
}

.user-settings-dropdown {
  @apply w-full;
}

.user-settings-button {
  @apply flex items-center w-full py-2.5 text-sm font-semibold leading-6 bg-gray-50 dark:bg-gray-950 dark:border-t border-gray-900 px-4;
}

.is-collapsed .user-settings-button {
  @apply justify-center px-2;
}

.user-avatar {
  @apply flex items-center gap-x-4;
}

.user-name {
  @apply flex-shrink-0 ml-2;
}

.user-settings-icon {
  @apply h-6 w-6 ml-auto -mr-2;
}
</style>
