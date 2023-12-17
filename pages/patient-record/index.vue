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
// import { useRoute } from "vue-router";

// const route = useRoute();
// const { patientId } = route.params;
// console.log(patientId);
// console.log(row.id);

const columns = [
  {
    key: "pasient",
    label: "Pasient",
  },
  {
    key: "dokter",
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
    key: "kontrol_terakhir",
    label: "kontrol terakhir",
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
const people = [
  {
    id: 1,
    pasient: "Lindsay Walton",
    dokter: "Dr lina",
    poli: "Penyakit Dalam",
    keluhan: "Pusing",
    kontrol_terakhir: "12 jan 2023",
  },
  {
    id: 1,
    pasient: "Lindsay Walton",
    dokter: "Dr lina",
    poli: "Penyakit Dalam",
    keluhan: "Pusing",
    kontrol_terakhir: "12 jan 2023",
  },
  {
    id: 1,
    pasient: "Lindsay Walton",
    dokter: "Dr lina",
    poli: "Penyakit Dalam",
    keluhan: "Pusing",
    kontrol_terakhir: "12 jan 2023",
  },
  {
    id: 1,
    pasient: "Lindsay Walton",
    dokter: "Dr lina",
    poli: "Penyakit Dalam",
    keluhan: "Pusing",
    kontrol_terakhir: "12 jan 2023",
  },
  {
    id: 1,
    pasient: "Lindsay Walton",
    dokter: "Dr lina",
    poli: "Penyakit Dalam",
    keluhan: "Pusing",
    kontrol_terakhir: "12 jan 2023",
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
