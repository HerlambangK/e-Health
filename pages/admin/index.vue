<template>
  <div class="md:ml-72 min-h-screen bg-gray-50">
    <div class="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 lg:px-8">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary-500">Dashboard</p>
          <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl">Dashboard Admin</h1>
          <p class="text-sm text-gray-500">
            Pantau status pasien, dokter, dan aktivitas terbaru secara real-time.
          </p>
        </div>
        <UButton to="/dashboard" color="primary" variant="soft" icon="i-heroicons-arrow-right-20-solid">
          Lihat Dashboard Pengguna
        </UButton>
      </header>

      <section class="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <UCard class="xl:col-span-2" :ui="{ body: { padding: 'p-5 sm:p-6' } }">
          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Sebaran Pasien</h2>
                <p class="text-sm text-gray-500">
                  Statistik singkat pasien berdasarkan status penanganan hari ini.
                </p>
              </div>
              <UBadge :label="`${totalPatients} pasien`" color="primary" variant="subtle" />
            </div>
            <UMeterGroup :min="0" :max="128" size="md" indicator icon="i-heroicons-minus">
              <UMeter
                v-for="item in patientDistribution"
                :key="item.label"
                :value="item.value"
                :color="item.color"
                :label="item.label"
              />
            </UMeterGroup>
          </div>
        </UCard>

        <UCard class="h-full" :ui="{ body: { padding: 'p-5 sm:p-6' } }">
          <div class="flex h-full flex-col justify-between gap-6">
            <div class="space-y-2">
              <h2 class="text-lg font-semibold text-gray-900">Jumlah Dokter</h2>
              <p class="text-sm text-gray-500">
                Jumlah tenaga medis aktif yang siap menerima pasien.
              </p>
            </div>
            <div>
              <p class="text-4xl font-semibold text-gray-900">{{ totalDoctors }}</p>
              <p class="text-sm text-emerald-600">+2 dokter baru minggu ini</p>
            </div>
            <div class="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
              Perbarui jadwal dan shift dokter secara berkala untuk menjaga kapasitas layanan.
            </div>
          </div>
        </UCard>
      </section>

      <section class="grid grid-cols-1 gap-4 xl:grid-cols-[2fr,1.25fr]">
        <UCard :ui="{ body: { padding: 'p-5 sm:p-6' }, header: { padding: 'px-5 py-4 sm:px-6' } }">
          <template #header>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Distribusi Kunjungan Pasien</h2>
                <p class="text-sm text-gray-500">
                  Visualisasi proporsi layanan yang paling sering digunakan oleh pasien.
                </p>
              </div>
              <UBadge label="Update harian" variant="subtle" color="gray" />
            </div>
          </template>
          <div class="h-full min-h-[320px] w-full">
            <AdminOverview class="h-full" />
          </div>
        </UCard>

        <div class="grid grid-cols-1 gap-4">
          <UCard :ui="{ body: { padding: 'p-5 sm:p-6' }, header: { padding: 'px-5 py-4 sm:px-6' } }">
            <template #header>
              <div class="flex flex-col gap-1">
                <h2 class="text-lg font-semibold text-gray-900">Tren Kunjungan Mingguan</h2>
                <p class="text-sm text-gray-500">
                  Perbandingan pasien rawat inap dan rawat jalan selama 7 hari terakhir.
                </p>
              </div>
            </template>
            <AdmissionsTrend class="h-full" />
          </UCard>

          <UCard :ui="{ body: { padding: 'p-5 sm:p-6' }, header: { padding: 'px-5 py-4 sm:px-6' } }">
            <template #header>
              <div class="flex flex-col gap-1">
                <h2 class="text-lg font-semibold text-gray-900">Kapasitas & Pemanfaatan Unit</h2>
                <p class="text-sm text-gray-500">
                  Pantau sisa kapasitas pada unit kritikal untuk menyeimbangkan beban layanan.
                </p>
              </div>
            </template>
            <UtilizationOverview class="h-full" />
          </UCard>
        </div>
      </section>

      <UCard
        :ui="{
          header: { padding: 'px-5 py-4 sm:px-6' },
          body: { padding: '0' },
          footer: { padding: 'px-5 py-4 sm:px-6' },
        }"
      >
        <template #header>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Data Antrian Pasien</h2>
              <p class="text-sm text-gray-500">
                Kelola daftar pasien yang sedang menunggu tindakan dan pantau statusnya.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UButton size="sm" icon="i-heroicons-user-plus" @click="isPasien = true">
                Tambah Pasien
              </UButton>
              <UButton size="sm" icon="i-heroicons-user-group" color="gray" variant="soft" @click="isDokter = true">
                Tambah Dokter
              </UButton>
            </div>
          </div>
        </template>

        <div
          class="flex flex-col gap-4 border-y border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Cari pasien atau status..."
            class="w-full sm:max-w-sm"
          />

          <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <USelectMenu
              v-model="selectedStatus"
              :options="todoStatus"
              multiple
              placeholder="Status"
              class="w-full sm:w-40"
            />
            <UButton
              icon="i-heroicons-funnel"
              color="gray"
              variant="soft"
              size="sm"
              class="w-full sm:w-auto"
              :disabled="search === '' && selectedStatus.length === 0"
              @click="resetFilters"
            >
              Reset
            </UButton>
          </div>
        </div>

        <div class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Baris per halaman:</span>
            <USelect v-model="pageCount" :options="[3, 5, 10, 20, 30, 40]" size="xs" class="w-24" />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UDropdown v-if="selectedRows.length > 1" :items="actions" :ui="{ width: 'w-36' }">
              <UButton icon="i-heroicons-chevron-down" trailing color="gray" size="xs" variant="soft">
                Tandai sebagai
              </UButton>
            </UDropdown>

            <USelectMenu v-model="selectedColumns" :options="columns" multiple :ui="{ width: 'w-36' }">
              <UButton icon="i-heroicons-view-columns" color="gray" size="xs" variant="soft">
                Kolom
              </UButton>
            </USelectMenu>

            <UTooltip text="Pilih minimal satu data">
              <UButton
                icon="i-heroicons-printer"
                color="gray"
                variant="soft"
                size="xs"
                :disabled="selectedRows.length === 0"
                @click="exportToExcel"
              >
                Cetak
              </UButton>
            </UTooltip>
          </div>
        </div>

        <div class="overflow-x-auto">
          <UTable
            v-model="selectedRows"
            :rows="todos"
            :columns="columnsTable"
            :loading="pending"
            sort-asc-icon="i-heroicons-arrow-up"
            sort-desc-icon="i-heroicons-arrow-down"
            :ui="{ td: { base: 'max-w-[0] truncate align-middle' } }"
            class="min-w-full"
            @select="select"
          >
            <template #completed-data="{ row }">
              <UBadge
                size="xs"
                :label="row.completed ? 'Selesai' : 'Dalam Proses'"
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
        </div>

        <template #footer>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span class="text-sm text-gray-500">
              Menampilkan
              <span class="font-medium text-gray-700">{{ pageFrom }}</span>
              hingga
              <span class="font-medium text-gray-700">{{ pageTo }}</span>
              dari
              <span class="font-medium text-gray-700">{{ pageTotal }}</span>
              data
            </span>

            <UPagination
              v-model="page"
              :page-count="pageCount"
              :total="pageTotal"
              :ui="{
                wrapper: 'flex items-center gap-2',
                rounded: '!rounded-full min-w-[36px] justify-center',
                default: { activeButton: { variant: 'outline' } },
              }"
            />
          </div>
        </template>
      </UCard>
    </div>
  </div>

  <UModal v-model="isPasien" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Form Pasien
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isPasien = false"
          />
        </div>
      </template>
      <FormPasienform @saved="handlePatientSaved" />
    </UCard>
  </UModal>

  <UModal v-model="isDokter" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Form Dokter
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isDokter = false"
          />
        </div>
      </template>
      <FormDoktorform @saved="handleDoctorSaved" />
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: "auth",
});

