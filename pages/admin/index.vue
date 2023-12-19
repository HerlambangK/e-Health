<template>
  <div
    class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div className="flex item-center">
      <h2
        className="mr-2 text-2xl mt-6 font-semibold tracking-tight text-center"
      >
        Dashboard Admin
      </h2>
    </div>
    <div class="w-full flex flex-row mt-6 gap-2">
      <div
        class="w-1/2 p-8 mx-auto shadow-md rounded-lg border py-10 flex-col justify-center items-center"
      >
        <h2 class="font-semibold text-lg">Jumlah Pasien</h2>
        <!-- <h3>10</h3> -->
        <UMeterGroup
          :min="0"
          :max="128"
          size="md"
          indicator
          icon="i-heroicons-minus"
        >
          <UMeter :value="24" color="gray" label="Rawat inap" />
          <UMeter :value="8" color="red" label="ICU / Urgent" />
          <UMeter :value="12" color="yellow" label="UGD / Rawat jalan" />
          <UMeter :value="12" color="green" label="On Going / Dalam antrian" />
          <UMeter :value="42" color="green" label="Telah ditanggani" />
          <!-- Total: 86 -->
        </UMeterGroup>
      </div>

      <div
        class="w-1/2 p-8 mx-auto shadow-md rounded-lg border py-10 flex-col justify-center items-center"
      >
        <h2 class="font-semibold text-lg">Jumlah Dokter</h2>
        <h3>10</h3>
      </div>
    </div>
    <div
      class="w-full mt-6 p-8 mx-auto shadow-md rounded-lg border py-3 flex-col justify-center items-center"
    >
      <h2 class="font-semibold text-lg">information</h2>
      <AdminOverview />
    </div>
  </div>

  <div
    class="md:ml-72 mt-3 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div class="w-full mt-12">
      <h1 class="font-semibold text-2xl text-center">Data Antrian Pasien</h1>
      <div class="flex flex-row justify-between my-6">
        <!-- <UButton type="primary" @click="isTrue = true" label="Tambah" /> -->
        <UButton label="Tambah Pasien" @click="isPasien = true" />

        <UModal v-model="isPasien">
          <UCard
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="">Form pasien</div>
            </template>

            <FormPasien />

            <template #footer>
              <Placeholder class="h-8" />
            </template>
          </UCard>
        </UModal>
        <UButton>Tambah Dokter</UButton>
      </div>
    </div>
    <UCard
      class="w-full"
      :ui="{
        base: '',
        ring: '',
        divide: 'divide-y divide-gray-200 dark:divide-gray-700',
        header: { padding: 'px-4 py-5' },
        body: {
          padding: '',
          base: 'divide-y divide-gray-200 dark:divide-gray-700',
        },
        footer: { padding: 'p-4' },
      }"
    >
      <template #header>
        <h2
          class="font-semibold text-xl text-gray-900 dark:text-white leading-tight"
        >
          Todos
        </h2>
      </template>

      <!-- Filters -->
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Search..."
        />

        <USelectMenu
          v-model="selectedStatus"
          :options="todoStatus"
          multiple
          placeholder="Status"
          class="w-40"
        />
      </div>

      <!-- Header and Action buttons -->
      <div
        class="flex flex-col md:flex-row justify-between items-center w-full px-4 py-3"
      >
        <div class="flex flex-col md:flex-row items-center gap-1.5">
          <span class="text-sm leading-5">Rows per page:</span>

          <USelect
            v-model="pageCount"
            :options="[3, 5, 10, 20, 30, 40]"
            class="w-64 md:w-20 flex justify-center mt-1"
            size="xs"
          />
        </div>

        <div class="flex flex-col md:flex-row gap-1.5 items-center">
          <UDropdown
            v-if="selectedRows.length > 1"
            :items="actions"
            :ui="{ width: 'w-36' }"
          >
            <UButton
              icon="i-heroicons-chevron-down"
              trailing
              color="gray"
              size="xs"
            >
              Mark as
            </UButton>
          </UDropdown>

          <USelectMenu
            v-model="selectedColumns"
            :options="columns"
            multiple
            :ui="{ width: 'w-36' }"
          >
            <UButton
              icon="i-heroicons-view-columns"
              color="gray"
              size="xs"
              class="w-64 md:w-20 flex justify-center mt-1"
            >
              Columns
            </UButton>
          </USelectMenu>

          <UButton
            icon="i-heroicons-funnel"
            color="gray"
            size="xs"
            class="w-64 md:w-20 flex justify-center mt-1"
            :disabled="search === '' && selectedStatus.length === 0"
            @click="resetFilters"
          >
            Reset
          </UButton>
          <UButton
            icon="i-heroicons-printer"
            color="gray"
            size="xs"
            class="w-64 md:w-20 flex justify-center mt-1"
            :disabled="selectedRows.length === 0"
            @click="exportToExcel"
          >
            <UTooltip text="Please select one or more data"> Print </UTooltip>
          </UButton>
        </div>
      </div>

      <!-- Table -->
      <UTable
        v-model="selectedRows"
        :rows="todos"
        :columns="columnsTable"
        :loading="pending"
        sort-asc-icon="i-heroicons-arrow-up"
        sort-desc-icon="i-heroicons-arrow-down"
        class="w-full"
        :ui="{ td: { base: 'max-w-[0] truncate' } }"
        @select="select"
      >
        <template #completed-data="{ row }">
          <UBadge
            size="xs"
            :label="row.completed ? 'Completed' : 'In Progress'"
            :color="row.completed ? 'emerald' : 'orange'"
            variant="subtle"
          />
        </template>

        <template #actions-data="{ row }">
          <UButton
            v-if="!row.completed"
            icon="i-heroicons-check"
            size="2xs"
            color="emerald"
            variant="outline"
            :ui="{ rounded: 'rounded-full' }"
            square
          />

          <UButton
            v-else
            icon="i-heroicons-arrow-path"
            size="2xs"
            color="orange"
            variant="outline"
            :ui="{ rounded: 'rounded-full' }"
            square
          />
        </template>
      </UTable>

      <!-- Number of rows & Pagination -->
      <template #footer>
        <div class="flex flex-wrap justify-between items-center">
          <div>
            <span class="text-sm leading-5">
              Showing
              <span class="font-medium">{{ pageFrom }}</span>
              to
              <span class="font-medium">{{ pageTo }}</span>
              of
              <span class="font-medium">{{ pageTotal }}</span>
              results
            </span>
          </div>

          <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="pageTotal"
            :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: '!rounded-full min-w-[32px] justify-center',
              default: {
                activeButton: {
                  variant: 'outline',
                },
              },
            }"
          />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from "xlsx";
