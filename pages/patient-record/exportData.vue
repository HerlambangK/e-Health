<template>
  <div class="pb-10 flex-grow">
    <div class="flex flex-wrap items-center gap-3 py-4">
      <USelectMenu v-model="selectedDataset" :options="datasetOptions" class="w-52" />
      <UButton @click="exportToExcel" :disabled="!rows.length || pending">Download Excel</UButton>
    </div>

    <div v-if="errorMsg || fetchError" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {{ errorMsg || fetchError }}
    </div>

    <UTable
      :rows="rows"
      :columns="columns"
      :loading="pending"
      :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
    >
      <template #namaPasien-data="{ row }">
        {{ row.namaPasien?.nama ?? row.namaPasien ?? "-" }}
      </template>
      <template #namaDokter-data="{ row }">
        {{ row.dokter?.namaDokter ?? row.namaDokter ?? "-" }}
      </template>
      <template #dokter-data="{ row }">
        {{ row.dokter?.namaDokter ?? row.dokter ?? "-" }}
      </template>
    </UTable>
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
const errorMsg = ref("");
const fetchError = ref("");

async function fetchData(dataset: string) {
  fetchError.value = "";
  try {
    if (dataset === "dokter") {
      return await $fetch("/api/dokter", { query: { page: 1, pageSize: 200 } });
    }
    if (dataset === "rekamedis") {
      return await $fetch("/api/rekamedis", { query: { page: 1, pageSize: 200 } });
    }
    return await $fetch("/api/pasien", { query: { page: 1, pageSize: 200 } });
  } catch (e: any) {
    fetchError.value = e?.data?.error?.message ?? e?.message ?? "Gagal memuat data";
    return { data: [] };
  }
}

const datasetResponse = ref<{ data: any[] }>({ data: [] });
const pending = ref(true);

onMounted(async () => {
  pending.value = true;
  datasetResponse.value = await fetchData(selectedDataset.value);
  pending.value = false;
});

watch(selectedDataset, async (val) => {
  pending.value = true;
  datasetResponse.value = await fetchData(val);
  pending.value = false;
});

const rows = computed(() => datasetResponse.value?.data ?? []);

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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportToExcel() {
  try {
    errorMsg.value = "";
    const data = rows.value;
    if (!data || !data.length) {
      errorMsg.value = "Tidak ada data untuk diekspor.";
      return;
    }

    let mapped: Record<string, any>[];

    if (selectedDataset.value === "dokter") {
      mapped = data.map((r: any) => ({
        Nama: r.namaDokter ?? "",
        NIP: r.nip ?? "",
        Spesialisasi: r.spesialisasi ?? "",
        Poli: r.poli ?? "",
        Jadwal: r.jadwal ?? "",
      }));
    } else if (selectedDataset.value === "rekamedis") {
      mapped = data.map((r: any) => ({
        Pasien: r.namaPasien?.nama ?? r.namaPasien ?? "",
        Dokter: r.dokter?.namaDokter ?? r.namaDokter ?? "",
        Keluhan: r.keluhan ?? "",
        "Kontrol Terakhir": r.kontrolTerakhir ?? "",
      }));
    } else {
      mapped = data.map((r: any) => ({
        Nama: r.nama ?? "",
        Umur: r.umur ?? "",
        Dokter: r.dokter?.namaDokter ?? r.dokter ?? "",
        Poli: r.poli ?? "",
        Asuransi: r.jenisAsuransi ?? "",
      }));
    }

    const ws = XLSX.utils.json_to_sheet(mapped);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");

    const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbOut], { type: "application/octet-stream" });
    downloadBlob(blob, `ehealth-${selectedDataset.value}.xlsx`);
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Gagal mengekspor data.";
  }
}
</script>
