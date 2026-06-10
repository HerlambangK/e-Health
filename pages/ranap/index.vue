<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Rawat Inap</h1>
      <UButton @click="navigateTo('/ranap/admission')">Admisi Pasien</UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <UCard>
        <div class="text-center">
          <div class="text-3xl font-bold">{{ stats.total }}</div>
          <div class="text-sm text-gray-500">Total Bed</div>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ stats.tersedia }}</div>
          <div class="text-sm text-gray-500">Tersedia</div>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ stats.terisi }}</div>
          <div class="text-sm text-gray-500">Terisi</div>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <div class="text-3xl font-bold text-orange-600">{{ ranapAktif.length }}</div>
          <div class="text-sm text-gray-500">Pasien Aktif</div>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header><h2 class="font-semibold">Pasien Rawat Inap Aktif</h2></template>
      <UTable
        :rows="ranapAktif"
        :columns="[
          { key: 'noRanap', label: 'No.' },
          { key: 'pasien', label: 'Pasien' },
          { key: 'ruangan', label: 'Ruangan' },
          { key: 'noBed', label: 'Bed' },
          { key: 'dpjp', label: 'DPJP' },
          { key: 'los', label: 'LOS' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'aksi', label: 'Aksi' },
        ]"
      >
        <template #pasien-data="{ row }">
          {{ row.pasienId?.nama }}
        </template>
        <template #dpjp-data="{ row }">
          {{ row.dpjpId?.namaDokter }}
        </template>
        <template #los-data="{ row }">
          {{ row.losHari || "-" }} hr
        </template>
        <template #diagnosis-data="{ row }">
          <span class="font-mono text-xs">{{ row.diagnosisMasuk }}</span>
        </template>
        <template #aksi-data="{ row }">
          <UButton size="xs" variant="outline" @click="navigateTo(`/ranap/${row._id}`)">Detail</UButton>
          <UButton size="xs" color="orange" @click="discharge(row._id)">Discharge</UButton>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const ranapAktif = ref<any[]>([]);
const stats = reactive({ total: 0, tersedia: 0, terisi: 0 });

async function discharge(id: string) {
  if (confirm("Yakin akan discharge pasien ini?")) {
    await $fetch(`/api/ranap/discharge`, {
      method: "POST",
      body: { ranapId: id, kondisiKeluar: "membaik" },
    });
    await loadData();
  }
}

async function loadData() {
  ranapAktif.value = await $fetch("/api/ranap", { params: { status: "active" } });
  const bedData = await $fetch("/api/ranap/bed");
  stats.total = bedData.data.total;
  stats.tersedia = bedData.data.tersedia;
  stats.terisi = bedData.data.total - bedData.data.tersedia;
}

onMounted(loadData);
</script>
