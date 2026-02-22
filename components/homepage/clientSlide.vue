<template>
  <client-only>
    <section class="py-16 sm:py-20">
      <div class="home-container">
        <div class="flex flex-col items-center text-center gap-3">
          <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Dipercaya oleh</span>
          <h2 class="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">Mitra layanan kesehatan</h2>
          <p class="max-w-xl text-base leading-relaxed text-slate-600">
            Tim kami telah membantu berbagai institusi untuk menyederhanakan proses operasional dan meningkatkan kualitas layanan.
          </p>
        </div>

        <div class="mt-8 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5">
          <Vue3Marquee :pause-on-hover="true">
            <div class="mx-6" v-for="(sponsor, idx) in sponsors" :key="idx">
              <img
                :src="`${sponsor.icon}`"
                :alt="sponsor.name"
                class="h-16 w-16 object-contain opacity-60 transition duration-300 hover:opacity-100"
              />
            </div>
          </Vue3Marquee>
        </div>
      </div>
    </section>
  </client-only>
</template>

<script setup lang="ts">
interface SponsorsProps {
  icon: string;
  name: string;
}

const sponsors: SponsorsProps[] = [
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo2.png", name: "Sehat Group" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo2.png", name: "Sehat Group" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo2.png", name: "Sehat Group" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo2.png", name: "Sehat Group" },
  { icon: "/img/logo.png", name: "ICHC" },
];
</script>
