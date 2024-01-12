<!-- File: components/DokterForm.vue -->
<template>
  <UForm :state="formState" :schema="DokterSchema" @submit="handleSubmit">
    <UFormGroup class="mb-4" name="namaDokter" label="Nama Dokter">
      <UInput
        v-model="formState.namaDokter"
        type="text"
        placeholder="Masukkan nama dokter"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="nip" label="NIP">
      <UInput
        v-model="formState.nip"
        type="text"
        placeholder="Masukkan NIP dokter"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="spesialisasi" label="Spesialisasi">
      <UInput
        v-model="formState.spesialisasi"
        type="text"
        placeholder="Masukkan spesialisasi dokter"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="poli" label="Poli">
      <UInput
        v-model="formState.poli"
        type="text"
        placeholder="Masukkan poli dokter"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="jadwal" label="Jadwal Praktek">
      <UInput
        v-model="formState.jadwal"
        type="text"
        placeholder="Masukkan jadwal praktek dokter"
      />
    </UFormGroup>

    <UFormGroup class="mb-4" name="kehadiran" label="Kehadiran">
      <UInput
        v-model="formState.kehadiran"
        type="text"
        placeholder="Masukkan kehadiran dokter"
      />
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
import DokterSchema from "~/schemas/Dokter.schema";
// import type { z } from "h3-zod";
import type { z } from "zod";

const formState = ref({
  namaDokter: undefined,
  nip: undefined,
  spesialisasi: undefined,
  poli: undefined,
  jadwal: undefined,
  kehadiran: undefined,
});

const isLoading = ref(false);

async function handleSubmit(
  event: FormSubmitEvent<z.output<typeof DokterSchema>>
) {
  try {
    isLoading.value = true;
    // Gantilah "/api/dokter" sesuai dengan endpoint yang sesuai untuk menyimpan data dokter
    await useFetch("/api/dokter", {
      method: "POST",
      body: event.data,
    });
    useToast().add({
      title: "Dokter created",
      description: "Dokter data has been created successfully.",
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
/* Sesuaikan dengan kebutuhan styling */
</style>
