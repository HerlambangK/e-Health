<template>
  <div
    class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div
      class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 justify-between items-center"
    >
      <h2 className="mr-2 text-2xl font-semibold tracking-tight">
        List Dokter
      </h2>

      <UInput v-model="q" placeholder="Filter doctor..." />
    </div>
    <UTable v-model="selected" :rows="filteredRows" :columns="columns">
      <!-- <template #name-data="{ row }">
        <span
          :class="[
            selected.find((doctor) => doctor.id === row.id) &&
              'text-primary-500 dark:text-primary-400',
          ]"
          >{{ row.name }}</span
        >
      </template> -->
      <template #kehadiran-data="{ row }">
        <UTooltip :text="row.jadwal" :popper="{ arrow: true }">
          <UBadge
            :label="row.kehadiran"
            variant="outline"
            :color="row.kehadiran === 'online' ? 'green' : 'red'"
            class="cursor-pointer"
          />
        </UTooltip>
      </template>
      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal-20-solid"
          />
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

<script setup>
const columns = [
  {
    key: "name",
    label: "Name",
  },

  {
    key: "spesialist",
    label: "Spesialist",
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
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => console.log("Edit", row.id),
    },
    {
      label: "Duplicate",
      icon: "i-heroicons-document-duplicate-20-solid",
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
const doctor = [
  {
    id: 1,
    name: "Lindsay Walton",
    spesialist: "Penyakit dalam",
    poli: "penyakit dalam",
    jadwal: "senin - rabu",
    kehadiran: "online",
  },
  {
    id: 1,
    name: "Lindsay Walton",
    spesialist: "Penyakit dalam",
    poli: "penyakit dalam",
    jadwal: "senin - rabu",
    kehadiran: "offline",
  },
  {
    id: 1,
    name: "Lindsay Walton",
    spesialist: "Penyakit dalam",
    poli: "penyakit dalam",
    jadwal: "senin - rabu",
    kehadiran: "offline",
  },
  {
    id: 1,
    name: "Lindsay Walton",
    spesialist: "Penyakit dalam",
    poli: "penyakit dalam",
    jadwal: "senin - rabu",
    kehadiran: "online",
  },
];
const q = ref("");
const selected = ref([]);

const filteredRows = computed(() => {
  if (!q.value) {
    return doctor;
  }

  return doctor.filter((doctor) => {
    return Object.values(doctor).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});
</script>

<style></style>
