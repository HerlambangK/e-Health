<template>
  <UCard class="relative">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="font-semibold">{{ pasien?.pasienId?.nama }}</h3>
        <p class="text-sm text-gray-500">{{ pasien?.noRanap }}</p>
      </div>
      <UBadge :color="pasien?.status === 'active' ? 'green' : 'gray'" :label="pasien?.status" />
    </div>
    <div class="mt-3 text-sm space-y-1">
      <p><strong>Bed:</strong> {{ pasien?.ruangan }} — {{ pasien?.noBed }}</p>
      <p><strong>DPJP:</strong> {{ pasien?.dpjpId?.namaDokter }}</p>
      <p><strong>Diagnosis:</strong> {{ pasien?.diagnosisMasuk }}</p>
      <p>
        <strong>Masuk:</strong>
        {{ pasien?.tanggalMasuk ? new Date(pasien.tanggalMasuk).toLocaleDateString("id-ID") : "-" }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  pasien: any;
}>();
</script>
