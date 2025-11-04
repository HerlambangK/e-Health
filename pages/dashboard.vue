<template>
  <div class="md:ml-72 min-h-screen bg-gray-50">
    <div class="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 lg:px-8">
      <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary-500">
            Selamat datang kembali
          </p>
          <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Halo, {{ patient.name }}
          </h1>
          <p class="text-sm text-gray-500">
            Lihat ringkasan kesehatan, jadwal konsultasi, dan pantau perkembangan perawatanmu.
          </p>
        </div>
        <UButton color="primary" variant="soft" icon="i-heroicons-arrow-down-tray">
          Unduh Rekam Medis
        </UButton>
      </header>

      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <UCard
          v-for="card in highlightCards"
          :key="card.title"
          :ui="{ body: { padding: 'p-5' } }"
          class="relative overflow-hidden"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">{{ card.title }}</p>
              <h2 class="mt-1 text-xl font-semibold text-gray-900 sm:text-2xl">
                {{ card.value }}
              </h2>
              <p class="mt-2 text-xs text-gray-500">{{ card.description }}</p>
            </div>
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <UIcon :name="card.icon" class="h-5 w-5" />
            </span>
          </div>
          <div
            v-if="card.badge"
            class="absolute bottom-4 right-5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
          >
            {{ card.badge }}
          </div>
        </UCard>
      </section>

      <section class="grid grid-cols-1 gap-4 lg:grid-cols-[2fr,1.2fr]">
        <UCard :ui="{ body: { padding: 'p-5 sm:p-6' }, header: { padding: 'px-5 py-4 sm:px-6' } }">
          <template #header>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Ringkasan Kesehatan</h2>
                <p class="text-sm text-gray-500">
                  Informasi penting terkait kondisi dan tindakan medis terbaru.
                </p>
              </div>
              <UBadge label="Diperbarui {{ patient.healthSummary.updatedAt }}" color="gray" variant="subtle" />
            </div>
          </template>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-gray-100 p-4">
              <p class="text-sm font-medium text-gray-500">Diagnosis terbaru</p>
              <p class="mt-1 text-lg font-semibold text-gray-900">
                {{ patient.healthSummary.latestDiagnosis.title }}
              </p>
              <p class="mt-1 text-xs text-gray-500">
                {{ patient.healthSummary.latestDiagnosis.date }}
              </p>
              <p class="mt-3 text-sm text-gray-600 leading-relaxed">
                {{ patient.healthSummary.latestDiagnosis.notes }}
              </p>
            </div>

            <div class="rounded-xl border border-gray-100 p-4">
              <p class="text-sm font-medium text-gray-500">Rencana perawatan</p>
              <ul class="mt-3 space-y-2 text-sm text-gray-600">
                <li v-for="item in patient.healthSummary.plan" :key="item" class="flex items-start gap-2">
                  <span class="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-primary-500"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-gray-100 p-4">
              <p class="text-sm font-medium text-gray-500">Obat yang dikonsumsi</p>
              <ul class="mt-3 space-y-3">
                <li v-for="med in medications" :key="med.name" class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ med.name }}</p>
                    <p class="text-xs text-gray-500">{{ med.dose }}</p>
                  </div>
                  <UBadge :label="med.schedule" color="primary" variant="subtle" />
                </li>
              </ul>
            </div>

            <div class="rounded-xl border border-gray-100 p-4">
              <p class="text-sm font-medium text-gray-500">Tanda Vital Hari Ini</p>
              <ul class="mt-3 space-y-3 text-sm text-gray-600">
                <li v-for="vital in vitals" :key="vital.label" class="flex items-center justify-between">
                  <span>{{ vital.label }}</span>
                  <span class="font-semibold text-gray-900">{{ vital.value }}</span>
                </li>
              </ul>
            </div>
          </div>
        </UCard>

        <UCard :ui="{ body: { padding: 'p-5 sm:p-6' }, header: { padding: 'px-5 py-4 sm:px-6' } }">
          <template #header>
            <div class="flex items-start justify-between gap-2">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Janji Temu Berikutnya</h2>
                <p class="text-sm text-gray-500">
                  Persiapkan diri untuk konsultasi selanjutnya bersama dokter.
                </p>
              </div>
              <UBadge :label="upcomingAppointment.status" color="emerald" variant="subtle" />
            </div>
          </template>

          <div class="space-y-4">
            <div class="rounded-2xl bg-primary-50 p-4 text-sm text-primary-700">
              <p class="font-semibold text-primary-900">{{ upcomingAppointment.date }}</p>
              <p class="mt-1 text-primary-600">{{ upcomingAppointment.time }}</p>
              <p class="mt-2">Dokter {{ upcomingAppointment.doctor }}</p>
              <p class="text-xs text-primary-600/80">Departemen {{ upcomingAppointment.department }}</p>
            </div>

            <ul class="space-y-3 text-sm text-gray-600">
              <li class="flex items-start gap-3">
                <span class="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-primary-500"></span>
                <span>Datang 15 menit sebelum jadwal untuk registrasi ulang.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-primary-500"></span>
                <span>Bawa hasil lab terakhir dan catatan penggunaan obat.</span>
              </li>
            </ul>

            <div class="flex flex-wrap gap-2">
              <UButton color="primary" variant="solid" size="sm" icon="i-heroicons-calendar">
                Lihat Detail
              </UButton>
              <UButton color="gray" variant="soft" size="sm" icon="i-heroicons-phone">
                Hubungi RS
              </UButton>
            </div>
          </div>
        </UCard>
      </section>

      <section class="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr,1fr]">
        <UCard :ui="{ body: { padding: 'p-5 sm:p-6' }, header: { padding: 'px-5 py-4 sm:px-6' } }">
          <template #header>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Riwayat Kunjungan</h2>
              <UButton variant="link" size="sm" color="primary">Lihat Semua</UButton>
            </div>
          </template>

          <div class="space-y-4">
            <div
              v-for="visit in visits"
              :key="visit.id"
              class="rounded-xl border border-gray-100 p-4 sm:flex sm:items-center sm:justify-between"
            >
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ visit.title }}</p>
                <p class="text-xs text-gray-500">{{ visit.date }} • {{ visit.department }}</p>
                <p class="mt-2 text-sm text-gray-600">{{ visit.notes }}</p>
              </div>
              <UBadge :label="visit.status" :color="visit.statusColor" variant="subtle" class="mt-3 sm:mt-0" />
            </div>
          </div>
        </UCard>

        <UCard :ui="{ body: { padding: 'p-5 sm:p-6' }, header: { padding: 'px-5 py-4 sm:px-6' } }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Catatan Pribadi</h2>
              <UBadge label="3 catatan" color="gray" variant="subtle" />
            </div>
          </template>

          <ul class="space-y-3 text-sm text-gray-600">
            <li v-for="note in personalNotes" :key="note" class="rounded-xl border border-dashed border-gray-200 p-4">
              {{ note }}
            </li>
          </ul>

          <UButton color="primary" variant="soft" size="sm" class="mt-4" icon="i-heroicons-pencil-square">
            Tambah Catatan
          </UButton>
        </UCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});

