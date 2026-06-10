<template>
  <div class="grid grid-cols-4 gap-2">
    <div
      v-for="bed in beds"
      :key="bed._id"
      class="p-3 rounded-lg text-center cursor-pointer text-sm border"
      :class="bedClass(bed.status)"
      @click="$emit('select', bed)"
    >
      <div class="font-medium">{{ bed.nama }}</div>
      <div class="text-xs text-gray-500">{{ bed.ruang }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  beds: any[];
}>();

defineEmits<{
  select: [bed: any];
}>();

function bedClass(status: string) {
  const map: Record<string, string> = {
    available: "bg-green-100 border-green-300 hover:bg-green-200",
    occupied: "bg-red-100 border-red-300",
    maintenance: "bg-yellow-100 border-yellow-300",
    reserved: "bg-blue-100 border-blue-300",
  };
  return map[status] || "bg-gray-100";
}
</script>
