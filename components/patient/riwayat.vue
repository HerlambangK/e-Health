<template>
  <UAccordion multiple :items="items" :ui="{ wrapper: 'flex flex-col w-full' }">
    <template #default="{ item, index, open }">
      <UButton
        color="gray"
        variant="ghost"
        class="border-b border-gray-200 dark:border-gray-700"
        :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }"
      >
        <span class="truncate">{{ index + 1 }}. {{ item.label }}</span>

        <template #trailing>
          <UIcon
            name="i-heroicons-chevron-right-20-solid"
            class="w-5 h-5 ms-auto transform transition-transform duration-200"
            :class="[open && 'rotate-90']"
          />
        </template>
      </UButton>
    </template>
  </UAccordion>
</template>

<script setup>
const items = [
  {
    label: "Kaki terluka",
    content: "kesandung batu sakit katanya",
    slot: "1",
  },
  {
    label: "Batuk",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  },
  {
    label: "pilek",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  },
  {
    label: "pusing",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  },
];
</script>

<style></style>
