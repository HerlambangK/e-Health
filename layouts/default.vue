<template>
  <div class="h-full relative">
    <div class="hidden md:flex flex-col w-60 min-h-screen fixed inset-y-0 z-50">
      <!-- <ComponentSidebar /> -->
      <Sidebar />
    </div>
    <main class="md:ml-60 pb-3 flex-grow">
      <Navbar />
      <slot />
    </main>
  </div>
  <!-- <ProModal /> -->
</template>

<script setup lang="ts"></script>

<style scoped></style>
