<template>
  <section id="about" class="relative py-16 sm:py-20">
    <div class="home-container grid gap-10 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-200">
          Tentang Kami
        </div>
        <h2 class="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
          Data pasien yang rapi dan akurat untuk keputusan klinis yang lebih cepat.
        </h2>
        <p class="text-base text-slate-600">
          Kami merancang e-Health agar setiap tim memiliki akses informasi yang sama, kapan pun dibutuhkan.
          Sistem ini mengurangi administrasi manual, mempercepat layanan, dan memberi visibilitas penuh terhadap perjalanan pasien.
        </p>
        <div class="space-y-3 text-sm text-slate-600">
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Dashboard terpadu untuk dokter, admin, dan manajemen.</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Audit trail lengkap untuk keamanan dan kepatuhan.</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Notifikasi otomatis untuk tindak lanjut pasien.</span>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="glass-card rounded-2xl p-5"
        >
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{{ feature.label }}</div>
          <h3 class="font-display mt-3 text-lg font-semibold text-slate-900">{{ feature.title }}</h3>
          <p class="mt-2 text-sm text-slate-600">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    label: "01",
    title: "Realtime Monitoring",
    description: "Pantau status pasien, antrean, dan layanan ambulans tanpa berpindah aplikasi.",
  },
  {
    label: "02",
    title: "Smart Scheduling",
    description: "Jadwal kunjungan terkoordinasi dengan reminder otomatis dan kalender dokter.",
  },
  {
    label: "03",
    title: "Integrated Billing",
    description: "Tagihan lebih cepat dengan rekap biaya, resep, dan asuransi dalam satu layar.",
  },
  {
    label: "04",
    title: "Actionable Insight",
    description: "Laporan kinerja harian untuk membantu keputusan manajerial.",
  },
];
</script>
