<template>
  <div class="pb-10 flex-grow">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between py-4">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Billing Pembayaran</h2>
        <p class="text-sm text-gray-500">Kelola invoice pasien dan status pembayaran.</p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <UInput v-model="q" placeholder="Cari invoice atau pasien..." class="w-full sm:w-64" />
        <UButton
          v-if="canUpdateBilling"
          color="primary"
          class="w-full sm:w-auto"
          @click="openCreateModal"
        >
          Tambah Billing
        </UButton>
      </div>
    </div>

    <div class="overflow-x-auto">
      <UTable
        class="min-w-[720px] w-full"
        :rows="billingRows"
        :columns="columns"
        :loading="loading"
        :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
      >
      <template #patient-data="{ row }">
        <span>{{ row.patientId?.nama ?? '-' }}</span>
      </template>

      <template #total-data="{ row }">
        <span>Rp {{ row.total?.toLocaleString('id-ID') ?? '-' }}</span>
      </template>

      <template #status-data="{ row }">
        <UBadge :label="row.status" :color="statusColor(row.status)" variant="subtle" />
      </template>

      <template #actions-data="{ row }">
        <div class="flex items-center gap-2">
          <UButton size="2xs" color="gray" variant="ghost" @click="openDetail(row)">
            Detail
          </UButton>
          <UButton
            v-if="canUpdateBilling"
            size="2xs"
            color="emerald"
            variant="outline"
            @click="updateStatus(row, 'paid')"
          >
            Tandai Lunas
          </UButton>
          <UButton
            v-if="canUpdateBilling"
            size="2xs"
            color="red"
            variant="outline"
            @click="updateStatus(row, 'void')"
          >
            Void
          </UButton>
          <UButton
            v-if="canUpdateBilling"
            size="2xs"
            color="gray"
            variant="ghost"
            @click="deleteBilling(row)"
          >
            Hapus
          </UButton>
        </div>
      </template>

      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-6 gap-3">
          <span class="italic text-sm">Belum ada data billing.</span>
          <UButton v-if="canUpdateBilling" size="xs" variant="soft" @click="openCreateModal">
            Buat Billing Pertama
          </UButton>
        </div>
      </template>
      </UTable>
    </div>

    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">Buat Billing</h3>
            <UButton icon="i-heroicons-x-mark-20-solid" variant="ghost" @click="closeCreateModal" />
          </div>
        </template>

        <div class="space-y-4">
          <UFormGroup label="Pasien" required>
            <USelectMenu
              v-model="billingForm.patientId"
              :options="patientOptions"
              placeholder="Pilih pasien"
              value-attribute="value"
            />
          </UFormGroup>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-gray-700">Item Tagihan</p>
              <UButton size="xs" variant="soft" color="primary" @click="addItem">
                Tambah Item
              </UButton>
            </div>

            <div v-for="(item, idx) in billingForm.items" :key="idx" class="grid gap-2 sm:grid-cols-[1.4fr,0.6fr,0.8fr,auto]">
              <UInput v-model="item.description" placeholder="Deskripsi" />
              <UInput v-model.number="item.quantity" type="number" min="1" placeholder="Qty" />
              <UInput v-model.number="item.price" type="number" min="0" placeholder="Harga" />
              <UButton
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                @click="removeItem(idx)"
              />
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <UFormGroup label="Status">
              <USelectMenu v-model="billingForm.status" :options="statusOptions" value-attribute="value" />
            </UFormGroup>
            <UFormGroup label="Jatuh Tempo">
              <UInput v-model="billingForm.dueDate" type="date" />
            </UFormGroup>
          </div>

          <div class="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            Total tagihan: <span class="font-semibold text-gray-900">Rp {{ billingTotal.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton variant="ghost" @click="closeCreateModal">Batal</UButton>
            <UButton color="primary" :loading="isSaving" @click="createBilling">
              Simpan Billing
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <UModal v-model="showDetailModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">Detail Billing</h3>
            <UButton icon="i-heroicons-x-mark-20-solid" variant="ghost" @click="closeDetail" />
          </div>
        </template>

        <div class="space-y-4 text-sm text-gray-600">
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <div class="text-xs uppercase tracking-wide text-gray-400">Invoice</div>
              <div class="font-semibold text-gray-900">{{ selectedBilling?.invoiceNumber ?? "-" }}</div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-gray-400">Pasien</div>
              <div class="font-semibold text-gray-900">{{ selectedBilling?.patientId?.nama ?? "-" }}</div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-gray-400">Status</div>
              <div class="font-semibold text-gray-900">{{ selectedBilling?.status ?? "-" }}</div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-gray-400">Jatuh Tempo</div>
              <div class="font-semibold text-gray-900">{{ formatDate(selectedBilling?.dueDate) }}</div>
            </div>
          </div>

          <div>
            <div class="text-xs uppercase tracking-wide text-gray-400">Item Tagihan</div>
            <div class="mt-2 space-y-2">
              <div
                v-for="(item, idx) in selectedBilling?.items ?? []"
                :key="idx"
                class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <div>
                  <div class="font-semibold text-gray-900">{{ item.description }}</div>
                  <div class="text-xs text-gray-500">{{ item.quantity }} x Rp {{ formatCurrency(item.price) }}</div>
                </div>
                <div class="font-semibold text-gray-900">
                  Rp {{ formatCurrency(item.quantity * item.price) }}
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
            Total tagihan: <span class="font-semibold text-gray-900">Rp {{ formatCurrency(selectedBilling?.total) }}</span>
          </div>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton variant="ghost" @click="closeDetail">Tutup</UButton>
            <UButton
              v-if="canUpdateBilling"
              color="primary"
              @click="selectedBilling && updateStatus(selectedBilling, 'paid')"
            >
              Tandai Lunas
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { normalizeRole } from "~/utils/permissions";

definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});

const { data: session } = useAuth();
const role = computed(() => normalizeRole(session.value?.user?.role));
const userId = computed(() => session.value?.user?._id);
const q = ref("");
const toast = useToast();
const showCreateModal = ref(false);
const isSaving = ref(false);
const showDetailModal = ref(false);
const selectedBilling = ref<any | null>(null);

const billingForm = reactive({
  patientId: "",
  items: [{ description: "Konsultasi dokter", quantity: 1, price: 150000 }],
  status: "issued",
  dueDate: "",
});

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Issued", value: "issued" },
  { label: "Paid", value: "paid" },
  { label: "Void", value: "void" },
];

const { data: billingResponse, pending: loading, refresh } = await useLazyAsyncData(
  "billing-list",
  async () => {
    let patientId: string | undefined;

    if (role.value === "patient" && userId.value) {
      const pasienRes: any = await $fetch("/api/pasien", {
        query: { userId: userId.value, page: 1, pageSize: 1 },
      });
      patientId = pasienRes?.data?.[0]?._id;
    }

    return $fetch("/api/billing", {
      query: {
        patientId,
        q: q.value || undefined,
      },
    }).catch(() => ({ data: [] }));
  },
  {
    default: () => ({ data: [] }),
    watch: [role, userId, q],
  }
);

const billingRows = computed(() => (billingResponse.value as any)?.data ?? []);
const canUpdateBilling = computed(() => ["admin", "billing"].includes(role.value));

const columns = [
  { key: "invoiceNumber", label: "Invoice" },
  { key: "patient", label: "Pasien" },
  { key: "total", label: "Total" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Aksi" },
];

const { data: patientResponse } = await useLazyAsyncData(
  "billing-patients",
  () =>
    $fetch("/api/pasien", {
      query: {
        page: 1,
        pageSize: 100,
      },
    }).catch(() => ({ data: [] })),
  { default: () => ({ data: [] }) }
);

const patientOptions = computed(() =>
  ((patientResponse.value as any)?.data ?? []).map((item: any) => ({
    label: item.nama,
    value: item._id,
  }))
);

const billingTotal = computed(() =>
  billingForm.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0)
);

function openCreateModal() {
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
}

function addItem() {
  billingForm.items.push({ description: "", quantity: 1, price: 0 });
}

function removeItem(index: number) {
  if (billingForm.items.length === 1) return;
  billingForm.items.splice(index, 1);
}

function statusColor(status: string) {
  switch (status) {
    case "paid":
      return "emerald";
    case "issued":
      return "blue";
    case "void":
      return "red";
    default:
      return "gray";
  }
}

function openDetail(row: any) {
  selectedBilling.value = row;
  showDetailModal.value = true;
}

function closeDetail() {
  showDetailModal.value = false;
  selectedBilling.value = null;
}

function formatCurrency(value: number | undefined) {
  if (value == null) return "-";
  return Number(value).toLocaleString("id-ID");
}

function formatDate(value: string | Date | undefined) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function updateStatus(row: any, status: "paid" | "void") {
  try {
    await $fetch(`/api/billing/${row._id}`, {
      method: "PUT",
      body: {
        status,
        paidAt: status === "paid" ? new Date().toISOString() : undefined,
      },
    });
    refresh();
  } catch {
    toast.add({
      title: "Gagal memperbarui billing",
      description: "Periksa koneksi atau status billing.",
      color: "red",
    });
  }
}

async function createBilling() {
  if (!billingForm.patientId) {
    toast.add({
      title: "Pasien wajib dipilih",
      description: "Pilih pasien untuk membuat billing.",
      color: "red",
    });
    return;
  }

  try {
    isSaving.value = true;
    await $fetch("/api/billing", {
      method: "POST",
      body: {
        patientId: billingForm.patientId,
        items: billingForm.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity || 0),
          price: Number(item.price || 0),
        })),
        total: billingTotal.value,
        status: billingForm.status,
        dueDate: billingForm.dueDate || undefined,
      },
    });
    toast.add({
      title: "Billing dibuat",
      color: "green",
    });
    showCreateModal.value = false;
    billingForm.patientId = "";
    billingForm.items = [{ description: "Konsultasi dokter", quantity: 1, price: 150000 }];
    billingForm.status = "issued";
    billingForm.dueDate = "";
    refresh();
  } catch (error) {
    toast.add({
      title: "Gagal membuat billing",
      description: "Periksa data pasien atau item tagihan.",
      color: "red",
    });
  } finally {
    isSaving.value = false;
  }
}

async function deleteBilling(row: any) {
  if (!row?._id) return;
  if (!window.confirm(`Hapus billing ${row.invoiceNumber ?? ""}?`)) return;

  try {
    await $fetch(`/api/billing/${row._id}`, { method: "DELETE" });
    toast.add({
      title: "Billing dihapus",
      color: "green",
    });
    refresh();
  } catch {
    toast.add({
      title: "Gagal menghapus billing",
      description: "Periksa akses atau coba lagi.",
      color: "red",
    });
  }
}
</script>
