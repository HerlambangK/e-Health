<template>
  <div
    class="pb-10 flex-grow"
  >
    <div
      class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 justify-between items-center"
    >
      <h2 class="mr-2 text-2xl font-semibold tracking-tight">
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
      <template #nama-data="{ row }">
        <span
          :class="[
            selected.find((person) => person._id === row._id) &&
              'text-primary-500 dark:text-primary-400',
          ]"
          >{{ row.nama }}</span
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
      <template #dokter-data="{ row }">
        <span>{{ row?.dokter?.namaDokter ?? "-" }}</span>
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
import { normalizeRole } from "~/utils/permissions";

definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
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

const router = useRouter();
const toast = useToast();
const { data: session } = useAuth();
const role = computed(() => normalizeRole(session.value?.user?.role));
const canDelete = computed(() => role.value === "admin");
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

const development = () => {
  toast.add({
    color: "blue",
    icon: "i-heroicons-exclamation-triangle-20-solid",
    position: "top-1 bottom-auto",
    title: "Development",
    description: "This feature is under development.",
  });
};

const { data: pasienResponse, pending: loading, refresh } = await useLazyAsyncData(
  "pasien-list",
  () =>
    $fetch("/api/pasien", {
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

const filteredRows = computed(() => (pasienResponse.value as any)?.data ?? []);

const gotoDetail = (row: any) => {
  if (!row?._id) {
    toast.add({
      color: "red",
      title: "Pasien tidak ditemukan",
      description: "ID pasien tidak tersedia.",
    });
    return;
  }
  router.push(`/patient-record/rekam-medis/${row._id}`);
};

const deletePatient = async (row: any) => {
  if (!canDelete.value) return;
  if (!row?._id) return;
  if (!window.confirm(`Hapus pasien ${row.nama ?? "ini"}?`)) return;

  try {
    await $fetch(`/api/pasien/${row._id}`, { method: "DELETE" });
    toast.add({
      color: "green",
      title: "Pasien dihapus",
      description: "Data pasien berhasil dihapus.",
    });
    refresh();
  } catch (error) {
    toast.add({
      color: "red",
      title: "Gagal menghapus pasien",
      description: "Periksa akses atau coba lagi.",
    });
  }
};

const items = (row: any) => {
  const menu: any[] = [
    [
      {
        label: "Detail",
        icon: "i-heroicons-eye-20-solid",
        click: () => gotoDetail(row),
      },
      {
        label: "Edit",
        icon: "i-heroicons-pencil-square-20-solid",
        click: () => development(),
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
  ];

  if (canDelete.value) {
    menu.push([
      {
        label: "Delete",
        icon: "i-heroicons-trash-20-solid",
        click: () => deletePatient(row),
      },
    ]);
  }

  return menu;
};
</script>

<style></style>
