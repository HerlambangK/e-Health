<template>
  <div>
    <NuxtLayout />
    <NuxtLoadingIndicator color="green" />
    <NuxtPage />
    <UNotifications />
  </div>
</template>

<style>
body {
  @apply bg-gray-100 dark:bg-gray-900;
}
</style>