const patient = reactive({
  name: "Surminah",
  healthSummary: {
    updatedAt: "2 jam lalu",
    latestDiagnosis: {
      title: "Infeksi Saluran Pernapasan Atas (ISPA)",
      date: "Ditetapkan 21 Februari 2024",
      notes: "Terindikasi batuk pilek berkepanjangan tanpa demam tinggi. Perlu pemantauan 7 hari.",
    },
    plan: [
      "Melanjutkan terapi antibiotik selama 5 hari",
      "Kontrol ulang jika gejala tidak berkurang dalam 3 hari",
      "Istirahat cukup dan konsumsi cairan hangat",
    ],
  },
});

const highlightCards = [
  {
    title: "Menetap di RS terakhir",
    value: "2 hari",
    description: "Rawat jalan tanpa komplikasi lanjut.",
    icon: "i-heroicons-clock-20-solid",
  },
  {
    title: "Keanggotaan",
    value: "BPJS Kesehatan",
    description: "Status aktif sejak Januari 2022. Perpanjang otomatis.",
    icon: "i-heroicons-identification-20-solid",
    badge: "Aktif",
  },
  {
    title: "Dokter Penanggung Jawab",
    value: "dr. Rani Wijayanti",
    description: "Spesialis penyakit dalam • Poli Lantai 3",
    icon: "i-heroicons-user-circle-20-solid",
  },
];

const medications = [
  { name: "Amoxicillin 500mg", dose: "3x sehari setelah makan", schedule: "Pagi • Siang • Malam" },
  { name: "Paracetamol 500mg", dose: "Jika demam >38°C", schedule: "Sesuai kebutuhan" },
  { name: "Vitamin C 500mg", dose: "1x sehari", schedule: "Pagi" },
];

const vitals = [
  { label: "Tekanan darah", value: "118 / 78 mmHg" },
  { label: "Suhu tubuh", value: "36.9°C" },
  { label: "Denyut nadi", value: "78 bpm" },
  { label: "Saturasi O₂", value: "97%" },
];

const upcomingAppointment = {
  date: "Kamis, 29 Februari 2024",
  time: "08:30 WIB",
  doctor: "Rani Wijayanti",
  department: "Penyakit Dalam",
  status: "Terkonfirmasi",
};

const visits = [
  {
    id: 1,
    title: "Kontrol lanjutan ISPA",
    date: "14 Februari 2024",
    department: "Poli Penyakit Dalam",
    status: "Selesai",
    statusColor: "emerald",
    notes: "Evaluasi perbaikan gejala, resep obat diperbarui.",
  },
  {
    id: 2,
    title: "Pemeriksaan Laboratorium",
    date: "21 Januari 2024",
    department: "Lab Klinik",
    status: "Selesai",
    statusColor: "emerald",
    notes: "Tes darah lengkap, fungsi hati dan ginjal normal.",
  },
  {
    id: 3,
    title: "Vaksin influenza tahunan",
    date: "10 Desember 2023",
    department: "Poli Vaksin",
    status: "Selesai",
    statusColor: "emerald",
    notes: "Tidak ada reaksi alergi, pantau selama 24 jam.",
  },
];

const personalNotes = [
  "Catat pola tidur dan tingkat kelelahan setiap malam.",
  "Kurangi konsumsi makanan berminyak selama masa pemulihan.",
  "Jadwalkan konsultasi gizi untuk rencana makan seimbang.",
];
</script>