// import FormPasien from "../../components/form/pasien.vue";

definePageMeta({
  layout: "default",
});
const isPasien = ref(false);
// Columns
const columns = [
  {
    key: "id",
    label: "#",
    sortable: true,
  },
  {
    key: "title",
    label: "Nama",
    sortable: true,
  },
  {
    key: "completed",
    label: "Status",
    sortable: true,
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
  },
];
// Actions
const actions = [
  [
    {
      key: "completed",
      label: "Completed",
      icon: "i-heroicons-check",
    },
  ],
  [
    {
      key: "uncompleted",
      label: "In Progress",
      icon: "i-heroicons-arrow-path",
    },
  ],
];

// Filters
const todoStatus = [
  {
    key: "uncompleted",
    label: "In Progress",
    value: false,
  },
  {
    key: "completed",
    label: "Completed",
    value: true,
  },
];
const isOpen = ref(false);

const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);
console.log(selectedColumns);

const TambahPasien = () => {
  const router = useRouter();
  router.push("/form-pasien");
};
// Selected Rows
const selectedRows = ref([]);

function select(row: any) {
  const index = selectedRows.value.findIndex((item: any) => item.id === row.id);
  if (index === -1) {
    // console.log("selectedRows.value", selectedRows);
    selectedRows.value.push(row);
  } else {
    selectedRows.value.splice(index, 1);
  }
}

const search = ref("");
const selectedStatus = ref([]);
const searchStatus = computed(() => {
  if (selectedStatus.value?.length === 0) {
    return "";
  }

  if (selectedStatus?.value?.length > 1) {
    return `?completed=${selectedStatus.value[0].value}&completed=${selectedStatus.value[1].value}`;
  }

  return `?completed=${selectedStatus.value[0].value}`;
});

const resetFilters = () => {
  search.value = "";
  selectedStatus.value = [];
};

const exportToExcel = () => {
  const data = selectedRows.value.map((row: any) => ({
    ID: row.id,
    Title: row.title,
    Completed: row.completed,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
  XLSX.writeFile(wb, "your_document_patinet.xlsx");
};
// Pagination
const page = ref(1);
const pageCount = ref(10);
const pageTotal = ref(200); // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() =>
  Math.min(page.value * pageCount.value, pageTotal.value)
);

// Data
const { data: todos, pending } = await useLazyAsyncData<
  {
    id: number;
    title: string;
    completed: string;
  }[]
>(
  "todos",
  () =>
    ($fetch as any)(
      `https://jsonplaceholder.typicode.com/todos${searchStatus.value}`,
      {
        query: {
          q: search.value,
          _page: page.value,
          _limit: pageCount.value,
        },
      }
    ),
  {
    default: () => [],
    watch: [page, search, searchStatus, pageCount],
  }
);
</script>
