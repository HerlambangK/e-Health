<template>
  <div class="pb-10 flex-grow space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Riwayat Email Blast</h2>
        <p class="text-sm text-gray-500">Seluruh campaign email blast yang pernah dikirim.</p>
      </div>
      <NuxtLink to="/admin/email-blast">
        <UButton size="sm" color="primary" variant="soft" icon="i-heroicons-paper-airplane">
          Kirim Blast Baru
        </UButton>
      </NuxtLink>
    </div>

    <div v-if="activeCampaign" class="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-amber-800">{{ activeCampaign.name }}</h3>
            <UBadge color="amber" variant="soft" size="xs">Sedang Berjalan</UBadge>
          </div>
          <div class="mt-3">
            <UProgress :value="activeCampaign.progressPercent" color="amber" size="md" />
          </div>
          <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-700">
            <span>Terkirim: <strong>{{ activeCampaign.sent }}</strong> / {{ activeCampaign.total }}</span>
            <span v-if="activeCampaign.failed > 0">Gagal: <strong class="text-red-600">{{ activeCampaign.failed }}</strong></span>
            <span v-if="activeCampaign.skipped > 0">Skip: {{ activeCampaign.skipped }}</span>
          </div>
        </div>
        <div>
          <UButton size="xs" color="gray" variant="soft" @click="pollForActive">
            Segarkan
          </UButton>
        </div>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UCard :ui="{ body: { padding: 'p-4 sm:p-5' } }">
        <div class="text-xs text-gray-500">Total Campaign</div>
        <div class="mt-1 text-2xl font-bold text-gray-900">{{ stats.total }}</div>
      </UCard>
      <UCard :ui="{ body: { padding: 'p-4 sm:p-5' } }">
        <div class="text-xs text-gray-500">Total Terkirim</div>
        <div class="mt-1 text-2xl font-bold text-emerald-600">{{ stats.totalSent }}</div>
      </UCard>
      <UCard :ui="{ body: { padding: 'p-4 sm:p-5' } }">
        <div class="text-xs text-gray-500">Total Gagal</div>
        <div class="mt-1 text-2xl font-bold text-rose-600">{{ stats.totalFailed }}</div>
      </UCard>
      <UCard :ui="{ body: { padding: 'p-4 sm:p-5' } }">
        <div class="text-xs text-gray-500">Success Rate</div>
        <div class="mt-1 text-2xl font-bold text-gray-900">{{ stats.successRate }}%</div>
      </UCard>
    </div>

    <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-2">
          <UButton
            v-for="tab in statusTabs"
            :key="tab.value"
            size="xs"
            :color="statusFilter === tab.value ? 'primary' : 'gray'"
            :variant="statusFilter === tab.value ? 'solid' : 'soft'"
            @click="setStatusFilter(tab.value)"
          >
            {{ tab.label }}
          </UButton>
        </div>
        <div class="flex items-center gap-2">
          <UInput
            v-model="searchQuery"
            size="xs"
            placeholder="Cari campaign..."
            icon="i-heroicons-magnifying-glass"
            class="w-full sm:w-56"
          />
          <USelect v-model="pageSize" :options="[5, 10, 20, 50]" size="xs" class="w-20" />
        </div>
      </div>

      <div class="mt-4 w-full overflow-x-auto">
        <UTable
          :rows="campaigns"
          :columns="tableColumns"
          :loading="loading"
          :empty-state="{ icon: 'i-heroicons-inbox', label: 'Belum ada campaign' }"
        >
          <template #name-data="{ row }">
            <div>
              <div class="text-sm font-medium text-gray-800 truncate max-w-[280px]">{{ row.name }}</div>
              <div class="text-xs text-gray-400">{{ formatDateTime(row.createdAt) }}</div>
            </div>
          </template>
          <template #status-data="{ row }">
            <UBadge
              :color="row.status === 'done' ? 'green' : row.status === 'cancelled' ? 'red' : 'amber'"
              variant="soft"
              size="xs"
              :label="row.status === 'done' ? 'Selesai' : row.status === 'cancelled' ? 'Dibatalkan' : 'Berjalan'"
            />
          </template>
          <template #progress-data="{ row }">
            <div class="flex items-center gap-2 min-w-[120px]">
              <UProgress :value="row.progressPercent" size="xs" class="flex-1" :color="row.status === 'done' ? 'green' : row.status === 'cancelled' ? 'red' : 'primary'" />
              <span class="text-xs text-gray-500 w-8 text-right">{{ row.progressPercent }}%</span>
            </div>
          </template>
          <template #sent-data="{ row }">
            <div class="text-right">
              <div class="text-sm font-semibold text-emerald-600">{{ row.sent }}</div>
              <div class="text-xs text-gray-400">/{{ row.total }}</div>
            </div>
          </template>
          <template #failed-data="{ row }">
            <span :class="row.failed > 0 ? 'text-sm font-semibold text-rose-600' : 'text-sm text-gray-400'">
              {{ row.failed }}
            </span>
          </template>
          <template #duration-data="{ row }">
            <span class="text-xs text-gray-500">{{ row.duration != null ? formatDuration(row.duration) : '-' }}</span>
          </template>
          <template #templateSubject-data="{ row }">
            <span class="text-xs text-gray-500 max-w-[180px] truncate block">{{ row.templateSubject || '-' }}</span>
          </template>
          <template #actions-data="{ row }">
            <UButton
              size="xs"
              color="gray"
              variant="soft"
              icon="i-heroicons-eye"
              @click="openLogDetail(row)"
            >
              Detail
            </UButton>
          </template>
        </UTable>
      </div>

      <div class="mt-4 flex justify-center">
        <UPagination
          v-model="page"
          :page-count="pageSize"
          :total="total"
          :ui="{ wrapper: 'flex flex-wrap items-center gap-2' }"
        />
      </div>
    </div>

    <UModal v-model="logModalOpen" :ui="{ width: 'sm:max-w-5xl' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Detail Log — {{ logCampaign?.name }}
            </h3>
            <p class="text-xs text-gray-500">
              Terkirim: {{ logSentCount }} · Gagal: {{ logFailedCount }} · Total: {{ logTotal }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              size="xs"
              color="gray"
              variant="soft"
              :loading="logExportLoading"
              @click="exportLogCSV"
            >
              Export CSV
            </UButton>
            <UButton
              size="xs"
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="logModalOpen = false"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div class="flex items-center gap-2">
            <UButton
              v-for="tab in logStatusTabs"
              :key="tab.value"
              size="xs"
              :color="logStatusFilter === tab.value ? 'primary' : 'gray'"
              :variant="logStatusFilter === tab.value ? 'solid' : 'soft'"
              @click="setLogFilter(tab.value)"
            >
              {{ tab.label }}
            </UButton>
          </div>
          <UInput
            v-model="logSearch"
            size="xs"
            placeholder="Cari email, nama, lowongan..."
            icon="i-heroicons-magnifying-glass"
            class="w-full sm:w-64"
          />
        </div>

        <div class="w-full overflow-x-auto">
          <UTable
            :rows="logItems"
            :columns="logColumns"
            :loading="logLoading"
            :empty-state="{ icon: 'i-heroicons-inbox', label: 'Tidak ada log' }"
          >
            <template #status-data="{ row }">
              <UBadge
                :color="row.status === 'sent' ? 'green' : row.status === 'failed' ? 'red' : 'gray'"
                variant="soft"
                size="xs"
                :label="row.status === 'sent' ? 'Terkirim' : row.status === 'failed' ? 'Gagal' : 'Skip'"
              />
            </template>
            <template #error-data="{ row }">
              <span class="text-xs text-red-500 max-w-[200px] truncate block">{{ row.error || "-" }}</span>
            </template>
            <template #waktu-data="{ row }">
              <span class="text-xs whitespace-nowrap">
                {{ formatDateTime(row.sentAt || row.failedAt || row.createdAt) }}
              </span>
            </template>
          </UTable>
        </div>

        <div class="mt-4 flex justify-center">
          <UPagination
            v-model="logPage"
            :page-count="logPageSize"
            :total="logTotal"
          />
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});

