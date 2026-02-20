<template>
  <section class="relative overflow-hidden pb-16 pt-32">
    <div class="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/60 blur-3xl" />
    <div class="pointer-events-none absolute right-10 top-24 h-56 w-56 rounded-full bg-sky-200/70 blur-3xl" />

    <div class="home-container grid items-center gap-12 lg:grid-cols-[1.1fr,0.9fr]">
      <div class="space-y-6">
        <div
          class="fade-up inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-200"
        >
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          Platform kesehatan terpadu
        </div>

        <h1 class="font-display fade-up delay-1 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Kelola layanan klinik dan rumah sakit dengan pengalaman digital yang modern.
        </h1>
        <p class="fade-up delay-2 text-base text-slate-600 sm:text-lg">
          e-Health membantu tim medis, administrasi, dan pasien berkolaborasi dalam satu dashboard.
          Dari jadwal kunjungan, rekam medis, hingga analitik operasional semua rapi dan real-time.
        </p>

        <div class="fade-up delay-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <NuxtLink :to="isLoggedIn ? '/dashboard' : '/auth/signin'">
            <UButton size="lg" color="primary" class="w-full sm:w-auto">Mulai Sekarang</UButton>
          </NuxtLink>
          <NuxtLink to="#service" class="w-full sm:w-auto">
            <UButton size="lg" variant="soft" color="gray" class="w-full sm:w-auto">Lihat Layanan</UButton>
          </NuxtLink>
        </div>

        <div class="fade-up delay-3 grid gap-3 sm:grid-cols-2">
          <div class="glass-card rounded-2xl p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Rata-rata respon</p>
            <p class="font-display text-2xl font-semibold text-slate-900">8 menit</p>
            <p class="text-xs text-slate-500">Monitoring ambulans & telemedis.</p>
          </div>
          <div class="glass-card rounded-2xl p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Integrasi data</p>
            <p class="font-display text-2xl font-semibold text-slate-900">100%</p>
            <p class="text-xs text-slate-500">Rekam medis, billing, dan laporan.</p>
          </div>
        </div>
      </div>

      <div class="relative">
        <div class="overflow-hidden rounded-[2.5rem] shadow-2xl ring-1 ring-white/60">
          <img
            src="/img/image-phone-doctor.jpg"
            alt="Dashboard e-Health"
            class="h-full w-full object-cover"
          />
        </div>

        <div class="glass-card absolute -left-6 bottom-8 rounded-2xl px-4 py-3 text-sm text-slate-700">
          <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Live</div>
          <div class="font-semibold text-slate-900">13 pasien terpantau</div>
          <div class="text-xs text-slate-500">Waktu tunggu terendah hari ini.</div>
        </div>

        <div class="glass-card absolute -right-6 top-10 rounded-2xl px-4 py-3 text-sm text-slate-700">
          <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Integrasi</div>
          <div class="font-semibold text-slate-900">BPJS & Lab</div>
          <div class="text-xs text-slate-500">Sinkron otomatis setiap 10 menit.</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: session } = useAuth();
const isLoggedIn = computed(() => Boolean(session.value?.user));
</script>