const patientDistribution = [
  { label: "Rawat inap", value: 24, color: "gray" },
  { label: "ICU / Urgent", value: 8, color: "red" },
  { label: "UGD / Rawat jalan", value: 12, color: "yellow" },
  { label: "Dalam antrian", value: 12, color: "green" },
  { label: "Telah ditangani", value: 42, color: "emerald" },
];
const totalPatients = computed(() =>
  patientDistribution.reduce((total, item) => total + item.value, 0)
);
const totalDoctors = 10;

const isPasien = ref(false);
const isDokter = ref(false);

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
    label: "Tindakan",
    sortable: false,
  },
];

const actions = [
  [
    {
      key: "completed",
      label: "Selesaikan",
      icon: "i-heroicons-check",
    },
  ],
  [
    {
      key: "uncompleted",
      label: "Tandai Proses",
      icon: "i-heroicons-arrow-path",
    },
  ],
];

const todoStatus = [
  {
    key: "uncompleted",
    label: "Dalam Proses",
    value: false,
  },
  {
    key: "completed",
    label: "Selesai",
    value: true,
  },
];

const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);

const selectedRows = ref<any[]>([]);
function select(row: any) {
  const index = selectedRows.value.findIndex((item) => item.id === row.id);
  if (index === -1) {
    selectedRows.value.push(row);
  } else {
    selectedRows.value.splice(index, 1);
  }
}

const search = ref("");
const selectedStatus = ref<any[]>([]);
const searchStatus = computed(() => {
  if (selectedStatus.value.length === 0) {
    return "";
  }

  if (selectedStatus.value.length > 1) {
    return `?completed=${selectedStatus.value[0].value}&completed=${selectedStatus.value[1].value}`;
  }

  return `?completed=${selectedStatus.value[0].value}`;
});

function resetFilters() {
  search.value = "";
  selectedStatus.value = [];
}

function exportToExcel() {
  // Placeholder: implement ekspor Excel bila API tersedia.
}

const page = ref(1);
const pageCount = ref(10);
const pageTotal = ref(200);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() =>
  Math.min(page.value * pageCount.value, pageTotal.value)
);

const { data: todos, pending, refresh: refreshTodos } = await useLazyAsyncData<
  {
    id: number;
    title: string;
    completed: boolean;
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

function handlePatientSaved() {
  isPasien.value = false;
  refreshTodos();
}

function handleDoctorSaved() {
  isDokter.value = false;
  refreshTodos();
}
</script>
