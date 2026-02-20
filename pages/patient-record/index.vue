<template>
  <div
    class="pb-10 flex-grow"
  >
    <div
      class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 justify-between items-center"
    >
      <h2 class="mr-2 text-2xl font-semibold tracking-tight">Rekam Medis</h2>

      <UInput v-model="q" placeholder="Filter people..." />
    </div>
    <!-- <div>tes: {{ rekamMedisData }}</div> -->
    <UTable
      v-model="selected"
      :rows="rekamMedisRows"
      :columns="columns"
      :loading="loading"
      :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Loading...',
      }"
    >
      <template #namaPasien-data="{ row }">
        <span
          :class="[
            selected.find((rekamMedis) => rekamMedis._id === row._id) &&
              'text-primary-500 dark:text-primary-400',
          ]"
        >
          {{ row?.namaPasien?.nama ?? '-' }}
        </span>
      </template>
      <template #namaDokter-data="{ row }">
        <span>{{ row?.dokter?.namaDokter ?? "-" }}</span>
      </template>

      <template #poli-data="{ row }">
        <span>{{ row?.dokter?.poli ?? "-" }}</span>
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

<script setup lang="ts">
import { formatTanggal } from "~/utils";

definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});
const router = useRouter();
const toast = useToast();
const dataTabel = [
  {
    key: "namaPasien",
    label: "Pasien",
  },
  {
    key: "namaDokter",
    label: "Dokter",
  },
  {
    key: "poli",
    label: "Poli",
  },

  {
    key: "keluhan",
    label: "Keluhan",
  },
  {
    key: "kontrolTerakhir",
    label: "Kontrol Terakhir",
  },
  {
    key: "catatan",
    label: "Catatan",
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

const gotoDetail = (row) => {
  const patientId = row?.namaPasien?._id;
  if (!patientId) {
    toast.add({
      color: "red",
      title: "Pasien tidak ditemukan",
      description: "ID pasien tidak tersedia.",
    });
    return;
  }
  router.push(`/patient-record/rekam-medis/${patientId}`);
};

const items = (row) => [
  [
    {
      label: "Details",
      icon: "i-heroicons-eye-20-solid",
      click: () => gotoDetail(row),
    },
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => console.log("Edit", row._id),
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

const q = ref("");
const selected = ref([]);

const { data: rekamedisResponse, pending: loading } = await useLazyAsyncData(
  "rekamedis-list",
  () =>
    $fetch("/api/rekamedis", {
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

const rekamMedisRows = computed(() => (rekamedisResponse.value as any)?.data ?? []);
</script>

<style></style>
