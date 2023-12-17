<template>
  <div
    class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div className="flex item-center">
      <h2
        className="mr-2 text-2xl mt-6 font-semibold tracking-tight text-center"
      >
        Rekam Medis
      </h2>
    </div>
    <div class="w-full flex flex-row mt-6 gap-2">
      <div
        class="w-1/2 p-8 mx-auto shadow-md rounded-lg border py-10 flex-col justify-center items-center"
      >
        <h2 class="font-semibold text-lg">Riwayat Penyakit</h2>
        <h3>Flu , Batuk , pilek</h3>
      </div>

      <div
        class="w-1/2 p-8 mx-auto shadow-md rounded-lg border py-10 flex-col justify-center items-center"
      >
        <h2 class="font-semibold text-lg">Tanggal Terakhir Pemeriksaan</h2>
        <h3>10 Januari 2023</h3>
      </div>
    </div>
  </div>

  <div
    class="md:ml-72 mt-3 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div class="w-full mt-12">
      <h1 class="font-semibold font-md text-center">Riwayat</h1>

      <div class="mx-3 my-2 px-10 text-center text-sm">
        Berikut adalah daftar riwayat penyakit pasien
      </div>
    </div>
    <div class="container px-10 my-3">
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
          <PatientRiwayat />
        </template>
        <template #diagnosis>
          <PatientDiagnosis />
        </template>
        <template #kunjungan>
          <PatientVisit />
        </template>
      </UTabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "default",
});

import PatientVisit from "../../../components/patient/visit.vue";

// const PatientVisit = defineAsyncComponent(
//   () => import("@/components/patient-record/visit.vue")
// );

const items = [
  {
    slot: "riwayat",
    label: "Riwayat Penyakit",
    icon: "i-heroicons-information-circle",
    content: "PatientVisit",
  },
  {
    slot: "diagnosis",
    label: "Diagnosis",
    icon: "i-heroicons-eye-dropper",
    disabled: false,
    content: "And, this is the content for Tab2",
  },
  {
    slot: "kunjungan",
    label: "Kunjungan Rawat",
    icon: "i-heroicons-calendar-days",
    content: "Finally, this is the content for Tab3",
  },
];
</script>
