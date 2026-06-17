<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Buat Rujukan</h1>

    <UCard>
      <UForm @submit="submitRujukan" class="space-y-4">
        <UFormGroup label="Tipe Rujukan" required>
          <USelect v-model="form.tipe" :options="['masuk', 'keluar', 'internal']" />
        </UFormGroup>

        <UFormGroup label="Pasien" required>
          <USelectMenu v-model="form.pasienId" :options="pasienList" option-attribute="nama" by="_id" searchable />
        </UFormGroup>

        <UFormGroup v-if="form.tipe === 'keluar'" label="Faskes Tujuan" required>
          <UInput v-model="form.tujuanFaskes" placeholder="Nama faskes tujuan" />
        </UFormGroup>

        <UFormGroup v-if="form.tipe === 'masuk'" label="Faskes Asal">
          <UInput v-model="form.dariFaskes" placeholder="Nama faskes asal" />
        </UFormGroup>

        <UFormGroup label="Diagnosis Rujukan" required>
          <UInput v-model="form.diagnosisRujukan" placeholder="Kode ICD-10 / Diagnosis" />
        </UFormGroup>

        <UFormGroup label="Alasan Rujukan" required>
          <UTextarea v-model="form.alasanRujukan" rows="3" />
        </UFormGroup>

        <UFormGroup label="Ringkasan Klinis">
          <UTextarea v-model="form.ringkasanKlinis" rows="4" />
        </UFormGroup>

        <div class="flex justify-end gap-3 pt-4">
          <UButton variant="outline" @click="navigateTo('/rujukan')">Batal</UButton>
          <UButton type="submit" color="green">Simpan</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const pasienList = ref<any[]>([]);
const form = reactive({
  tipe: "keluar",
  pasienId: null,
  encounterId: null as string | null,
  dariFaskes: "",
  dariFaskesKode: "",
  dariDokter: "",
  tujuanFaskes: "",
  tujuanFaskesKode: "",
  tujuanSpesialis: "",
  diagnosisRujukan: "",
  alasanRujukan: "",
  ringkasanKlinis: "",
  noSuratRujukan: "",
});

async function submitRujukan() {
  await $fetch("/api/rujukan", {
    method: "POST",
    body: form,
  });
  navigateTo("/rujukan");
}

onMounted(async () => {
  const route = useRoute();
  if (route.query.encounterId) {
    form.encounterId = route.query.encounterId as string;
  }
  const res = await $fetch<{ data: any[] }>("/api/pasien");
  pasienList.value = res.data || [];
});
</script>
