<template>
  <div class="p-6">
    <div class="flex items-center gap-4 mb-6">
      <UButton icon="i-heroicons-arrow-left" variant="ghost" @click="navigateTo('/poli')" />
      <div>
        <h1 class="text-2xl font-bold">{{ poli?.nama }}</h1>
        <p class="text-sm text-gray-500">{{ antrianList.length }} pasien menunggu</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <UCard>
          <template #header><h2 class="font-semibold">Daftar Antrian</h2></template>
          <UTable
            :rows="antrianList"
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
              <UBadge :color="statusColor(row.status)" :label="row.status" />
            </template>
            <template #aksi-data="{ row }">
              <UButton v-if="row.status === 'waiting'" size="xs" @click="panggil(row._id)">Panggil</UButton>
              <UButton v-if="row.status === 'called'" size="xs" color="green" @click="mulai(row)">Mulai</UButton>
            </template>
          </UTable>
        </UCard>
      </div>

      <div>
        <UCard>
          <template #header><h2 class="font-semibold">Display</h2></template>
          <div class="text-center space-y-4">
            <div v-for="item in displayAntrian" :key="item._id" class="p-4 bg-blue-50 rounded-lg">
              <div class="text-3xl font-bold">{{ item.nomorAntrian }}</div>
              <div class="text-sm">{{ item.pasienId?.nama }}</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const poliId = route.params.poliId as string;
const poli = ref<any>(null);
const antrianList = ref<any[]>([]);
const displayAntrian = ref<any[]>([]);

function statusColor(status: string) {
  const map: Record<string, string> = { waiting: "yellow", called: "blue", in_room: "green", done: "gray", skip: "red" };
  return map[status] || "gray";
}

async function panggil(id: string) {
  await $fetch("/api/antrian/panggil", { method: "POST", body: { antrianId: id } });
  await loadData();
}

function mulai(antrian: any) {
  navigateTo(`/emr/${antrian.encounterId?._id || antrian.encounterId}`);
}

async function loadData() {
  antrianList.value = await $fetch("/api/antrian", { params: { poliId } });
  displayAntrian.value = await $fetch("/api/antrian/display", { params: { poliId } });
  poli.value = await $fetch(`/api/poli/${poliId}`);
}

onMounted(loadData);
</script>
