<template>
  <div class="text-center space-y-4">
    <div v-for="item in antrian" :key="item._id" class="p-4 rounded-lg" :class="bgClass(item.status)">
      <div class="text-3xl font-bold">{{ item.nomorAntrian }}</div>
      <div class="text-sm">{{ item.pasienId?.nama }}</div>
      <div class="text-xs text-gray-400">{{ item.poliId?.nama }}</div>
    </div>
    <p v-if="!antrian.length" class="text-gray-400 py-8">Tidak ada antrian</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  antrian: any[];
}>();

function bgClass(status: string) {
  const map: Record<string, string> = {
    waiting: "bg-yellow-50",
    called: "bg-blue-50",
    in_room: "bg-green-50",
  };
  return map[status] || "bg-gray-50";
}
</script>
