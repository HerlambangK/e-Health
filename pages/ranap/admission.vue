<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Admisi Rawat Inap</h1>

    <UCard>
      <UForm @submit="submitAdmisi" class="space-y-4">
        <UFormGroup label="Pasien" required>
          <USelectMenu v-model="form.pasienId" :options="pasienList" option-attribute="nama" by="_id" searchable />
        </UFormGroup>

        <UFormGroup label="DPJP" required>
          <USelectMenu v-model="form.dpjpId" :options="dokterList" option-attribute="namaDokter" by="_id" />
        </UFormGroup>

        <UFormGroup label="Ruangan / Bed" required>
          <USelectMenu v-model="form.bedId" :options="availableBeds" option-attribute="nama" by="_id">
            <template #option="{ option }">
              {{ option.ruang }} — {{ option.nama }} ({{ option.kelas }})
            </template>
          </USelectMenu>
        </UFormGroup>

        <UFormGroup label="Diagnosis Masuk (ICD-10)" required>
          <UInput v-model="form.diagnosisMasuk" placeholder="Kode ICD-10" />
        </UFormGroup>

        <UFormGroup label="Kelas Rawat" required>
          <USelect v-model="form.kelasRawat" :options="kelasOptions" />
        </UFormGroup>

        <UFormGroup label="Jenis Pembayaran">
          <USelect v-model="form.jenisPembayaran" :options="['umum', 'BPJS', 'asuransi', 'gratis']" />
        </UFormGroup>

        <UFormGroup v-if="form.jenisPembayaran === 'BPJS'" label="No. SEP">
          <UInput v-model="form.noSEP" />
        </UFormGroup>

        <UFormGroup label="Instruksi Awal">
          <UTextarea v-model="form.instruksiAwal" rows="3" />
        </UFormGroup>

        <div class="flex justify-end gap-3 pt-4">
          <UButton variant="outline" @click="navigateTo('/ranap')">Batal</UButton>
          <UButton type="submit" color="green" :loading="loading">Admisi</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false);
const pasienList = ref<any[]>([]);
const dokterList = ref<any[]>([]);
const availableBeds = ref<any[]>([]);

const kelasOptions = ["VIP", "I", "II", "III", "HCU", "ICU", "PICU", "NICU"];

const form = reactive({
  pasienId: null,
  dpjpId: null,
  bedId: null,
  diagnosisMasuk: "",
  kelasRawat: "III",
  jenisPembayaran: "umum",
  noSEP: "",
  instruksiAwal: "",
  encounterId: null as string | null,
  noKamar: "",
});

async function submitAdmisi() {
  loading.value = true;
  try {
    await $fetch("/api/ranap/admission", {
      method: "POST",
      body: form,
    });
    navigateTo("/ranap");
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const route = useRoute();
  if (route.query.encounterId) {
    form.encounterId = route.query.encounterId as string;
  }

  pasienList.value = await $fetch("/api/pasien");
  dokterList.value = await $fetch("/api/dokter");
  const bedData = await $fetch("/api/ranap/bed", { params: { status: "available" } });
  availableBeds.value = bedData.data.beds || [];
});
</script>
