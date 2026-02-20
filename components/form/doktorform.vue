<template>
  <UForm :state="formState" :schema="DokterSchema" class="space-y-6" @submit="handleSubmit">
    <UCard>
      <template #header>
        <div>
          <h3 class="text-base font-semibold text-gray-900">Profil Dokter</h3>
          <p class="text-sm text-gray-500">Informasi utama untuk identifikasi dan spesialisasi dokter.</p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormGroup name="namaDokter" label="Nama Lengkap">
          <UInput v-model="formState.namaDokter" placeholder="Contoh: dr. Rani Wijayanti" />
        </UFormGroup>

        <UFormGroup name="nip" label="NIP">
          <UInput v-model="formState.nip" placeholder="Masukkan NIP dokter" />
        </UFormGroup>

        <UFormGroup name="licenseNumber" label="Nomor SIP (opsional)">
          <UInput v-model="formState.licenseNumber" placeholder="Nomor izin praktik" />
        </UFormGroup>

        <UFormGroup name="yearsExperience" label="Pengalaman (tahun)">
          <UInput v-model="formState.yearsExperience" type="number" min="0" placeholder="Contoh: 5" />
        </UFormGroup>

        <UFormGroup name="spesialisasi" label="Spesialisasi">
          <USelectMenu
            v-model="formState.spesialisasi"
            searchable
            :options="specializationOptions"
            placeholder="Pilih spesialisasi"
          />
        </UFormGroup>

        <UFormGroup name="poli" label="Poli">
          <USelectMenu v-model="formState.poli" searchable :options="poliOptions" placeholder="Pilih poli" />
        </UFormGroup>

        <UFormGroup name="telepon" label="No. Kontak (opsional)">
          <UInput v-model="formState.telepon" placeholder="Contoh: 0812-xxxx-xxxx" />
        </UFormGroup>

        <UFormGroup name="email" label="Email (opsional)">
          <UInput v-model="formState.email" type="email" placeholder="Contoh: dokter@rumahsakit.id" />
        </UFormGroup>

        <UFormGroup name="signatureUrl" label="Tanda tangan digital (URL)">
          <UInput v-model="formState.signatureUrl" placeholder="URL gambar tanda tangan" />
        </UFormGroup>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <h3 class="text-base font-semibold text-gray-900">Jadwal & Layanan</h3>
          <p class="text-sm text-gray-500">Atur jadwal praktek, kehadiran, dan detail layanan dokter.</p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormGroup name="jadwal" label="Jadwal Praktek">
          <USelectMenu
            v-model="formState.jadwal"
            :options="scheduleOptions"
            searchable
            placeholder="Pilih jadwal"
          />
        </UFormGroup>

        <UFormGroup name="kehadiran" label="Status Kehadiran">
          <USelectMenu
            v-model="formState.kehadiran"
            :options="attendanceOptions"
            searchable
            placeholder="Status kehadiran"
          />
        </UFormGroup>

        <UFormGroup name="tarifKonsultasi" label="Tarif Konsultasi (opsional)">
          <UInput v-model="formState.tarifKonsultasi" type="number" min="0" placeholder="Contoh: 150000" />
        </UFormGroup>

        <UFormGroup name="billingCode" label="Kode Billing (opsional)">
          <UInput v-model="formState.billingCode" placeholder="Contoh: BILL-DR-001" />
        </UFormGroup>
      </div>

      <UFormGroup name="appointmentSlots" label="Slot Appointment">
        <UTagsInput
          v-model="formState.appointmentSlots"
          :options="appointmentSlotSuggestions"
          placeholder="Tambahkan atau pilih slot jadwal"
        />
        <p class="mt-2 text-xs text-gray-500">
          Slot ini akan ditarik ke modul appointment untuk penjadwalan cepat. Gunakan format HH:MM atau range hari.
        </p>
      </UFormGroup>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <h3 class="text-base font-semibold text-gray-900">Integrasi & Catatan</h3>
          <p class="text-sm text-gray-500">
            Hubungkan dokter dengan modul billing dan appointment, serta simpan catatan penting.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <UAlert color="primary" variant="soft" icon="i-heroicons-link">
          Dokter yang tersimpan akan otomatis muncul pada formulir pasien dan modul appointment.
        </UAlert>

        <UFormGroup name="catatan" label="Catatan Tambahan">
          <UTextarea
            v-model="formState.catatan"
            rows="3"
            placeholder="Contoh: Konsultasi khusus pagi hari, fokus pada pasien kronis, dsb."
          />
        </UFormGroup>

        <div class="flex flex-wrap gap-2">
          <UButton variant="ghost" color="gray" icon="i-heroicons-credit-card" @click="gotoBilling">
            Pantau tarif & billing
          </UButton>
          <UButton variant="ghost" color="gray" icon="i-heroicons-calendar-days" @click="gotoAppointment">
            Kelola jadwal appointment
          </UButton>
          <UButton variant="ghost" color="gray" icon="i-heroicons-document-text" @click="gotoRekamedis">
            Ringkas rekam medis
          </UButton>
        </div>
      </div>
    </UCard>

    <div class="flex items-center justify-between border-t border-gray-200 pt-4">
      <UButton color="gray" variant="soft" icon="i-heroicons-arrow-uturn-left" @click="resetForm">
        Reset Form
      </UButton>
      <UButton :loading="isLoading" type="submit" color="primary" icon="i-heroicons-check-circle">
        Simpan Dokter
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import type { z } from "h3-zod";
import { reactive, ref } from "vue";

