<template>
  <UTable
    :rows="antrian"
    :columns="[
      { key: 'nomorAntrian', label: 'No.' },
      { key: 'pasien', label: 'Pasien' },
      { key: 'status', label: 'Status' },
      { key: 'aksi', label: 'Aksi' },
    ]"
  >
    <template #pasien-data="{ row }">
      <div>
        <div class="font-medium">{{ row.pasienId?.nama }}</div>
        <div class="text-xs text-gray-400">{{ row.pasienId?.noRM }}</div>
      </div>
    </template>
    <template #status-data="{ row }">
      <UBadge :color="statusColor(row.status)" :label="statusLabel(row.status)" />
    </template>
    <template #aksi-data="{ row }">
      <UButton v-if="row.status === 'waiting'" size="xs" @click="$emit('panggil', row._id)">Panggil</UButton>
      <UButton v-else-if="row.status === 'called'" size="xs" color="green" @click="$emit('mulai', row)">Mulai</UButton>
    </template>
  </UTable>
</template>

<script setup lang="ts">
defineProps<{
  antrian: any[];
}>();

defineEmits<{
  panggil: [id: string];
  mulai: [antrian: any];
}>();

function statusColor(status: string) {
  const map: Record<string, string> = { waiting: "yellow", called: "blue", in_room: "green", done: "gray", skip: "red" };
  return map[status] || "gray";
}

function statusLabel(status: string) {
  const map: Record<string, string> = { waiting: "Menunggu", called: "Dipanggil", in_room: "Di Ruang", done: "Selesai", skip: "Lewat" };
  return map[status] || status;
}
</script>
