<template>
  <div class="min-h-screen bg-white">
    <div class="w-full space-y-6 py-6">
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
              <UBadge :label="`${personalNotes.length} catatan`" color="gray" variant="subtle" />
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

const { data: session } = useAuth();
const userId = computed(() => session.value?.user?._id);

const { data: dashboardResponse } = await useAsyncData(
  "patient-dashboard",
  async () => {
    if (!userId.value) return null;

    let pasienRes: any;
    try {
      pasienRes = await $fetch("/api/pasien", {
        query: { userId: userId.value, page: 1, pageSize: 1 },
      });
    } catch {
      return null;
    }

    const pasien = pasienRes?.data?.[0];

    if (!pasien) return null;

    let rekamedisRes: any = { data: [] };
    let appointmentRes: any = { data: [] };

    try {
      [rekamedisRes, appointmentRes] = await Promise.all([
        $fetch("/api/rekamedis", {
          query: { patientId: pasien._id, page: 1, pageSize: 5 },
        }),
        $fetch("/api/appointment", {
          query: { patientId: pasien._id, from: new Date().toISOString() },
        }),
      ]);
    } catch {
      // keep empty results
    }

    return {
      pasien,
      rekamedis: (rekamedisRes as any)?.data ?? [],
      appointments: (appointmentRes as any)?.data ?? [],
    };
  },
  {
    server: false,
    default: () => null,
    watch: [userId],
  }
);

const dashboardData = computed(() => dashboardResponse.value);

const latestRekamedis = computed(() => dashboardData.value?.rekamedis?.[0]);
const nextAppointment = computed(() =>
  (dashboardData.value?.appointments ?? [])
    .sort((a: any, b: any) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .find((item: any) => item.status !== "cancelled")
);

const patient = computed(() => {
  const pasien = dashboardData.value?.pasien;
  const rekamedis = latestRekamedis.value;

  return {
    name: pasien?.nama ?? "Pasien",
    healthSummary: {
      updatedAt: rekamedis?.kontrolTerakhir ?? "-",
      latestDiagnosis: {
        title: rekamedis?.diagnosis || rekamedis?.keluhan || "Belum ada diagnosis",
        date: rekamedis?.kontrolTerakhir ?? "-",
        notes: rekamedis?.catatan ?? "Belum ada catatan medis terbaru.",
      },
      plan: rekamedis?.obat?.length
        ? rekamedis.obat.map((item: string) => `Konsumsi ${item}`)
        : ["Belum ada rencana perawatan terbaru."],
    },
  };
});

const highlightCards = computed(() => {
  const pasien = dashboardData.value?.pasien;
  return [
    {
      title: "Status Penanganan",
      value: pasien?.completedStatus ? "Selesai" : "Dalam Proses",
      description: "Status pemeriksaan terakhir pasien.",
      icon: "i-heroicons-clipboard-document-check-20-solid",
    },
    {
      title: "Keanggotaan",
      value: pasien?.jenisAsuransi ?? "-",
      description: "Jenis asuransi yang digunakan pasien.",
      icon: "i-heroicons-identification-20-solid",
      badge: pasien?.jenisAsuransi ? "Aktif" : undefined,
    },
    {
      title: "Dokter Penanggung Jawab",
      value: pasien?.dokter?.namaDokter ?? "-",
      description: pasien?.poli ? `Poli ${pasien.poli}` : "Belum ditetapkan",
      icon: "i-heroicons-user-circle-20-solid",
    },
  ];
});

const medications = computed(() => {
  const meds = latestRekamedis.value?.obat ?? [];
  if (!meds.length) return [];
  return meds.map((name: string) => ({
    name,
    dose: "Sesuai anjuran dokter",
    schedule: "Ikuti jadwal resep",
  }));
});

const vitals = computed(() => {
  const rekamedis = latestRekamedis.value;
  if (!rekamedis) return [];
  return [
    { label: "Tekanan darah", value: `${rekamedis.tensiSistol} / ${rekamedis.tensiDiastol} mmHg` },
    { label: "Gula darah", value: `${rekamedis.guladarah} mg/dL` },
  ];
});

const upcomingAppointment = computed(() => {
  const appointment = nextAppointment.value;
  if (!appointment) {
    return {
      date: "Belum ada jadwal",
      time: "-",
      doctor: "-",
      department: "-",
      status: "Belum terjadwal",
    };
  }

  const date = new Date(appointment.startAt);
  return {
    date: date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time: date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    doctor: appointment.doctorId?.namaDokter ?? "-",
    department: appointment.doctorId?.poli ?? "-",
    status: appointment.status,
  };
});

const visits = computed(() =>
  (dashboardData.value?.rekamedis ?? []).map((item: any) => ({
    id: item._id,
    title: item.diagnosis || item.keluhan || "Kunjungan",
    date: item.kontrolTerakhir ?? "-",
    department: item.dokter?.poli ?? "-",
    status: "Selesai",
    statusColor: "emerald",
    notes: item.catatan ?? "",
  }))
);

const personalNotes = computed(() => []);
</script>
