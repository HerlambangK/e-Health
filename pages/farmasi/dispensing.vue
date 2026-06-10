<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Dispensing Obat</h1>

    <UCard v-if="resep">
      <template #header>
        <div>
          <h3 class="font-semibold">Resep: {{ resep.noResep }}</h3>
          <p class="text-sm text-gray-500">
            {{ resep.pasienId?.nama }} — dr. {{ resep.dokterId?.namaDokter }}
          </p>
        </div>
      </template>

      <div v-for="(item, idx) in resep.items" :key="idx" class="border-b pb-4 mb-4 last:border-0">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-medium">{{ item.namaObat }} {{ item.kekuatan }}</p>
            <p class="text-sm text-gray-500">{{ item.dosis }} — {{ item.jumlah }} {{ item.satuan }}</p>
            <p v-if="item.instruksi" class="text-xs text-gray-400">{{ item.instruksi }}</p>
          </div>
          <div class="text-right">
            <UFormGroup label="Jumlah Diberikan">
              <UInput v-model="dispenseItems[idx].jumlahDiberikan" type="number" class="w-24" />
            </UFormGroup>
            <UFormGroup label="No. Batch">
              <UInput v-model="dispenseItems[idx].noBatch" class="w-32" />
            </UFormGroup>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="outline" @click="navigateTo('/farmasi')">Batal</UButton>
          <UButton color="green" :loading="loading" @click="konfirmasi">Konfirmasi Dispensing</UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const resep = ref<any>(null);
const dispenseItems = ref<any[]>([]);
const loading = ref(false);

async function konfirmasi() {
  loading.value = true;
  try {
    await $fetch("/api/resep/dispense", {
      method: "POST",
      body: {
        resepId: resep.value._id,
        items: dispenseItems.value.map((item, idx) => ({
          resepItemIndex: idx,
          obatId: resep.value.items[idx].obatId,
          namaObat: resep.value.items[idx].namaObat,
          jumlahDiberikan: item.jumlahDiberikan,
          noBatch: item.noBatch,
          golongan: resep.value.items[idx].golongan,
        })),
      },
    });
    navigateTo("/farmasi");
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const resepId = route.query.resepId as string;
  if (resepId) {
    resep.value = await $fetch(`/api/resep/${resepId}`);
    dispenseItems.value = resep.value.items.map(() => ({ jumlahDiberikan: 1, noBatch: "" }));
  }
});
</script>
