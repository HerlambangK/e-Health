<template>
  <div
    class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div
      class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 justify-between items-center"
    >
      <h2 className="mr-2 text-2xl font-semibold tracking-tight">
        List Pasien
      </h2>

      <UInput v-model="q" placeholder="Filter people..." />
    </div>
    <UTable v-model="selected" :rows="filteredRows" :columns="columns">
      <template #name-data="{ row }">
        <span
          :class="[
            selected.find((person) => person.id === row.id) &&
              'text-primary-500 dark:text-primary-400',
          ]"
          >{{ row.name }}</span
        >
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
          <UButton label="Add people" />
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
    key: "alamat",
    label: "Alamat",
  },
  {
    key: "notelp",
    label: "No. Telp",
  },
  {
    key: "dokter",
    label: "Dokter",
  },
  {
    key: "poli",
    label: "Poli",
  },
  {
    key: "jenis",
    label: "Jenis",
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
const people = [
  {
    id: 1,
    name: "Lindsay Walton",
    alamat: "Front-end Developer",
    notelp: "lindsay.walton@example.com",
    dokter: "Dr bernad",
    poli: "Penyakit dalam",
    jenis: "BPJS",
  },

  {
    id: 1,
    name: "Lindsay Walton",
    alamat: "Front-end Developer",
    notelp: "lindsay.walton@example.com",
    dokter: "Dr bernad",
    poli: "Penyakit dalam",
    jenis: "BPJS",
  },

  {
    id: 1,
    name: "Lindsay Walton",
    alamat: "Front-end Developer",
    notelp: "lindsay.walton@example.com",
    dokter: "Dr bernad",
    poli: "Penyakit dalam",
    jenis: "BPJS",
  },
];
const q = ref("");
const selected = ref([]);

const filteredRows = computed(() => {
  if (!q.value) {
    return people;
  }

  return people.filter((person) => {
    return Object.values(person).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});
</script>

<style></style>
