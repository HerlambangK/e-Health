<template>
  <section id="contact" class="py-16 sm:py-20">
    <div class="home-container grid gap-10 lg:grid-cols-[0.9fr,1.1fr]">
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-200">
          Hubungi Kami
        </div>
        <h2 class="font-display text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          Bicarakan kebutuhan layanan kesehatan digital Anda.
        </h2>
        <p class="text-base leading-relaxed text-slate-600 sm:text-lg">
          Tim kami siap membantu merancang implementasi e-Health yang sesuai dengan kebutuhan organisasi Anda.
        </p>

        <div class="grid gap-4">
          <div class="glass-card rounded-2xl p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">info@e-health.id</p>
          </div>
          <div class="glass-card rounded-2xl p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Telepon</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">+62 812-0000-2026</p>
          </div>
          <div class="glass-card rounded-2xl p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Lokasi</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">Yogyakarta, Indonesia</p>
          </div>
        </div>
      </div>

      <form class="glass-card rounded-3xl p-6 sm:p-8">
        <div class="grid gap-4">
          <div>
            <label for="email" class="text-sm font-semibold text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              placeholder="nama@organisasi.com"
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>
          <div>
            <label for="subject" class="text-sm font-semibold text-slate-700">Topik</label>
            <input
              id="subject"
              type="text"
              placeholder="Contoh: Demo platform"
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>
          <div>
            <label for="message" class="text-sm font-semibold text-slate-700">Pesan</label>
            <textarea
              id="message"
              rows="5"
              placeholder="Ceritakan kebutuhan Anda..."
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            ></textarea>
          </div>
          <button
            type="submit"
            class="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
          >
            Kirim Pesan
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup></script>
