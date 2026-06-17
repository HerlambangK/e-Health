<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Manajemen Antrian</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="font-semibold">Antrian Hari Ini</h2>
              <USelect v-model="selectedPoli" :options="poliList" option-attribute="nama" placeholder="Semua Poli" />
            </div>
          </template>

          <UTable
            :rows="antrianList"
            :columns="[
              { key: 'nomorAntrian', label: 'No.' },
              { key: 'pasien', label: 'Pasien' },
              { key: 'poli', label: 'Poli' },
              { key: 'dokter', label: 'Dokter' },
              { key: 'status', label: 'Status' },
              { key: 'aksi', label: 'Aksi' },
            ]"
          >
            <template #pasien-data="{ row }">
              {{ row.pasienId?.nama }}
            </template>
            <template #poli-data="{ row }">
              {{ row.poliId?.nama }}
            </template>
            <template #dokter-data="{ row }">
              {{ row.dokterId?.namaDokter || "-" }}
            </template>
            <template #status-data="{ row }">
              <UBadge :color="statusColor(row.status)" :label="row.status" />
            </template>
            <template #aksi-data="{ row }">
              <UButton
                v-if="row.status === 'waiting'"
                size="xs"
                @click="panggil(row._id)"
              >
                Panggil
              </UButton>
            </template>
          </UTable>
        </UCard>
      </div>

      <div>
        <UCard>
          <template #header><h2 class="font-semibold">Display Antrian</h2></template>
          <div class="text-center space-y-4">
            <div v-for="item in displayAntrian" :key="item._id" class="p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold">{{ item.nomorAntrian }}</div>
              <div class="text-sm text-gray-600">{{ item.pasienId?.nama }}</div>
              <div class="text-xs text-gray-400">{{ item.status }}</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectedPoli = ref(null);
const poliList = ref<any[]>([]);
const antrianList = ref<any[]>([]);
const displayAntrian = ref<any[]>([]);

function statusColor(status: string) {
  const map: Record<string, string> = {
    waiting: "yellow",
    called: "blue",
    in_room: "green",
    done: "gray",
    skip: "red",
  };
  return map[status] || "gray";
}

async function panggil(id: string) {
  await $fetch("/api/antrian/panggil", {
    method: "POST",
    body: { antrianId: id },
  });
  await loadAntrian();
}

async function loadAntrian() {
  const antrianRes = await $fetch<{ data: any[] }>("/api/antrian", {
    params: { poliId: selectedPoli.value || undefined },
  });
  antrianList.value = antrianRes.data || [];
  const displayRes = await $fetch<{ data: any[] }>("/api/antrian/display", {
    params: { poliId: selectedPoli.value || undefined },
  });
  displayAntrian.value = displayRes.data || [];
}

onMounted(async () => {
  const poliRes = await $fetch<{ data: any[] }>("/api/poli");
  poliList.value = poliRes.data || [];
  await loadAntrian();
});
</script>
