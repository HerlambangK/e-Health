<template>
  <UForm :state="formState" :schema="PasienSchema" class="space-y-6" @submit="handleSubmit">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-gray-900">Informasi Pasien</h3>
            <p class="text-sm text-gray-500">Lengkapi data dasar dan kontak pasien.</p>
          </div>
          <UAvatar :src="formState.fotoProfil ?? defaultAvatar" alt="Avatar pasien" size="lg" />
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormGroup name="nama" label="Nama Lengkap">
          <UInput v-model="formState.nama" placeholder="Contoh: Surminah Dewi" />
        </UFormGroup>

        <UFormGroup name="umur" label="Umur">
          <UInput v-model="formState.umur" type="number" min="0" placeholder="Contoh: 27" />
        </UFormGroup>

        <UFormGroup name="address" label="Alamat">
          <UTextarea v-model="formState.address" rows="2" placeholder="Tulis alamat domisili pasien" />
        </UFormGroup>

        <UFormGroup name="notlp" label="Nomor Kontak">
          <UInput v-model="formState.notlp" placeholder="Contoh: 0812-xxxx-xxxx" />
        </UFormGroup>

        <UFormGroup name="jenisAsuransi" label="Jenis Asuransi">
          <USelectMenu v-model="formState.jenisAsuransi" :options="insuranceOptions" placeholder="Pilih jenis asuransi" />
        </UFormGroup>

        <UFormGroup name="fotoProfil" label="Foto Profil (opsional)">
          <UInput v-model="formState.fotoProfil" placeholder="URL gambar profil pasien" />
        </UFormGroup>

        <UFormGroup name="riwayatPenyakit" label="Riwayat Penyakit">
          <USelectMenu
            v-model="formState.riwayatPenyakit"
            multiple
            searchable
            :options="riwayatPenyakitOptions"
            placeholder="Pilih riwayat yang relevan"
          />
        </UFormGroup>

        <UFormGroup name="completedStatus" label="Status Penanganan">
          <div class="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
            <UToggle v-model="formState.completedStatus" name="completedStatus" />
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ formState.completedStatus ? "Selesai diperiksa" : "Masih dalam penanganan" }}
              </p>
              <p class="text-xs text-gray-500">
                Gunakan toggle ini untuk menandai status penanganan terakhir pasien.
              </p>
            </div>
          </div>
        </UFormGroup>
      </div>
    </UCard>

    <section class="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
      <UCard class="h-full">
        <template #header>
          <div>
            <h3 class="text-base font-semibold text-gray-900">Koneksi Klinik & Rekam Medis</h3>
            <p class="text-sm text-gray-500">
              Hubungkan pasien ini dengan dokter, poli, serta rekam medis yang tersedia.
            </p>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormGroup name="dokter" label="Dokter Penanggung Jawab">
            <USelectMenu
              v-model="formState.dokter"
              :options="dokterOptions"
              searchable
              placeholder="Pilih dokter"
              :loading="isLoadingDoctors"
            />
          </UFormGroup>

          <UFormGroup name="poli" label="Poliklinik">
            <USelectMenu
              v-model="formState.poli"
              :options="uniquePoliOptions"
              searchable
              placeholder="Pilih poli"
            />
          </UFormGroup>

          <UFormGroup name="rekamedis" label="Rekam Medis">
            <USelectMenu
              v-model="formState.rekamedis"
              :options="rekamedisOptions"
              searchable
              placeholder="Tautkan rekam medis"
              :loading="isLoadingRekamedis"
            />
          </UFormGroup>

          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Ringkasan relasi</p>
            <p class="mt-2 text-gray-700">
              <span class="font-semibold text-gray-900">Dokter:</span>
              {{ selectedDoctorDetails?.label ?? "Belum dipilih" }}
            </p>
            <p class="mt-1 text-gray-700">
              <span class="font-semibold text-gray-900">Poli:</span>
              {{ formState.poli || "Ikuti poli dokter" }}
            </p>
            <p class="mt-1 text-gray-700">
              <span class="font-semibold text-gray-900">Rekam Medis:</span>
              {{ selectedRekamedisSummary?.label ?? "Belum ditautkan" }}
            </p>
          </div>
        </div>

        <div v-if="selectedRekamedisSummary" class="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Sorotan Rekam Medis</p>
          <ul class="mt-2 space-y-1 text-blue-900">
            <li>
              <span class="font-semibold">Keluhan:</span>
              {{ selectedRekamedisSummary.meta.keluhan }}
            </li>
            <li>
              <span class="font-semibold">Kontrol terakhir:</span>
              {{ selectedRekamedisSummary.meta.kontrolTerakhir }}
            </li>
            <li>
              <span class="font-semibold">Obat aktif:</span>
              {{ selectedRekamedisSummary.meta.obat.join(", ") }}
            </li>
          </ul>
        </div>

        <div class="mt-4 flex flex-wrap gap-2 text-sm">
          <UButton variant="ghost" color="gray" icon="i-heroicons-document-text" @click="gotoRekamedis">
            Kelola Rekam Medis
          </UButton>
          <UButton variant="ghost" color="gray" icon="i-heroicons-credit-card" @click="gotoBilling">
            Lihat Billing
          </UButton>
          <UButton variant="ghost" color="gray" icon="i-heroicons-calendar-days" @click="gotoAppointment">
            Jadwal Appointment
          </UButton>
        </div>
      </UCard>

      <div class="grid gap-4">
        <UCard>
          <template #header>
            <h3 class="text-base font-semibold text-gray-900">Preferensi Billing</h3>
          </template>
          <div class="space-y-3 text-sm">
            <UFormGroup name="billingPlan" label="Metode Penagihan">
              <USelectMenu
                v-model="formState.billingPlan"
                :options="billingOptions"
                searchable
                placeholder="Pilih metode penagihan"
              />
            </UFormGroup>
            <UAlert
              v-if="formState.billingPlan"
              color="primary"
              icon="i-heroicons-information-circle"
              variant="soft"
            >
              Pastikan data penjamin pada modul billing sudah diperbarui.
            </UAlert>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-base font-semibold text-gray-900">Jadwal Appointment Awal</h3>
          </template>
          <div class="grid gap-3 text-sm">
            <UFormGroup name="appointmentDate" label="Tanggal">
              <UInput v-model="formState.appointmentDate" type="date" />
            </UFormGroup>

            <UFormGroup name="appointmentTime" label="Waktu">
              <UInput v-model="formState.appointmentTime" type="time" />
            </UFormGroup>

            <UFormGroup name="appointmentNotes" label="Catatan Appointment">
              <UTextarea
                v-model="formState.appointmentNotes"
                rows="3"
                placeholder="Catatan persiapan atau instruksi khusus"
              />
            </UFormGroup>

            <UAlert color="gray" variant="soft" icon="i-heroicons-clock">
              Jadwal ini akan tampil di modul appointment dan dapat disesuaikan sewaktu-waktu.
            </UAlert>
          </div>
        </UCard>
      </div>
    </section>

    <div class="flex items-center justify-between border-t border-gray-200 pt-4">
      <UButton color="gray" variant="soft" icon="i-heroicons-arrow-uturn-left" @click="resetForm">
        Reset Form
      </UButton>
      <UButton :loading="isLoading" type="submit" color="primary" icon="i-heroicons-check-circle">
        Simpan Pasien
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import type { z } from "h3-zod";
import { computed, reactive, ref, watch } from "vue";

