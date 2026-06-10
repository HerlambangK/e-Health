<template>
  <div class="grid grid-cols-3 gap-3">
    <UFormGroup label="TD Sistol">
      <UInput v-model="localTTV.tekananDarahSistolik" type="number" placeholder="mmHg" />
    </UFormGroup>
    <UFormGroup label="TD Diastol">
      <UInput v-model="localTTV.tekananDarahDiastolik" type="number" placeholder="mmHg" />
    </UFormGroup>
    <UFormGroup label="Nadi">
      <UInput v-model="localTTV.nadi" type="number" placeholder="/menit" />
    </UFormGroup>
    <UFormGroup label="RR">
      <UInput v-model="localTTV.respirasi" type="number" placeholder="/menit" />
    </UFormGroup>
    <UFormGroup label="Suhu">
      <UInput v-model="localTTV.suhu" type="number" step="0.1" placeholder="°C" />
    </UFormGroup>
    <UFormGroup label="SpO2">
      <UInput v-model="localTTV.spo2" type="number" placeholder="%" />
    </UFormGroup>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  ttv?: {
    tekananDarahSistolik?: number;
    tekananDarahDiastolik?: number;
    nadi?: number;
    respirasi?: number;
    suhu?: number;
    spo2?: number;
  };
  editable?: boolean;
}>();

const emit = defineEmits(["save"]);

const localTTV = reactive({
  tekananDarahSistolik: props.ttv?.tekananDarahSistolik || null,
  tekananDarahDiastolik: props.ttv?.tekananDarahDiastolik || null,
  nadi: props.ttv?.nadi || null,
  respirasi: props.ttv?.respirasi || null,
  suhu: props.ttv?.suhu || null,
  spo2: props.ttv?.spo2 || null,
});

watch(
  () => props.ttv,
  (val) => {
    if (val) {
      Object.assign(localTTV, val);
    }
  }
);
</script>
