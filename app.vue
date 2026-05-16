<template>
  <div>
    <div
      v-if="!isOnline"
      class="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      <UIcon name="i-heroicons-wifi-slash" class="h-4 w-4" />
      <span>Tidak ada koneksi internet. Beberapa fitur mungkin tidak dapat diakses.</span>
    </div>

    <NuxtLoadingIndicator color="green" />
    <!-- <NGlobalStyle /> -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const { isOnline } = useOffline();
</script>

<style>
body {
  @apply bg-gray-100 dark:bg-gray-900;
}
</style>
