<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-4">
        <div>
          <h2 class="font-bold text-gray-900">{{ encounter?.pasienId?.nama || "Pasien" }}</h2>
          <p class="text-sm text-gray-500">
            {{ encounter?.pasienId?.noRM }} · {{ encounter?.jenisPembayaran }}
          </p>
        </div>
        <UBadge :label="encounter?.status" color="blue" />
        <SatusehatSyncStatus :status="encounter?.fhirSyncStatus" />
      </div>
      <div class="flex gap-2">
        <UButton v-if="!isRawatInap" variant="outline" color="orange" @click="rawatInap">Rawat Inap</UButton>
        <UButton v-if="!isRujuk" variant="outline" @click="buatRujukan">Rujuk</UButton>
        <UButton color="green" @click="tutupEncounter">Selesai</UButton>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <div class="grid grid-cols-2 gap-4 h-full">
        <div class="space-y-4">
          <UCard>
            <template #header><h3 class="font-semibold">Tanda Vital</h3></template>
            <div class="grid grid-cols-2 gap-3">
              <UFormGroup label="TD (mmHg)">
                <div class="flex gap-2">
                  <UInput v-model="ttv.tekananDarahSistolik" placeholder="Sistol" type="number" />
                  <UInput v-model="ttv.tekananDarahDiastolik" placeholder="Diastol" type="number" />
                </div>
              </UFormGroup>
              <UFormGroup label="Nadi (/menit)">
                <UInput v-model="ttv.nadi" type="number" />
              </UFormGroup>
              <UFormGroup label="RR (/menit)">
                <UInput v-model="ttv.respirasi" type="number" />
              </UFormGroup>
              <UFormGroup label="Suhu (°C)">
                <UInput v-model="ttv.suhu" type="number" step="0.1" />
              </UFormGroup>
              <UFormGroup label="SpO2 (%)">
                <UInput v-model="ttv.spo2" type="number" />
              </UFormGroup>
            </div>
          </UCard>

          <UCard>
            <template #header><h3 class="font-semibold">Subjektif / Anamnesis</h3></template>
            <div class="space-y-3">
              <UFormGroup label="Keluhan Utama">
                <UTextarea v-model="soap.keluhanUtama" rows="2" />
              </UFormGroup>
              <UFormGroup label="Riwayat Penyakit Sekarang">
                <UTextarea v-model="soap.rps" rows="4" />
              </UFormGroup>
              <UFormGroup label="Riwayat Penyakit Dahulu">
                <UTextarea v-model="soap.rpd" rows="2" />
              </UFormGroup>
            </div>
          </UCard>

          <UCard>
            <template #header><h3 class="font-semibold">Pemeriksaan Fisik</h3></template>
            <UTextarea v-model="soap.pemFisik" rows="5" placeholder="Keadaan umum, kesadaran, sistem organ..." />
          </UCard>
        </div>

        <div class="space-y-4">
          <UCard>
            <template #header><h3 class="font-semibold">Diagnosis (ICD-10)</h3></template>
            <div class="space-y-3">
              <UFormGroup label="Diagnosis Utama">
                <EmrDiagnosisSearch v-model="diagnosisUtama" :max-select="1" />
              </UFormGroup>
              <UFormGroup label="Diagnosis Sekunder">
                <EmrDiagnosisSearch v-model="diagnosisLain" />
              </UFormGroup>
            </div>
          </UCard>

          <UCard>
            <template #header><h3 class="font-semibold">Tindakan (ICD-9CM)</h3></template>
            <EmrTindakanSearch v-model="tindakanList" />
          </UCard>

          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="font-semibold">Resep</h3>
                <UButton size="xs" icon="i-heroicons-plus" @click="tambahObat">Tambah Obat</UButton>
              </div>
            </template>
            <EmrMedicationForm v-model="resepItems" />
          </UCard>

          <UCard>
            <template #header><h3 class="font-semibold">Plan</h3></template>
            <div class="space-y-3">
              <UFormGroup label="Instruksi">
                <UTextarea v-model="soap.instruksi" rows="3" />
              </UFormGroup>
              <UFormGroup label="Kontrol Kembali">
                <UInput v-model="soap.followUp" type="date" />
              </UFormGroup>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const encounterId = route.params.encounterId as string;
const encounter = ref<any>(null);
const isRawatInap = ref(false);
const isRujuk = ref(false);

const ttv = reactive({ tekananDarahSistolik: null, tekananDarahDiastolik: null, nadi: null, respirasi: null, suhu: null, spo2: null });
const soap = reactive({ keluhanUtama: "", rps: "", rpd: "", pemFisik: "", instruksi: "", followUp: "" });
const diagnosisUtama = ref<any[]>([]);
const diagnosisLain = ref<any[]>([]);
const tindakanList = ref<any[]>([]);
const resepItems = ref<any[]>([]);

async function tutupEncounter() {
  await $fetch(`/api/encounter/close`, {
    method: "POST",
    body: { encounterId },
  });
  navigateTo("/poli");
}

async function rawatInap() {
  navigateTo(`/ranap/admission?encounterId=${encounterId}`);
}

async function buatRujukan() {
  navigateTo(`/rujukan/buat?encounterId=${encounterId}`);
}

function tambahObat() {
  resepItems.value.push({ namaObat: "", dosis: "", jumlah: 1, satuan: "", rute: "oral", golongan: "lainnya" });
}

onMounted(async () => {
  encounter.value = await $fetch(`/api/encounter/${encounterId}`);
});
</script>
