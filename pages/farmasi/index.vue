<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Farmasi</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="font-semibold">Antrian Resep</h2>
              <UButton @click="navigateTo('/farmasi/dispensing')">Dispensing</UButton>
            </div>
          </template>

          <UTable
            :rows="resepList"
            :columns="[
              { key: 'noResep', label: 'No. Resep' },
              { key: 'pasien', label: 'Pasien' },
              { key: 'dokter', label: 'Dokter' },
              { key: 'itemCount', label: 'Item' },
              { key: 'status', label: 'Status' },
              { key: 'aksi', label: 'Aksi' },
            ]"
          >
            <template #pasien-data="{ row }">
              {{ row.pasienId?.nama }}
            </template>
            <template #dokter-data="{ row }">
              {{ row.dokterId?.namaDokter }}
            </template>
            <template #itemCount-data="{ row }">
              {{ row.items?.length }}
            </template>
            <template #status-data="{ row }">
              <UBadge :color="row.status === 'dispensed' ? 'green' : 'yellow'" :label="row.status" />
            </template>
            <template #aksi-data="{ row }">
              <UButton v-if="row.status !== 'dispensed'" size="xs" color="green" @click="navigateTo(`/farmasi/dispensing?resepId=${row._id}`)">Dispense</UButton>
            </template>
          </UTable>
        </UCard>
      </div>

      <div>
        <UCard>
          <template #header><h2 class="font-semibold">Statistik</h2></template>
          <div class="space-y-4">
            <div class="p-4 bg-yellow-50 rounded-lg text-center">
              <div class="text-2xl font-bold">{{ resepList.length }}</div>
              <div class="text-sm text-gray-600">Resep Menunggu</div>
            </div>
            <div class="p-4 bg-green-50 rounded-lg text-center">
              <div class="text-2xl font-bold">{{ resepList.filter(r => r.status === 'dispensed').length }}</div>
              <div class="text-sm text-gray-600">Sudah Dispense</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const resepList = ref<any[]>([]);

onMounted(async () => {
  resepList.value = await $fetch("/api/resep/antrian-farmasi");
});
</script>
