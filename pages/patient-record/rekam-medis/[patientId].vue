<template>
  <div
    class="pb-10 flex-grow"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Rekam Medis</h2>
        <p class="text-sm text-gray-500">
          {{ patient?.nama ?? "Pasien" }}
        </p>
      </div>
      <UBadge v-if="isLoading" label="Loading" variant="subtle" />
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <UCard>
        <template #header>
          <h3 class="text-base font-semibold text-gray-900">Riwayat Penyakit</h3>
        </template>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="item in riwayatPenyakit"
            :key="item"
            :label="item"
            variant="subtle"
            color="gray"
          />
          <p v-if="riwayatPenyakit.length === 0" class="text-sm text-gray-500">
            Belum ada data riwayat penyakit.
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-base font-semibold text-gray-900">Tanggal Terakhir Pemeriksaan</h3>
        </template>
        <div class="space-y-1">
          <p class="text-lg font-semibold text-gray-900">
            {{ latestCheckDate }}
          </p>
          <p class="text-sm text-gray-500">
            {{ latestDoctor }}
          </p>
        </div>
      </UCard>
    </div>
  </div>

  <div
    class="mt-3 pb-10 flex-grow"
  >
    <div class="w-full mt-6">
      <h1 class="font-semibold text-lg text-center">Riwayat</h1>
      <div class="mx-3 my-2 px-10 text-center text-sm text-gray-500">
        Berikut adalah daftar riwayat pemeriksaan pasien.
      </div>
    </div>

    <div class="container px-4 md:px-10 my-3">
      <UTabs :items="items" class="w-full">
        <template #default="{ item, selected }">
          <div class="flex items-center gap-2 relative truncate">
            <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
            <span class="truncate">{{ item.label }}</span>
            <span
              v-if="selected"
              class="absolute -right-4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400"
            />
          </div>
        </template>

        <template #riwayat>
          <UTable
            :rows="rekamMedisRows"
            :columns="riwayatColumns"
            :loading="rekamLoading"
            :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
          >
            <template #kontrolTerakhir-data="{ row }">
              <span>{{ formatDate(row.kontrolTerakhir) }}</span>
            </template>
            <template #dokter-data="{ row }">
              <span>{{ row?.dokter?.namaDokter ?? "-" }}</span>
            </template>
            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-2">
                <span class="italic text-sm">Belum ada rekam medis.</span>
              </div>
            </template>
          </UTable>
        </template>

        <template #diagnosis>
          <UTable
            :rows="rekamMedisRows"
            :columns="diagnosisColumns"
            :loading="rekamLoading"
            :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
          >
            <template #kontrolTerakhir-data="{ row }">
              <span>{{ formatDate(row.kontrolTerakhir) }}</span>
            </template>
            <template #diagnosis-data="{ row }">
              <span>{{ row?.diagnosis ?? "-" }}</span>
            </template>
            <template #obat-data="{ row }">
              <span>{{ formatObat(row?.obat) }}</span>
            </template>
            <template #dokter-data="{ row }">
              <span>{{ row?.dokter?.namaDokter ?? "-" }}</span>
            </template>
            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-2">
                <span class="italic text-sm">Belum ada diagnosis.</span>
              </div>
            </template>
          </UTable>
        </template>

        <template #kunjungan>
          <UTable
            :rows="rekamMedisRows"
            :columns="visitColumns"
            :loading="rekamLoading"
            :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
          >
            <template #kontrolTerakhir-data="{ row }">
              <span>{{ formatDate(row.kontrolTerakhir) }}</span>
            </template>
            <template #followUpDate-data="{ row }">
              <span>{{ formatDate(row.followUpDate) }}</span>
            </template>
            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-2">
                <span class="italic text-sm">Belum ada riwayat kunjungan.</span>
              </div>
            </template>
          </UTable>
        </template>
      </UTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTanggal } from "~/utils";

definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});

const route = useRoute();
const patientId = computed(() => String(route.params.patientId ?? ""));

const { data: patientResponse, pending: patientLoading } = await useLazyAsyncData(
  "pasien-detail",
  () =>
    patientId.value
      ? $fetch(`/api/pasien/${patientId.value}`).catch(() => ({ data: null }))
      : Promise.resolve({ data: null }),
  {
    default: () => ({ data: null }),
    watch: [patientId],
  }
);

const patient = computed(() => (patientResponse.value as any)?.data ?? null);

const { data: rekamResponse, pending: rekamLoading } = await useLazyAsyncData(
  "rekamedis-by-patient",
  () =>
    patientId.value
      ? $fetch("/api/rekamedis", {
          query: { patientId: patientId.value, page: 1, pageSize: 50 },
        }).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
  {
    default: () => ({ data: [] }),
    watch: [patientId],
  }
);

const rekamMedisRows = computed(() => (rekamResponse.value as any)?.data ?? []);
const isLoading = computed(() => patientLoading.value || rekamLoading.value);

const riwayatPenyakit = computed(() => {
  const list = patient.value?.riwayatPenyakit;
  if (Array.isArray(list) && list.length > 0) return list;
  return [];
});

const latestRecord = computed(() => rekamMedisRows.value?.[0]);
const latestCheckDate = computed(() => formatDate(latestRecord.value?.kontrolTerakhir));
const latestDoctor = computed(() =>
  latestRecord.value?.dokter?.namaDokter
    ? `Dokter: ${latestRecord.value.dokter.namaDokter}`
    : "Belum ada pemeriksaan"
);

const items = [
  {
    slot: "riwayat",
    label: "Riwayat",
    icon: "i-heroicons-information-circle",
  },
  {
    slot: "diagnosis",
    label: "Diagnosis",
    icon: "i-heroicons-eye-dropper",
  },
  {
    slot: "kunjungan",
    label: "Kunjungan Rawat",
    icon: "i-heroicons-calendar-days",
  },
];

const riwayatColumns = [
  { key: "kontrolTerakhir", label: "Kontrol Terakhir" },
  { key: "keluhan", label: "Keluhan" },
  { key: "catatan", label: "Catatan" },
  { key: "dokter", label: "Dokter" },
];

const diagnosisColumns = [
  { key: "kontrolTerakhir", label: "Tanggal" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "obat", label: "Obat" },
  { key: "dokter", label: "Dokter" },
];

const visitColumns = [
  { key: "kontrolTerakhir", label: "Tanggal" },
  { key: "tensiSistol", label: "Tensi Sistol" },
  { key: "tensiDiastol", label: "Tensi Diastol" },
  { key: "guladarah", label: "Gula Darah" },
  { key: "followUpDate", label: "Follow Up" },
];

function formatDate(value?: string) {
  if (!value) return "-";
  return formatTanggal(value);
}

function formatObat(items: string[] | undefined) {
  if (!items || items.length === 0) return "-";
  return items.join(", ");
}
</script>
