<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4">
    <div class="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
    <div class="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-100/30 blur-3xl" />

    <div class="relative mx-auto max-w-lg text-center">
      <div class="mb-6 flex justify-center">
        <div class="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 backdrop-blur">
          <span class="text-5xl font-bold" :class="is404 ? 'text-emerald-500' : 'text-amber-500'">
            {{ is404 ? '404' : '500' }}
          </span>
        </div>
      </div>

      <h1 class="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
        {{ is404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan' }}
      </h1>
      <p class="mt-3 text-base leading-relaxed text-slate-500">
        {{ is404 ? 'Halaman yang kamu cari mungkin telah dipindah, diganti nama, atau tidak tersedia.' : 'Maaf, terjadi kesalahan pada sistem. Silakan coba lagi.' }}
      </p>

      <div v-if="error?.statusMessage" class="mt-4">
        <p class="text-sm text-slate-400 italic">"{{ error.statusMessage }}"</p>
      </div>

      <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <UButton
          color="primary"
          size="lg"
          icon="i-heroicons-arrow-left"
          @click="handleGoHome"
        >
          Kembali ke Beranda
        </UButton>
        <UButton
          v-if="!is404"
          color="white"
          variant="solid"
          size="lg"
          icon="i-heroicons-arrow-path"
          @click="handleRetry"
        >
          Coba Lagi
        </UButton>
      </div>

      <p v-if="is404" class="mt-8 text-xs text-slate-400">
        Jika menurutmu ini adalah kesalahan, hubungi tim administrasi.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: {
    type: Object,
    default: () => ({})
  }
});

useHead({
  title: computed(() =>
    props.error?.statusCode === 404 ? "404 - Halaman tidak ditemukan" : "Terjadi kesalahan"
  ),
});

const is404 = computed(() =>
  props.error?.statusCode === 404
);

async function handleGoHome() {
  return await navigateTo("/");
}

function handleRetry() {
  clearError({ redirect: "/" });
}
</script>

<style>
body {
  @apply bg-white;
}
</style>
