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
        v-model="formState.dokter"
        :options="namaDokterList"
        labelKey="namaDokter"
        valueKey="_id"
        placeholder="Select dokter"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="poli" label="Poli">
      <USelect v-model="formState.poli" :options="poliOptions" />
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
        type="text"
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
import { ref, defineProps } from "vue";

import PasienSchema from "~/schemas/Pasien.schema";
import type { z } from "h3-zod";

const riwayatPenyakitOptions: Ref<string[]> = ref([
  "Flu",
  "Batuk",
  "Asma",
  "Hipertensi",
  "Diabetes",
]);

const formState = ref({
  nama: "",
  umur: "",
  address: "",
  notlp: "",
  dokter: {
    namaDokter: "",
  },
  namaDokterList: "",
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
type RekamedisOption = { _id: string; noRekamedis: string };
type PoliOption = string; // Poli hanya menggunakan string sebagai opsi
const jenisAsuransiOptions: Ref<string[]> = ref(["Bpjs", "Askes", "Mandiri"]);

const selectedDoctor = ref(null as string | null);
// const rekamedisOptions = ref<RekamedisOption[] | null>([]);
const poliOptions = ref<PoliOption[]>(["jiwa", "dokter", "perawat"]);
const namaDokterList = ref([]);
const rekamedisOptions = ref(["12333", "12344"]);
// const rekamedisOptions = ref(["12333", "12344"]);

console.log("jenisAsuransiOptions", jenisAsuransiOptions.value);
// Assuming these are reactive variables
const fetchDoctorData = async () => {
  try {
    const dokterResponse = await fetch("/api/dokter");
    const dokterData = await dokterResponse.json();

    if (dokterResponse.status === 200) {
      const parsedData = dokterData.body.map((doctor: any) => ({
        _id: doctor._id,
        namaDokter: doctor.namaDokter,
      }));
      const namaDokterListSemua = computed(() => {
        return parsedData.map((doctor: any) => doctor.namaDokter);
      });
      const IdDokterSemua = computed(() => {
        return parsedData.map((doctor: any) => doctor._id);
      });

      // Menggunakan hasil dari namaDokterListSemua.value
      // namaDokterList.value = namaDokterListSemua.value;
      // IdDokterList.value = IdDokterSemua.value;
      namaDokterList.value = namaDokterListSemua.value;

      console.log("namaDokterListSemua", namaDokterListSemua.value);
      console.log("namaDokterList,", namaDokterList.value);
      console.log("parsedData", parsedData);

      const doctorId = selectedDoctor.value;
      console.log("doctorId:", doctorId);

      if (doctorId) {
        const selectedDoctorData = parsedData.find(
          (doctor: any) => doctor._id === doctorId
        );
        console.log("selectedDoctorData: ", selectedDoctorData);

        formState.value.dokter = selectedDoctorData;
        console.log("formState.value.dokter", formState.value.dokter);

        return selectedDoctorData || null;
      }
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
    useToast().add({
      title: "Error created",
      color: "red",
      description: "Pasien data has not been created.",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Style sesuai kebutuhan */
</style>
