<template>
  <div
    class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div
      class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 justify-between items-center"
    >
      <h2 className="mr-2 text-2xl font-semibold tracking-tight">
        Rekam Medis
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
            selected.find((rekamMedis) => rekamMedis.id === row.id) &&
              'text-primary-500 dark:text-primary-400',
          ]"
          >{{ row.name }}</span
        >
      </template>

      <template #kontrolTerakhir-data="{ row }">
        <span>{{
          columns
            .find((column) => column.key === "kontrolTerakhir")
            .formattedDate(row)
        }}</span>
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
const dataTabel = [
  {
    key: "namaPasien",
    label: "Pasient",
  },
  {
    namaDokter: "dokter",
    label: "dokter",
  },
  {
    key: "poli",
    label: "poli",
  },
  {
    key: "keluhan",
    label: "keluhan",
  },
  {
    key: "kontrolTerakhir",
    label: "kontrol terakhir",
  },
  {
    key: "actions",
  },
];

const columns = dataTabel.map((item) => {
  if (item.key === "kontrolTerakhir") {
    return {
      ...item,
      formattedDate: (row) => formatTanggal(row[item.key]),
    };
  } else {
    return item;
  }
});

const items = (row) => [
  [
    {
      label: "Details",
      icon: "i-heroicons-eye-20-solid",
      // click: () => route.push(`/patient-record/rekam-medis/1`),
      click: () => useRouter().push(`/patient-record/rekam-medis/1`),
    },
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => console.log("Edit", row.id),
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

// Define reactive variables
const q = ref("");
const selected = ref([]);
const rekamMedisData = ref([]);
const loading = ref(true);
// Fetch rekamMedis data from the API
const fetchRekamMedisData = async () => {
  try {
    const response = await fetch("/api/rekamedis");
    if (response.status == 200) {
      const responseData = await response.json();
      if (responseData.body) {
        rekamMedisData.value = JSON.parse(responseData.body);
        console.log(
          "Successfully fetched rekamMedis data",
          rekamMedisData.value
        );
        loading.value = false;
      } else {
        throw new Error("Response body is empty.");
      }
    } else {
      throw new Error(
        `Error fetching rekamMedis data. Status code: ${response.status}`
      );
    }
  } catch (error) {
    loading.value = false;
    console.error("Error fetching/parsing rekamMedis data:", error);
  }
};

// const fetchRekamMedisData = async () => {
//   try {
//     const response = await fetch("/api/rekamedis");
//     const responseData = await response.json();

//     if (response.status === 200) {
//       // Assign data dari server ke variabel rekamMedis
//       rekamMedisData.value = JSON.parse(responseData.body);
//       console.log(rekamMedisData.value);
//       loading.value = false;
//     } else {
//       console.error(
//         "Error fetching rekamMedis data. Status code:",
//         response.status
//       );
//     }
//   } catch (error) {
//     loading.value = false;
//     console.error("Error parsing rekamMedis data:", error);
//   }
// };

// Call the fetchRekamMedisData function when the component is mounted
onMounted(fetchRekamMedisData);

// Use the fetched rekamMedisData for filtering
const filteredRows = computed(() => {
  if (!q.value) {
    return rekamMedisData.value;
  }

  return rekamMedisData.value.filter((rekamMedis) => {
    return Object.values(rekamMedis).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});
</script>

<style></style>
