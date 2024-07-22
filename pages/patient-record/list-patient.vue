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
    <UTable
      v-model="selected"
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Loading...',
      }"
    >
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
definePageMeta({
  layout: "default",
  middleware: "auth",
});
const columns = [
  {
    key: "nama",
    label: "Name",
  },
  {
    key: "address",
    label: "Alamat",
  },
  {
    key: "notlp",
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
    key: "jenisAsuransi",
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
      click: () => development(),
    },
  ],
  [
    {
      label: "Archive",
      icon: "i-heroicons-archive-box-20-solid",
      click: () => development(),
    },
    {
      label: "Move",
      icon: "i-heroicons-arrow-right-circle-20-solid",
      click: () => development(),
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
    },
  ],
];
// const people = [
//   {
//     id: 1,
//     name: "Lindsay Walton",
//     alamat: "Front-end Developer",
//     notelp: "lindsay.walton@example.com",
//     dokter: "Dr bernad",
//     poli: "Penyakit dalam",
//     jenis: "BPJS",
//   },

//   {
//     id: 1,
//     name: "Lindsay Walton",
//     alamat: "Front-end Developer",
//     notelp: "lindsay.walton@example.com",
//     dokter: "Dr bernad",
//     poli: "Penyakit dalam",
//     jenis: "BPJS",
//   },

//   {
//     id: 1,
//     name: "Lindsay Walton",
//     alamat: "Front-end Developer",
//     notelp: "lindsay.walton@example.com",
//     dokter: "Dr bernad",
//     poli: "Penyakit dalam",
//     jenis: "BPJS",
//   },
// ];
const q = ref("");
const selected = ref([]);
const pasienList = ref([]);
const loading = ref(true);

const development = () => {
  useToast().add({
    color: "blue",
    icon: "i-heroicons-exclamation-triangle-20-solid",
    position: "top-1 bottom-auto",
    title: "Development",
    description: "This feature is under development.",
  });
};

const fetchPasienData = async () => {
  try {
    const response = await fetch("/api/pasien");
    const responseData = await response.json();

    if (response.status === 200) {
      // Assign data dari server ke variabel doctor
      pasienList.value = responseData.body;
      console.log(pasienList.value);
      loading.value = false;
      console.log(loading.value);
    } else {
      console.error(
        "Error fetching pasien data. Status code:",
        response.status
      );
    }
  } catch (error) {
    console.error("Error parsing doctor data:", error);
  }
};

onMounted(() => {
  fetchPasienData();
});

const filteredRows = computed(() => {
  if (!q.value) {
    return pasienList.value;
  }

  return pasienList.value.filter((pasien) => {
    return Object.values(pasien).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});
</script>

<style></style>
