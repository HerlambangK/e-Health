<template>
  <UButton
    color="white"
    variant="solid"
    size="xs"
    :icon="icon"
    @click="toggle"
  />
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const icon = computed(() =>
  isDark.value ? "i-heroicons-moon-20-solid" : "i-heroicons-sun-20-solid"
);
function toggle() {
  colorMode.preference = isDark.value ? "light" : "dark";
}
</script>
