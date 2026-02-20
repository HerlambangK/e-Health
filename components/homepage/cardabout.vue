<template>
  <section id="service" class="py-16 sm:py-20">
    <div class="home-container">
      <div class="flex flex-col items-center text-center">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Layanan</span>
        <h3 class="font-display mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Solusi utama e-Health</h3>
        <p class="mt-3 max-w-2xl text-sm text-slate-600">
          Modul yang fleksibel untuk kebutuhan klinik, puskesmas, hingga rumah sakit dengan skala besar.
        </p>
      </div>

      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="asset in assets"
          :key="asset.title"
          class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="aspect-[4/3] overflow-hidden">
            <img :src="asset.img" :alt="asset.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          </div>
          <div class="p-5">
            <h4 class="font-display text-lg font-semibold text-slate-900">{{ asset.title }}</h4>
            <p class="mt-2 text-sm text-slate-600">{{ asset.description }}</p>
            <div class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Jelajahi fitur →
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const assets = ref([
  {
    title: "Telemedis & Konsultasi",
    img: "/img/towfiqu-barbhuiya-w8p9cQDLX7I-unsplash.jpg",
    description: "Janji temu digital, konsultasi video, dan tindak lanjut pasien secara terstruktur.",
  },
  {
    title: "Rekam Medis Terpadu",
    img: "/img/drew-hays-tGYrlchfObE-unsplash.jpg",
    description: "Riwayat pasien, resep, dan hasil lab tersimpan aman serta mudah dicari.",
  },
  {
    title: "Manajemen Obat",
    img: "/img/luis-melendez-Pd4lRfKo16U-unsplash.jpg",
    description: "Kontrol stok, peringatan kadaluarsa, dan laporan penggunaan obat real-time.",
  },
  {
    title: "Analitik Operasional",
    img: "/img/image-phone-doctor.jpg",
    description: "Dashboard performa untuk memantau KPI layanan, biaya, dan produktivitas.",
  },
]);
</script>