import PasienSchema from "~/schemas/Pasien.schema";

const emit = defineEmits<{
  saved: [];
}>();

type PasienFormState = z.input<typeof PasienSchema>;

const defaultAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=4&w=256&h=256&q=60";

const defaultState: PasienFormState = {
  nama: "",
  umur: undefined,
  address: "",
  notlp: "",
  dokter: "",
  poli: "",
  jenisAsuransi: "",
  rekamedis: "",
  fotoProfil: defaultAvatar,
  riwayatPenyakit: [],
  completedStatus: false,
  billingPlan: "",
  appointmentDate: "",
  appointmentTime: "",
  appointmentNotes: "",
};

const formState = reactive<PasienFormState>({ ...defaultState });
const isLoading = ref(false);
const toast = useToast();
const router = useRouter();

const insuranceOptions = [
  { label: "BPJS Kesehatan", value: "BPJS Kesehatan" },
  { label: "Asuransi Swasta", value: "Asuransi Swasta" },
  { label: "Perusahaan / Corporate", value: "Perusahaan" },
  { label: "Tunai / Mandiri", value: "Mandiri" },
];

const riwayatPenyakitOptions = [
  "Flu",
  "Batuk",
  "Asma",
  "Hipertensi",
  "Diabetes",
  "Alergi",
  "COVID-19",
].map((label) => ({ label, value: label }));

