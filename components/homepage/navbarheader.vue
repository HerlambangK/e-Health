<template>
  <nav
    class="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600"
  >
    <div
      class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"
    >
      <a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <Logo class="w-12 h-12" />
      </a>
      <div class="hidden w-full md:block md:w-auto" id="navbar-default">
        <ul
          class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700"
        >
          <li v-for="item in link" :key="item.title">
            <a
              :href="item.link"
              class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 dark:text-white md:dark:hover:text-green-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              aria-current="page"
              >{{ item.title }}</a
            >
          </li>
        </ul>
      </div>
      <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <NuxtLink :to="user ? '/dashboard' : '/auth/signin'">
          <UButton href type="button"> Get started </UButton>
        </NuxtLink>
        <div class="block md:hidden">
          <UPopover :popper="{ arrow: true }">
            <UButton
              color="white"
              trailing-icon="i-heroicons-bars-3-20-solid"
              size="xs"
              :width="200"
            />

            <template #panel>
              <div v-for="item in link" :key="item.title">
                <NuxtLink :to="item.link">
                  <div class="p-2 text-sm text-slate-600 border-t w-[450px]">
                    <span class="ml-2"> {{ item.title }}</span>
                  </div>
                </NuxtLink>
              </div>
            </template>
          </UPopover>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const link = reactive([
  {
    title: "Home",
    link: "/",
  },
  {
    title: "About",
    link: "#about",
  },
  {
    title: "Services",
    link: "#service",
  },
  {
    title: "Contact",
    link: "#contact",
  },
]);
</script>

<style scoped></style>
