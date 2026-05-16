<template>
  <div class="h-full relative">
    <div
      :class="[
        'hidden md:flex flex-col min-h-screen fixed inset-y-0 z-50 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-60'
      ]"
    >
      <Sidebar :isCollapsed="isCollapsed" @toggle-collapse="isCollapsed = !isCollapsed" />
    </div>
    <main
      :class="[
        'pb-3 flex-grow px-3 bg-white transition-all duration-300',
        isCollapsed ? 'md:ml-16' : 'md:ml-60'
      ]"
    >
      <Navbar />
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const isCollapsed = ref(false);
</script>

<style scoped></style>