const toast = useToast();
const loading = ref(false);
const campaigns = ref<any[]>([]);
const activeCampaign = ref<any>(null);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const statusFilter = ref("all");
const searchQuery = ref("");

const stats = computed(() => {
  const totalSent = campaigns.value.reduce((sum, c) => sum + (c.sent || 0), 0);
  const totalFailed = campaigns.value.reduce((sum, c) => sum + (c.failed || 0), 0);
  const allSent = totalSent + totalFailed;
  const successRate = allSent > 0 ? Math.round((totalSent / allSent) * 100) : 0;
  return {
    total: total.value,
    totalSent,
    totalFailed,
    successRate,
  };
});

const statusTabs = [
  { label: "Semua", value: "all" },
  { label: "Selesai", value: "done" },
  { label: "Dibatalkan", value: "cancelled" },
];

const tableColumns = [
  { key: "name", label: "Campaign" },
  { key: "templateSubject", label: "Subject" },
  { key: "status", label: "Status" },
  { key: "progress", label: "Progres" },
  { key: "sent", label: "Terkirim", class: "text-right" },
  { key: "failed", label: "Gagal", class: "text-right" },
  { key: "duration", label: "Durasi" },
  { key: "actions", label: "" },
];

function formatDateTime(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds} detik`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins} m ${secs} d`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs} j ${remainMins} m`;
}

async function loadCampaigns() {
  loading.value = true;
  try {
    const params: Record<string, any> = {
      page: page.value,
      pageSize: pageSize.value,
    };
    if (statusFilter.value !== "all") {
      params.status = statusFilter.value;
    }
    if (searchQuery.value.trim()) {
      params.q = searchQuery.value.trim();
    }

    const res: any = await $fetch("/api/admin/email-blast/campaigns", { params });
    campaigns.value = res?.data?.campaigns || [];
    total.value = res?.data?.total || 0;
    activeCampaign.value = res?.data?.active || null;
  } catch (error: any) {
    campaigns.value = [];
    total.value = 0;
    toast.add({
      title: "Gagal memuat campaign",
      description: error?.data?.error?.message || "Coba lagi.",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
}

function setStatusFilter(value: string) {
  statusFilter.value = value;
  page.value = 1;
  loadCampaigns();
}

function pollForActive() {
  loadCampaigns();
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    loadCampaigns();
  }, 400);
});

watch([page, pageSize], () => {
  loadCampaigns();
});

onMounted(() => {
  loadCampaigns();
});

const logModalOpen = ref(false);
const logCampaign = ref<any>(null);
const logItems = ref<any[]>([]);
const logLoading = ref(false);
const logExportLoading = ref(false);
const logStatusFilter = ref("all");
const logSearch = ref("");
const logPage = ref(1);
const logPageSize = ref(20);
const logTotal = ref(0);
const logSentCount = ref(0);
const logFailedCount = ref(0);

const logStatusTabs = [
  { label: "Semua", value: "all" },
  { label: "Terkirim", value: "sent" },
  { label: "Gagal", value: "failed" },
];

const logColumns = [
  { key: "recipientEmail", label: "Email" },
  { key: "recipientName", label: "Nama" },
  { key: "recipientData.lowongan", label: "Lowongan" },
  { key: "status", label: "Status" },
  { key: "error", label: "Error" },
  { key: "waktu", label: "Waktu" },
];

function openLogDetail(campaign: any) {
  logCampaign.value = campaign;
  logStatusFilter.value = "all";
  logSearch.value = "";
  logPage.value = 1;
  logModalOpen.value = true;
  fetchLogs();
}

function setLogFilter(status: string) {
  logStatusFilter.value = status;
  logPage.value = 1;
  fetchLogs();
}

async function fetchLogs() {
  if (!logCampaign.value?.campaignId) return;
  logLoading.value = true;
  try {
    const params: Record<string, any> = {
      campaignId: logCampaign.value.campaignId,
      page: logPage.value,
      pageSize: logPageSize.value,
    };
    if (logStatusFilter.value !== "all") {
      params.status = logStatusFilter.value;
    }
    if (logSearch.value.trim()) {
      params.q = logSearch.value.trim();
    }
    const res: any = await $fetch("/api/admin/email-blast/logs", { params });
    logItems.value = res?.data?.items || [];
    logTotal.value = res?.data?.total || 0;
    logSentCount.value = res?.data?.sentCount || 0;
    logFailedCount.value = res?.data?.failedCount || 0;
  } catch {
    logItems.value = [];
    logTotal.value = 0;
  } finally {
    logLoading.value = false;
  }
}

async function exportLogCSV() {
  if (!logCampaign.value?.campaignId) return;
  logExportLoading.value = true;
  try {
    const params: Record<string, any> = {
      campaignId: logCampaign.value.campaignId,
    };
    if (logStatusFilter.value !== "all") {
      params.status = logStatusFilter.value;
    }
    const res: any = await $fetch("/api/admin/email-blast/logs/export", { params });
    const csv = res?.data?.csv;
    const filename = res?.data?.filename || "email_logs.csv";

    if (csv) {
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.add({
        title: "Export berhasil",
        description: `${res?.data?.total || 0} data log diunduh sebagai CSV.`,
        color: "green",
      });
    }
  } catch {
    toast.add({
      title: "Export gagal",
      description: "Gagal mengekspor log email. Coba lagi.",
      color: "red",
    });
  } finally {
    logExportLoading.value = false;
  }
}

let logSearchTimer: ReturnType<typeof setTimeout> | null = null;
watch(logSearch, () => {
  if (logSearchTimer) clearTimeout(logSearchTimer);
  logSearchTimer = setTimeout(() => {
    logPage.value = 1;
    fetchLogs();
  }, 400);
});

watch(logPage, () => {
  if (logModalOpen.value) fetchLogs();
});
</script>
