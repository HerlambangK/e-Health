<template>
  <div class="diagnosis-search relative">
    <UInput
      v-model="query"
      placeholder="Ketik kode atau nama penyakit..."
      icon="i-heroicons-magnifying-glass"
      :loading="isSearching"
      @input="onSearch"
    />

    <div
      v-if="results.length"
      class="absolute z-50 bg-white border rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto w-full"
    >
      <div
        v-for="icd in results"
        :key="icd.code"
        class="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
        @click="selectDiagnosis(icd)"
      >
        <span class="font-mono text-blue-700 font-bold">{{ icd.code }}</span>
        <span class="ml-2 text-gray-800">{{ icd.display_id }}</span>
        <span class="text-xs text-gray-400 ml-2">{{ icd.display_en }}</span>
      </div>
    </div>

    <div v-if="selected.length" class="mt-2 flex flex-wrap gap-2">
      <UBadge
        v-for="diag in selected"
        :key="diag.code"
        color="blue"
        variant="soft"
        class="cursor-pointer"
        @click="removeDiagnosis(diag.code)"
      >
        {{ diag.code }} — {{ diag.display_id }}
        <template #trailing>
          <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
        </template>
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ICD10Item {
  code: string;
  display_id: string;
  display_en: string;
}

const props = defineProps<{
  modelValue: ICD10Item[];
  maxSelect?: number;
}>();

const emit = defineEmits(["update:modelValue"]);

const query = ref("");
const results = ref<ICD10Item[]>([]);
const isSearching = ref(false);
const selected = computed(() => props.modelValue);

const onSearch = useDebounceFn(async () => {
  if (query.value.length < 2) {
    results.value = [];
    return;
  }
  isSearching.value = true;
  try {
    const data = await $fetch<ICD10Item[]>(`/api/icd/icd10?q=${query.value}&limit=10`);
    results.value = data;
  } finally {
    isSearching.value = false;
  }
}, 300);

function selectDiagnosis(icd: ICD10Item) {
  if (!selected.value.find((d) => d.code === icd.code)) {
    emit("update:modelValue", [...selected.value, icd]);
  }
  query.value = "";
  results.value = [];
}

function removeDiagnosis(code: string) {
  emit("update:modelValue", selected.value.filter((d) => d.code !== code));
}
</script>