const billingOptions = [
  { label: "Penjamin BPJS", value: "BPJS" },
  { label: "Asuransi Swasta", value: "Asuransi" },
  { label: "Pembayaran Tunai", value: "Tunai" },
  { label: "Perusahaan / Corporate", value: "Corporate" },
];

const { data: dokterResponse, pending: isLoadingDoctors } = await useLazyAsyncData(
  "admin-dokter-options",
  () => $fetch("/api/dokter").then((res: any) => ("body" in res ? res.body : res ?? [])),
  {
    server: false,
    default: () => [],
  }
);

const doctorOptionsDetailed = computed(() =>
  (dokterResponse.value ?? []).map((doctor: any) => ({
    value: doctor._id,
    label: doctor.namaDokter,
    meta: doctor,
  }))
);

const dokterOptions = computed(() => doctorOptionsDetailed.value.map(({ value, label }) => ({ value, label })));
const uniquePoliOptions = computed(() => {
  const set = new Set(
    doctorOptionsDetailed.value
      .map((item) => item.meta.poli)
      .filter((poli: string | undefined) => Boolean(poli))
  );
  return Array.from(set).map((poli) => ({ label: poli as string, value: poli as string }));
});

const selectedDoctorDetails = computed(() =>
  doctorOptionsDetailed.value.find((item) => item.value === formState.dokter)
);

watch(
  () => formState.dokter,
  (dokterId) => {
    if (!dokterId) {
      return;
    }
    const doctor = doctorOptionsDetailed.value.find((item) => item.value === dokterId);
    if (doctor?.meta?.poli) {
      formState.poli = doctor.meta.poli;
    }
  }
);

const { data: rekamedisResponse, pending: isLoadingRekamedis } = await useLazyAsyncData(
  "admin-rekamedis-options",
  () =>
    $fetch("/api/rekamedis").then((res: any) => ("body" in res ? res.body : res ?? [])).catch(() => [] as any[]),
  {
    server: false,
    default: () => [],
  }
);

const rekamedisOptionsDetailed = computed(() =>
  (rekamedisResponse.value ?? []).map((item: any) => ({
    value: item._id,
    label: `${item.namaPasien ?? "Pasien"} • ${item.kontrolTerakhir}`,
    meta: item,
  }))
);

const rekamedisOptions = computed(() =>
  rekamedisOptionsDetailed.value.map(({ value, label }) => ({ value, label }))
);

const selectedRekamedisSummary = computed(() =>
  rekamedisOptionsDetailed.value.find((item) => item.value === formState.rekamedis)
);

function resetForm() {
  Object.assign(formState, { ...defaultState });
}

function gotoRekamedis() {
  router.push("/patient-record/rekam-medis");
}

function gotoBilling() {
  router.push("/patient-record/billing");
}

function gotoAppointment() {
  router.push("/patient-record/appoitment");
}

async function handleSubmit(event: FormSubmitEvent<z.output<typeof PasienSchema>>) {
  try {
    isLoading.value = true;
    const payload: Record<string, any> = {
      ...event.data,
      fotoProfil: event.data.fotoProfil || defaultAvatar,
    };

    if (!payload.billingPlan) {
      delete payload.billingPlan;
    }
    if (!payload.appointmentDate) {
      delete payload.appointmentDate;
    }
    if (!payload.appointmentTime) {
      delete payload.appointmentTime;
    }
    if (!payload.appointmentNotes) {
      delete payload.appointmentNotes;
    }

    await $fetch("/api/pasien", {
      method: "POST",
      body: payload,
    });

    toast.add({
      title: "Pasien berhasil ditambahkan",
      description: "Data pasien telah terhubung dengan modul rekam medis, billing, dan appointment.",
      color: "green",
      icon: "i-heroicons-check-badge",
    });

    emit("saved");
    resetForm();
  } catch (error) {
    console.error(error);
    toast.add({
      title: "Gagal menyimpan pasien",
      description: "Periksa kembali data yang dimasukkan atau coba beberapa saat lagi.",
      color: "red",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
