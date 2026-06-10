<template>
  <div>
    <div v-for="log in logs" :key="log._id" class="flex items-center gap-3 py-2 border-b text-sm">
      <UBadge :color="statusColor(log.status)" :label="log.status" size="xs" />
      <span class="font-mono text-xs">{{ log.resource }}</span>
      <span class="text-gray-500">{{ log.action }}</span>
      <span v-if="log.errorMessage" class="text-red-500 text-xs truncate max-w-[200px]">{{ log.errorMessage }}</span>
      <span class="text-gray-400 text-xs ml-auto">{{ formatDate(log.createdAt) }}</span>
    </div>
    <p v-if="!logs.length" class="text-gray-400 text-center py-4">Belum ada log sinkronisasi</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  logs: any[];
}>();

function statusColor(status: string) {
  const map: Record<string, string> = { pending: "yellow", processing: "blue", success: "green", failed: "red" };
  return map[status] || "gray";
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("id-ID");
}
</script>
