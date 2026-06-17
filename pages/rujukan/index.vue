<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Rujukan</h1>
      <UButton @click="navigateTo('/rujukan/buat')">Buat Rujukan</UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex gap-4">
          <USelect v-model="filterTipe" :options="['', 'masuk', 'keluar', 'internal']" placeholder="Semua Tipe" />
          <USelect v-model="filterStatus" :options="['', 'active', 'completed', 'cancelled']" placeholder="Semua Status" />
        </div>
      </template>

      <UTable
        :rows="rujukanList"
        :columns="[
          { key: 'noRujukan', label: 'No.' },
          { key: 'pasien', label: 'Pasien' },
          { key: 'tipe', label: 'Tipe' },
          { key: 'dari', label: 'Dari' },
          { key: 'tujuan', label: 'Tujuan' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'status', label: 'Status' },
        ]"
      >
        <template #pasien-data="{ row }">{{ row.pasienId?.nama }}</template>
        <template #dari-data="{ row }">{{ row.dariFaskes || row.dariDokter || "-" }}</template>
        <template #tujuan-data="{ row }">{{ row.tujuanFaskes || row.poliTujuan?.nama || "-" }}</template>
        <template #status-data="{ row }">
          <UBadge :color="row.status === 'active' ? 'green' : 'gray'" :label="row.status" />
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const filterTipe = ref("");
const filterStatus = ref("");
const rujukanList = ref<any[]>([]);

async function loadData() {
  const res = await $fetch<{ data: any[] }>("/api/rujukan", {
    params: {
      ...(filterTipe.value ? { tipe: filterTipe.value } : {}),
      ...(filterStatus.value ? { status: filterStatus.value } : {}),
    },
  });
  rujukanList.value = res.data || [];
}

watch([filterTipe, filterStatus], loadData);
onMounted(loadData);
</script>
