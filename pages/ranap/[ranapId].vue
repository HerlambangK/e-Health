<template>
  <div class="p-6">
    <div class="flex items-center gap-4 mb-6">
      <UButton icon="i-heroicons-arrow-left" variant="ghost" @click="navigateTo('/ranap')" />
      <div>
        <h1 class="text-2xl font-bold">{{ ranap?.pasienId?.nama }}</h1>
        <p class="text-sm text-gray-500">Ruangan: {{ ranap?.ruangan }} — Bed: {{ ranap?.noBed }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard>
        <template #header><h3 class="font-semibold">Info Pasien</h3></template>
        <div class="space-y-2 text-sm">
          <p><strong>No. RM:</strong> {{ ranap?.pasienId?.noRM }}</p>
          <p><strong>DPJP:</strong> {{ ranap?.dpjpId?.namaDokter }}</p>
          <p><strong>Diagnosis Masuk:</strong> {{ ranap?.diagnosisMasuk }}</p>
          <p><strong>Tanggal Masuk:</strong> {{ ranap?.tanggalMasuk ? new Date(ranap.tanggalMasuk).toLocaleDateString('id-ID') : '-' }}</p>
          <p><strong>Status:</strong> <UBadge :color="ranap?.status === 'active' ? 'green' : 'gray'" :label="ranap?.status" /></p>
        </div>
      </UCard>

      <UCard>
        <template #header><h3 class="font-semibold">CPPT / Perkembangan</h3></template>
        <p class="text-sm text-gray-400">Catatan Perkembangan Pasien Terintegrasi</p>
      </UCard>

      <UCard>
        <template #header><h3 class="font-semibold">Instruksi DPJP</h3></template>
        <p class="text-sm whitespace-pre-wrap">{{ ranap?.instruksiDpjp || "-" }}</p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const ranap = ref<any>(null);

onMounted(async () => {
  ranap.value = await $fetch(`/api/ranap/${route.params.ranapId}`);
});
</script>
