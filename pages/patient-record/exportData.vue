<template>
  <div class="pb-10 flex-grow">
    <div class="flex flex-wrap items-center gap-3 py-4">
      <USelectMenu v-model="selectedDataset" :options="datasetOptions" class="w-52" />
      <UButton @click="exportToExcel" :disabled="!rows.length">Download Excel</UButton>
    </div>

    <UTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
    />
  </div>
</template>

<script setup lang="ts">
import * as XLSX from "xlsx";

definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});

const datasetOptions = [
  { label: "Pasien", value: "pasien" },
  { label: "Dokter", value: "dokter" },
  { label: "Rekam Medis", value: "rekamedis" },
];

const selectedDataset = ref("pasien");

const { data: datasetResponse, pending: loading } = await useLazyAsyncData(
  "export-dataset",
  async () => {
    if (selectedDataset.value === "dokter") {
      return $fetch("/api/dokter", { query: { page: 1, pageSize: 200 } });
    }
    if (selectedDataset.value === "rekamedis") {
      return $fetch("/api/rekamedis", { query: { page: 1, pageSize: 200 } });
    }
    return $fetch("/api/pasien", { query: { page: 1, pageSize: 200 } });
  },
  {
    default: () => ({ data: [] }),
    watch: [selectedDataset],
  }
);

const rows = computed(() => (datasetResponse.value as any)?.data ?? []);

const columns = computed(() => {
  switch (selectedDataset.value) {
    case "dokter":
      return [
        { key: "namaDokter", label: "Nama" },
        { key: "nip", label: "NIP" },
        { key: "spesialisasi", label: "Spesialisasi" },
        { key: "poli", label: "Poli" },
        { key: "jadwal", label: "Jadwal" },
      ];
    case "rekamedis":
      return [
        { key: "namaPasien", label: "Pasien" },
        { key: "namaDokter", label: "Dokter" },
        { key: "keluhan", label: "Keluhan" },
        { key: "kontrolTerakhir", label: "Kontrol Terakhir" },
      ];
    default:
      return [
        { key: "nama", label: "Nama" },
        { key: "umur", label: "Umur" },
        { key: "dokter", label: "Dokter" },
        { key: "poli", label: "Poli" },
        { key: "jenisAsuransi", label: "Asuransi" },
      ];
  }
});

function exportToExcel() {
  let dataToExport: any[] = [];

  if (selectedDataset.value === "dokter") {
    dataToExport = rows.value.map((row: any) => ({
      Nama: row.namaDokter,
      NIP: row.nip,
      Spesialisasi: row.spesialisasi,
      Poli: row.poli,
      Jadwal: row.jadwal,
    }));
  } else if (selectedDataset.value === "rekamedis") {
    dataToExport = rows.value.map((row: any) => ({
      Pasien: row.namaPasien?.nama ?? row.namaPasien,
      Dokter: row.dokter?.namaDokter ?? row.namaDokter,
      Keluhan: row.keluhan,
      KontrolTerakhir: row.kontrolTerakhir,
    }));
  } else {
    dataToExport = rows.value.map((row: any) => ({
      Nama: row.nama,
      Umur: row.umur,
      Dokter: row.dokter?.namaDokter ?? row.dokter,
      Poli: row.poli,
      Asuransi: row.jenisAsuransi,
    }));
  }

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
  XLSX.writeFile(workbook, `ehealth-${selectedDataset.value}.xlsx`);
}
</script>
