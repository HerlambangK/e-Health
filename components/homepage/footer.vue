<template>
  <footer class="border-t border-slate-200/70 bg-white/80">
    <div class="home-container py-10">
      <div class="grid gap-10 md:grid-cols-[1.4fr,1fr,1fr]">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <Logo class="h-12 w-12" />
            <div>
              <div class="font-display text-lg font-semibold text-slate-900">e-Health</div>
              <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Care OS</div>
            </div>
          </div>
          <p class="text-sm text-slate-600">
            Platform kesehatan terpadu untuk meningkatkan kualitas layanan medis dengan data yang terhubung.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Produk</h3>
          <ul class="mt-4 space-y-2 text-sm text-slate-600">
            <li><a href="#service" class="hover:text-slate-900">Modul Layanan</a></li>
            <li><a href="#about" class="hover:text-slate-900">Tentang Platform</a></li>
            <li><a href="#contact" class="hover:text-slate-900">Konsultasi</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Kontak</h3>
          <ul class="mt-4 space-y-2 text-sm text-slate-600">
            <li>info@e-health.id</li>
            <li>+62 812-0000-2026</li>
            <li>Yogyakarta, Indonesia</li>
          </ul>
        </div>
      </div>

      <div class="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200/70 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
        <span>© 2026 e-Health. All rights reserved.</span>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:text-slate-700">Privacy Policy</a>
          <a href="#" class="hover:text-slate-700">Terms</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup></script>
