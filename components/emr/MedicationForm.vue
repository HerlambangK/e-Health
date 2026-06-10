<template>
  <div>
    <div v-for="(item, idx) in localItems" :key="idx" class="border-b pb-4 mb-4 last:border-0">
      <div class="flex justify-between items-start mb-2">
        <span class="font-medium text-sm">Obat #{{ idx + 1 }}</span>
        <UButton icon="i-heroicons-trash" color="red" variant="ghost" size="xs" @click="removeItem(idx)" />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <UFormGroup label="Nama Obat">
          <UInput v-model="item.namaObat" placeholder="Nama obat" />
        </UFormGroup>
        <UFormGroup label="Kekuatan">
          <UInput v-model="item.kekuatan" placeholder="500mg" />
        </UFormGroup>
        <UFormGroup label="Dosis">
          <UInput v-model="item.dosis" placeholder="3 x 1" />
        </UFormGroup>
        <UFormGroup label="Jumlah">
          <UInput v-model="item.jumlah" type="number" />
        </UFormGroup>
        <UFormGroup label="Satuan">
          <UInput v-model="item.satuan" placeholder="tablet/kapsul" />
        </UFormGroup>
        <UFormGroup label="Rute">
          <USelect
            v-model="item.rute"
            :options="['oral','iv','im','sc','topical','inhalasi','sublingual','rektal','tetes_mata','tetes_telinga']"
          />
        </UFormGroup>
        <UFormGroup label="Golongan">
          <USelect
            v-model="item.golongan"
            :options="['antibiotik','analgesic','antihipertensi','antidiabetik','bronkodilator','narkotika','psikotropika','lainnya']"
          />
        </UFormGroup>
        <UFormGroup label="Instruksi">
          <UInput v-model="item.instruksi" placeholder="Sesudah makan" />
        </UFormGroup>
      </div>
    </div>
    <p v-if="!localItems.length" class="text-sm text-gray-400 text-center py-4">
      Belum ada obat. Klik "Tambah Obat" untuk menambah resep.
    </p>
  </div>
</template>

<script setup lang="ts">
interface MedicationItem {
  namaObat: string;
  kekuatan?: string;
  dosis: string;
  jumlah: number;
  satuan: string;
  rute: string;
  golongan: string;
  instruksi?: string;
}

const props = defineProps<{
  modelValue: MedicationItem[];
}>();

const emit = defineEmits(["update:modelValue"]);

const localItems = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function removeItem(idx: number) {
  const items = [...localItems.value];
  items.splice(idx, 1);
  emit("update:modelValue", items);
}
</script>
