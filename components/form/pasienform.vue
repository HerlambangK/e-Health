<!-- File: components/PasienForm.vue -->
<template>
  <UForm :state="formState" :schema="PasienSchema" @submit="handleSubmit">
    <UFormGroup class="mb-4" name="nama" label="Nama">
      <UInput
        v-model="formState.nama"
        type="text"
        placeholder="Masukkan nama pasien"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="umur" label="Umur">
      <UInput
        v-model="formState.umur"
        type="number"
        placeholder="Masukkan umur pasien"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="address" label="Alamat">
      <UInput
        v-model="formState.address"
        type="text"
        placeholder="Masukkan alamat pasien"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="notlp" label="Nomor Telepon">
      <UInput
        v-model="formState.notlp"
        type="text"
        placeholder="Masukkan nomor telepon pasien"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="dokter" label="Dokter">
      <USelect
        v-model="formState.dokter._id"
        :options="dokterOptions.value"
        labelKey="namaDokter"
        valueKey="_id"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="poli" label="Poli">
      <USelect v-model="formState.poli" :options="poliOptions.value" />
    </UFormGroup>

    <UFormGroup class="mb-4" name="jenisAsuransi" label="Jenis Asuransi">
      <USelect
        v-model="formState.jenisAsuransi"
        :options="jenisAsuransiOptions"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="rekamedis" label="Rekam Medis">
      <USelect
        v-model="formState.rekamedis"
        :options="rekamedisOptions"
        labelKey="noRekamedis"
        valueKey="_id"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="fotoProfil" label="Foto Profil">
      <UInput
        v-model="formState.fotoProfil"
        type="file"
        placeholder="Masukkan URL foto profil pasien"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="riwayatPenyakit" label="Riwayat Penyakit">
      <USelectMenu
        v-model="formState.riwayatPenyakit"
        :options="riwayatPenyakitOptions"
        multiple
        placeholder="Select Riwayat"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="completedStatus" label="Status Selesai">
      <UCheckbox
        v-model="formState.completedStatus"
        name="completedStatus"
        label="Selesai Priksa"
      />

      <!-- <UInput v-model="formState.completedStatus" type="checkbox" /> -->
    </UFormGroup>

    <UFormGroup>
      <UButton :loading="isLoading" type="submit" color="primary" block>
        Simpan
      </UButton>
    </UFormGroup>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import { ref } from "vue";
// import { useFetch, useToast, useRouter } from "@nuxt/uicomposable";
// import { UForm, UFormGroup, UInput, UButton, USelect } from "nuxt-ui";
import PasienSchema from "~/schemas/Pasien.schema";
import type { z } from "h3-zod";

// import { PasienSchema } from "~/schemas/Pasien.schema";
const riwayatPenyakitOptions: Ref<string[]> = ref([
  "Flu",
  "Batuk",
  "Asma",
  "Hipertensi",
  "Diabetes",
]);

const formState = ref({
  nama: undefined,
  umur: undefined,
  address: undefined,
  notlp: undefined,
  dokter: {
    _id: undefined,
    namaDokter: undefined,
  },
  poli: undefined,
  jenisAsuransi: undefined,
  rekamedis: {
    _id: undefined,
    noRekamedis: undefined,
  },
  fotoProfil:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
  riwayatPenyakit: [],
  completedStatus: false,
});
const isLoading = ref(false);
// Opsi untuk Dokter
// Deklarasikan jenis untuk opsi dokter dan rekamedis
// Deklarasikan jenis untuk opsi dokter, rekamedis, dan poli
type DokterOption = { _id: string; namaDokter: string };
type RekamedisOption = { _id: string; noRekamedis: string };
type PoliOption = string; // Poli hanya menggunakan string sebagai opsi
const jenisAsuransiOptions: Ref<string[]> = ref(["Bpjs", "Askes", "Mandiri"]);
const selectedDoctor = ref(null);
const dokterOptions = ref<DokterOption[] | null>([]);
const rekamedisOptions = ref<RekamedisOption[] | null>([]);
const poliOptions = ref<PoliOption[]>([]);

// Assuming these are reactive variables
const fetchDoctorData = async () => {
  try {
    const dokterResponse = await fetch("/api/dokter");
    const dokterData = await dokterResponse.json();

    if (dokterResponse.status === 200) {
      const parsedData = JSON.parse(dokterData.body);
      console.log("dokterData.value", parsedData);

      const doctorId = selectedDoctor.value;
      if (doctorId) {
        console.log("doctorId", doctorId);
        const selectedDoctorData = parsedData.find(
          (doctor: any) => doctor._id === doctorId
        );

        formState.value.dokter = selectedDoctorData;

        console.log("selectedDoctorData", selectedDoctorData);
        console.log("formState.value.dokter", formState.value.dokter);

        return selectedDoctorData || null;
      }

      console.log(parsedData[0]?.namaDokter);
    } else {
      console.error(
        "Error fetching doctor data. Status code:",
        dokterResponse.status
      );
    }
  } catch (error) {
    console.error("Error parsing doctor data:", error);
  }
};

watch(
  () => selectedDoctor.value,
  (newSelectedDoctor) => {
    if (newSelectedDoctor) {
      fetchDoctorData();
    }
  }
);

onMounted(() => {
  fetchDoctorData();
});

async function handleSubmit(
  event: FormSubmitEvent<z.output<typeof PasienSchema>>
) {
  try {
    isLoading.value = true;
    await useFetch("/api/pasien", {
      method: "POST",
      body: event.data,
    });
    useToast().add({
      title: "Pasien created",
      description: "Pasien data has been created successfully.",
    });
    await useRouter().push({
      name: "home",
    });
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Style sesuai kebutuhan */
</style>
