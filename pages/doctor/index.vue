<template>
  <div class="pb-10 flex-grow">
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 justify-between items-center">
      <h2 class="mr-2 text-2xl font-semibold tracking-tight">
        List Dokter
      </h2>

      <UInput v-model="q" placeholder="Filter doctor..." />
    </div>
    <!-- <div>
      {{ doctor }}
    </div> -->
    <UTable v-model="selected" :rows="filteredRows" :columns="columns" :loading="loading" :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Loading...',
      }">
      <template #namaDokter-data="{ row }">
        <span :class="[
        selected.find((doctor) => doctor._id === row._id) &&
        'text-primary-500 dark:text-primary-400',
      ]">{{ row.namaDokter }}</span>
      </template>
      <template #kehadiran-data="{ row }">
        <UTooltip :text="row.jadwal" :popper="{ arrow: true }">
          <UBadge :label="row.kehadiran" variant="outline" :color="row.kehadiran === 'online' ? 'green' : 'red'"
            class="cursor-pointer" />
        </UTooltip>
      </template>
      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </template>
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-6 gap-3">
          <span class="italic text-sm">No one here!</span>
          <UButton label="Add doctor" />
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth", "auth-middleware"],
});
// import * as XLSX from "xlsx";

const columns = [
  {
    key: "namaDokter",
    label: "Name",
  },
  {
    key: "nip",
    label: "NIP",
  },

  {
    key: "spesialisasi",
    label: "Spesialisasi",
  },
  {
    key: "poli",
    label: "Poli",
  },
  {
    key: "jadwal",
    label: "jadwal",
  },
  {
    key: "kehadiran",
    label: "kehadiran",
  },
  {
    key: "actions",
  },
];

const items = (row) => [
  [
    {
      label: "Details",
      icon: "i-heroicons-eye-20-solid",
      // click: () => route.push(`/patient-record/rekam-medis/1`),
      click: () => useRouter().push(`/patient-record`),
    },
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => console.log("Edit", row._id),
    },
    {
      label: "Print",
      icon: "i-heroicons-printer",
      click: () => exportToExcel(),
    },
  ],
  [
    {
      label: "Archive",
      icon: "i-heroicons-archive-box-20-solid",
    },
    {
      label: "Move",
      icon: "i-heroicons-arrow-right-circle-20-solid",
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
    },
  ],
];
// const doctor = [
//   {
//     id: 1,
//     name: "Lindsay Walton",
//     spesialist: "Penyakit dalam",
//     poli: "penyakit dalam",
//     jadwal: "senin - rabu",
//     kehadiran: "online",
//   },
//   {
//     id: 1,
//     name: "Lindsay Walton",
//     spesialist: "Penyakit dalam",
//     poli: "penyakit dalam",
//     jadwal: "senin - rabu",
//     kehadiran: "offline",
//   },
//   {
//     id: 1,
//     name: "Lindsay Walton",
//     spesialist: "Penyakit dalam",
//     poli: "penyakit dalam",
//     jadwal: "senin - rabu",
//     kehadiran: "offline",
//   },
//   {
//     id: 1,
//     name: "Lindsay Walton",
//     spesialist: "Penyakit dalam",
//     poli: "penyakit dalam",
//     jadwal: "senin - rabu",
//     kehadiran: "online",
//   },
// ];
const q = ref("");
const selected = ref([]);

const { data: doctorResponse, pending: loading } = await useLazyAsyncData(
  "doctor-list",
  () =>
    $fetch("/api/dokter", {
      query: {
        q: q.value || undefined,
        page: 1,
        pageSize: 50,
      },
    }),
  {
    default: () => ({ data: [] }),
    watch: [q],
  }
);

const filteredRows = computed(() => (doctorResponse.value as any)?.data ?? []);

const exportToExcel = () => {
  // const data = selected.value.map((row) => ({
  //   Name: row.namaDokter,
  //   NIP: row.nip,
  //   Spesialisasi: row.spesialisasi,
  //   Poli: row.poli,
  //   Jadwal: row.jadwal,
  //   Kehadiran: row.kehadiran,
  // }));
  // const ws = XLSX.utils.json_to_sheet(data);
  // const wb = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
  // XLSX.writeFile(wb, "your_document_doctor.xlsx");
};
</script>

<style></style>
