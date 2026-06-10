<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Pendaftaran Pasien</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="font-semibold">Pasien Baru</h2>
              <UButton icon="i-heroicons-plus" @click="showForm = true">Tambah Pasien</UButton>
            </div>
          </template>

          <UInput
            v-model="searchQuery"
            placeholder="Cari pasien (NIK, Nama, No. RM)..."
            icon="i-heroicons-magnifying-glass"
            class="mb-4"
          />

          <UTable
            :rows="filteredPatients"
            :columns="[
              { key: 'noRM', label: 'No. RM' },
              { key: 'nama', label: 'Nama' },
              { key: 'nik', label: 'NIK' },
            ]"
            @select="selectPatient"
          >
            <template #empty>
              <div class="text-center py-4 text-gray-400">Tidak ada data pasien</div>
            </template>
          </UTable>
        </UCard>

        <UCard class="mt-6">
          <template #header>
            <h2 class="font-semibold">Daftar Pasien Hari Ini</h2>
          </template>
          <UTable
            :rows="todayEncounters"
            :columns="[
              { key: 'noEncounter', label: 'No.' },
              { key: 'pasien', label: 'Pasien' },
              { key: 'poli', label: 'Poli' },
              { key: 'status', label: 'Status' },
            ]"
          />
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref("");
const showForm = ref(false);
const pasienList = ref<any[]>([]);
const todayEncounters = ref<any[]>([]);

const filteredPatients = computed(() => {
  if (!searchQuery.value) return pasienList.value;
  const q = searchQuery.value.toLowerCase();
  return pasienList.value.filter(
    (p) =>
      p.nama?.toLowerCase().includes(q) ||
      p.nik?.includes(q) ||
      p.noRM?.includes(q)
  );
});

onMounted(async () => {
  pasienList.value = await $fetch("/api/pasien");
});

function selectPatient(patient: any) {
  navigateTo(`/emr/${patient._id}`);
}
</script>
