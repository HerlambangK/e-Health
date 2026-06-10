<template>
  <div class="tindakan-search relative">
    <UInput
      v-model="query"
      placeholder="Ketik kode atau nama tindakan..."
      icon="i-heroicons-magnifying-glass"
      :loading="isSearching"
      @input="onSearch"
    />

    <div
      v-if="results.length"
      class="absolute z-50 bg-white border rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto w-full"
    >
      <div
        v-for="item in results"
        :key="item.code"
        class="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
        @click="selectTindakan(item)"
      >
        <span class="font-mono text-purple-700 font-bold">{{ item.code }}</span>
        <span class="ml-2 text-gray-800">{{ item.display_id }}</span>
      </div>
    </div>

    <div v-if="selected.length" class="mt-2 flex flex-wrap gap-2">
      <UBadge
        v-for="t in selected"
        :key="t.code"
        color="purple"
        variant="soft"
        class="cursor-pointer"
        @click="removeTindakan(t.code)"
      >
        {{ t.code }} — {{ t.display_id }}
        <template #trailing>
          <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
        </template>
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ICD9CMItem {
  code: string;
  display_id: string;
}

const props = defineProps<{
  modelValue: ICD9CMItem[];
}>();

const emit = defineEmits(["update:modelValue"]);

const query = ref("");
const results = ref<ICD9CMItem[]>([]);
const isSearching = ref(false);
const selected = computed(() => props.modelValue);

const onSearch = useDebounceFn(async () => {
  if (query.value.length < 2) {
    results.value = [];
    return;
  }
  isSearching.value = true;
  try {
    const data = await $fetch<ICD9CMItem[]>(`/api/icd/icd9cm?q=${query.value}&limit=10`);
    results.value = data;
  } finally {
    isSearching.value = false;
  }
}, 300);

function selectTindakan(item: ICD9CMItem) {
  if (!selected.value.find((t) => t.code === item.code)) {
    emit("update:modelValue", [...selected.value, item]);
  }
  query.value = "";
  results.value = [];
}

function removeTindakan(code: string) {
  emit("update:modelValue", selected.value.filter((t) => t.code !== code));
}
</script>