import DokterSchema from "~/schemas/Dokter.schema";

const emit = defineEmits<{
  saved: [];
}>();

type DokterFormState = z.input<typeof DokterSchema>;

const defaultState: DokterFormState = {
  namaDokter: "",
  nip: "",
  spesialisasi: "",
  poli: "",
  jadwal: "",
  kehadiran: "",
  licenseNumber: "",
  yearsExperience: undefined,
  signatureUrl: "",
  telepon: "",
  email: "",
  tarifKonsultasi: undefined,
  billingCode: "",
  appointmentSlots: [],
  catatan: "",
};

const formState = reactive<DokterFormState>({ ...defaultState });
const isLoading = ref(false);
const toast = useToast();
const router = useRouter();

const specializationOptions = [
  "Umum",
  "Penyakit Dalam",
  "Anak",
  "Saraf",
  "Jantung",
  "THT",
  "Obgyn",
].map((value) => ({ label: `Spesialis ${value}`, value }));

const poliOptions = [
  { label: "Poli Umum", value: "Poli Umum" },
  { label: "Poli Penyakit Dalam", value: "Poli Penyakit Dalam" },
  { label: "Poli Anak", value: "Poli Anak" },
  { label: "Poli Gigi", value: "Poli Gigi" },
  { label: "UGD", value: "UGD" },
];

const scheduleOptions = [
  { label: "Senin - Rabu (08.00 - 14.00)", value: "Senin-Rabu (08.00-14.00)" },
  { label: "Kamis - Sabtu (09.00 - 13.00)", value: "Kamis-Sabtu (09.00-13.00)" },
  { label: "Senin - Jumat (16.00 - 20.00)", value: "Senin-Jumat (16.00-20.00)" },
  { label: "On Call 24 Jam", value: "On Call 24 Jam" },
];

const attendanceOptions = [
  { label: "Hadir", value: "Hadir" },
  { label: "Cuti", value: "Cuti" },
  { label: "Dinas Luar", value: "Dinas Luar" },
  { label: "Izin", value: "Izin" },
];

const appointmentSlotSuggestions = [
  "Senin 08:00",
  "Senin 10:00",
  "Rabu 13:00",
  "Kamis 09:30",
  "Jumat 19:00",
].map((value) => ({ label: value, value }));

function resetForm() {
  Object.assign(formState, { ...defaultState });
}

function gotoBilling() {
  router.push("/patient-record/billing");
}

function gotoAppointment() {
  router.push("/patient-record/appointment");
}

function gotoRekamedis() {
  router.push("/patient-record");
}

async function handleSubmit(event: FormSubmitEvent<z.output<typeof DokterSchema>>) {
  try {
    isLoading.value = true;
    const payload: Record<string, any> = { ...event.data };

    if (!payload.licenseNumber) delete payload.licenseNumber;
    if (!payload.yearsExperience) delete payload.yearsExperience;
    if (!payload.signatureUrl) delete payload.signatureUrl;
    if (!payload.telepon) delete payload.telepon;
    if (!payload.email) delete payload.email;
    if (!payload.billingCode) delete payload.billingCode;
    if (!payload.catatan) delete payload.catatan;
    if (!payload.tarifKonsultasi) delete payload.tarifKonsultasi;
    if (!payload.appointmentSlots?.length) delete payload.appointmentSlots;

    await $fetch("/api/dokter", {
      method: "POST",
      body: payload,
    });

    toast.add({
      title: "Dokter berhasil ditambahkan",
      description: "Profil dokter telah terhubung dengan modul billing dan appointment.",
      color: "green",
      icon: "i-heroicons-check-badge",
    });

    emit("saved");
    resetForm();
  } catch (error: any) {
    console.error(error);
    toast.add({
      title: "Gagal menyimpan dokter",
      description: "Pastikan data sudah benar atau coba beberapa saat lagi.",
      color: "red",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
