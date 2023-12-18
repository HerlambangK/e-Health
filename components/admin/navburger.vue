<template>
  <UPopover>
    <UButton
      color="white"
      trailing-icon="i-heroicons-bars-3-20-solid"
      size="xs"
    />

    <template #panel>
      <div v-for="item in items" :key="item.name">
        <NuxtLink :to="item.href">
          <div class="p-2 text-sm text-slate-600 border-t">
            <Icon :name="item.icon" class="navlink-icon" aria-hidden="true" />

            <span class="ml-2"> {{ item.name }}</span>
          </div>
        </NuxtLink>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const items = computed(() => accountNavigationLinks);
</script>

<style></style>
