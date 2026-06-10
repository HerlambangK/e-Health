<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Poli</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard
        v-for="poli in poliList"
        :key="poli._id"
        class="cursor-pointer hover:shadow-lg transition-shadow"
        @click="navigateTo(`/poli/${poli._id}`)"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              :style="{ backgroundColor: poli.warna || '#3B82F6' }"
            >
              {{ poli.nama?.charAt(0) }}
            </div>
            <div>
              <h3 class="font-semibold">{{ poli.nama }}</h3>
              <p class="text-sm text-gray-500">{{ poli.kode }}</p>
            </div>
          </div>
        </template>
        <p class="text-sm text-gray-600">{{ poli.deskripsi || poli.lokasi || "-" }}</p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const poliList = ref<any[]>([]);

onMounted(async () => {
  poliList.value = await $fetch("/api/poli");
});
</script>
