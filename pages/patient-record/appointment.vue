<template>
  <div class="pb-10 flex-grow">
    <div class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Appointment</h2>
        <p class="text-sm text-gray-500">Kelola jadwal konsultasi dan kunjungan pasien.</p>
      </div>
      <div class="flex items-center gap-2">
        <UBadge v-if="loading" label="Loading" variant="subtle" />
        <UButton v-if="canUpdate" color="primary" @click="openCreateModal">Tambah Appointment</UButton>
      </div>
    </div>
    <FullCalendar :options="calendarOptions" />

    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">Buat Appointment</h3>
            <UButton icon="i-heroicons-x-mark-20-solid" variant="ghost" @click="closeCreateModal" />
          </div>
        </template>

        <div class="space-y-4">
          <UFormGroup label="Pasien" required>
            <USelectMenu
              v-model="appointmentForm.patientId"
              :options="patientOptions"
              placeholder="Pilih pasien"
              value-attribute="value"
            />
          </UFormGroup>
          <UFormGroup label="Dokter" required>
            <USelectMenu
              v-model="appointmentForm.doctorId"
              :options="doctorOptions"
              placeholder="Pilih dokter"
              value-attribute="value"
            />
          </UFormGroup>
          <div class="grid gap-3 sm:grid-cols-2">
            <UFormGroup label="Tanggal" required>
              <UInput v-model="appointmentForm.date" type="date" />
            </UFormGroup>
            <UFormGroup label="Jam Mulai" required>
              <UInput v-model="appointmentForm.startTime" type="time" />
            </UFormGroup>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <UFormGroup label="Durasi (menit)">
              <UInput v-model.number="appointmentForm.duration" type="number" min="15" step="5" />
            </UFormGroup>
            <UFormGroup label="Status">
              <USelectMenu v-model="appointmentForm.status" :options="statusOptions" value-attribute="value" />
            </UFormGroup>
          </div>
          <UFormGroup label="Catatan">
            <UTextarea v-model="appointmentForm.notes" placeholder="Catatan tambahan" />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton variant="ghost" @click="closeCreateModal">Batal</UButton>
            <UButton color="primary" :loading="isSaving" @click="createAppointment">Simpan</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <UModal v-model="showDetailModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">Detail Appointment</h3>
            <UButton icon="i-heroicons-x-mark-20-solid" variant="ghost" @click="closeDetailModal" />
          </div>
        </template>

        <div class="space-y-3 text-sm text-gray-600">
          <div>
            <div class="text-xs uppercase tracking-wide text-gray-400">Pasien</div>
            <div class="font-semibold text-gray-900">{{ selectedAppointment?.patientId?.nama ?? '-' }}</div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wide text-gray-400">Dokter</div>
            <div class="font-semibold text-gray-900">
              {{ selectedAppointment?.doctorId?.namaDokter ?? '-' }}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wide text-gray-400">Waktu</div>
            <div class="font-semibold text-gray-900">{{ formatRange(selectedAppointment) }}</div>
          </div>
          <UFormGroup v-if="canUpdate" label="Status">
            <USelectMenu v-model="selectedStatus" :options="statusOptions" value-attribute="value" />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton variant="ghost" @click="closeDetailModal">Tutup</UButton>
            <UButton v-if="canUpdate" color="primary" @click="updateAppointmentStatus">
              Update Status
            </UButton>
            <UButton v-if="canUpdate" color="red" variant="soft" @click="deleteAppointment">
              Hapus Appointment
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { normalizeRole } from "~/utils/permissions";

definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});

const { data: session } = useAuth();
const role = computed(() => normalizeRole(session.value?.user?.role));
const userId = computed(() => session.value?.user?._id);
const toast = useToast();

const canUpdate = computed(() => ["admin", "receptionist"].includes(role.value));
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const isSaving = ref(false);

const appointmentForm = reactive({
  patientId: "",
  doctorId: "",
  date: "",
  startTime: "",
  duration: 30,
  status: "scheduled",
  notes: "",
});

const statusOptions = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Checked-in", value: "checked-in" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No-show", value: "no-show" },
];

const selectedAppointment = ref<any | null>(null);
const selectedStatus = ref("scheduled");

const { data: appointmentResponse, pending: loading, refresh } = await useLazyAsyncData(
  "appointment-list",
  async () => {
    let patientId: string | undefined;

    if (role.value === "patient" && userId.value) {
      try {
        const pasienRes: any = await $fetch("/api/pasien", {
          query: { userId: userId.value, page: 1, pageSize: 1 },
        });
        patientId = pasienRes?.data?.[0]?._id;
      } catch {
        return { data: [] };
      }
    }

    return $fetch("/api/appointment", {
      query: {
        patientId,
      },
    }).catch(() => ({ data: [] }));
  },
  {
    default: () => ({ data: [] }),
    watch: [role, userId],
  }
);

const calendarEvents = computed(() =>
  ((appointmentResponse.value as any)?.data ?? []).map((item: any) => ({
    id: item._id,
    title: `${item.patientId?.nama ?? "Pasien"} • ${item.doctorId?.namaDokter ?? "Dokter"}`,
    start: item.startAt,
    end: item.endAt,
  }))
);

const { data: patientResponse } = await useLazyAsyncData(
  "appointment-patients",
  () =>
    $fetch("/api/pasien", {
      query: { page: 1, pageSize: 100 },
    }).catch(() => ({ data: [] })),
  { default: () => ({ data: [] }) }
);

const { data: doctorResponse } = await useLazyAsyncData(
  "appointment-doctors",
  () =>
    $fetch("/api/dokter", {
      query: { page: 1, pageSize: 100 },
    }).catch(() => ({ data: [] })),
  { default: () => ({ data: [] }) }
);

const patientOptions = computed(() =>
  ((patientResponse.value as any)?.data ?? []).map((item: any) => ({
    label: item.nama,
    value: item._id,
  }))
);

const doctorOptions = computed(() =>
  ((doctorResponse.value as any)?.data ?? []).map((item: any) => ({
    label: item.namaDokter,
    value: item._id,
  }))
);

function addMinutes(date: Date, minutes: number) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

async function handleEventDrop(info: any) {
  if (!canUpdate.value) return;

  try {
    const start = info.event.start;
    const end = info.event.end ?? addMinutes(start, 30);

    await $fetch(`/api/appointment/${info.event.id}` , {
      method: "PUT",
      body: {
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      },
    });
    refresh();
  } catch (error) {
    toast.add({
      title: "Gagal memperbarui jadwal",
      description: "Cek kembali jadwal agar tidak bentrok.",
      color: "red",
    });
  }
}

function handleEventClick(info: any) {
  const data = (appointmentResponse.value as any)?.data ?? [];
  const found = data.find((item: any) => item._id === info.event.id);
  if (!found) {
    toast.add({
      title: info.event.title,
      description: `Mulai: ${info.event.start?.toLocaleString?.()}`,
      color: "blue",
    });
    return;
  }
  selectedAppointment.value = found;
  selectedStatus.value = found.status ?? "scheduled";
  showDetailModal.value = true;
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  events: calendarEvents.value,
  editable: canUpdate.value,
  eventDrop: handleEventDrop,
  eventClick: handleEventClick,
  dateClick: (info: any) => {
    if (!canUpdate.value) return;
    appointmentForm.date = info.dateStr;
    appointmentForm.startTime = "09:00";
    showCreateModal.value = true;
  },
}));

function openCreateModal() {
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
}

function closeDetailModal() {
  showDetailModal.value = false;
  selectedAppointment.value = null;
}

function formatRange(item: any) {
  if (!item?.startAt) return "-";
  const start = new Date(item.startAt);
  const end = item.endAt ? new Date(item.endAt) : null;
  const startText = start.toLocaleString();
  const endText = end ? end.toLocaleString() : "";
  return endText ? `${startText} - ${endText}` : startText;
}

async function createAppointment() {
  if (!appointmentForm.patientId || !appointmentForm.doctorId || !appointmentForm.date || !appointmentForm.startTime) {
    toast.add({
      title: "Lengkapi data appointment",
      description: "Pasien, dokter, tanggal, dan jam wajib diisi.",
      color: "red",
    });
    return;
  }

  try {
    isSaving.value = true;
    const startAt = new Date(`${appointmentForm.date}T${appointmentForm.startTime}`);
    const endAt = addMinutes(startAt, appointmentForm.duration || 30);

    await $fetch("/api/appointment", {
      method: "POST",
      body: {
        patientId: appointmentForm.patientId,
        doctorId: appointmentForm.doctorId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        status: appointmentForm.status,
        notes: appointmentForm.notes || undefined,
      },
    });

    toast.add({
      title: "Appointment dibuat",
      color: "green",
    });
    showCreateModal.value = false;
    appointmentForm.patientId = "";
    appointmentForm.doctorId = "";
    appointmentForm.date = "";
    appointmentForm.startTime = "";
    appointmentForm.duration = 30;
    appointmentForm.status = "scheduled";
    appointmentForm.notes = "";
    refresh();
  } catch {
    toast.add({
      title: "Gagal membuat appointment",
      description: "Periksa data pasien, dokter, dan jadwal.",
      color: "red",
    });
  } finally {
    isSaving.value = false;
  }
}

async function updateAppointmentStatus() {
  if (!selectedAppointment.value?._id) return;
  try {
    await $fetch(`/api/appointment/${selectedAppointment.value._id}`, {
      method: "PUT",
      body: { status: selectedStatus.value },
    });
    toast.add({
      title: "Status diperbarui",
      color: "green",
    });
    showDetailModal.value = false;
    refresh();
  } catch {
    toast.add({
      title: "Gagal memperbarui status",
      color: "red",
    });
  }
}

async function deleteAppointment() {
  if (!selectedAppointment.value?._id) return;
  if (!window.confirm("Hapus appointment ini?")) return;
  try {
    await $fetch(`/api/appointment/${selectedAppointment.value._id}`, { method: "DELETE" });
    toast.add({
      title: "Appointment dihapus",
      color: "green",
    });
    showDetailModal.value = false;
    refresh();
  } catch {
    toast.add({
      title: "Gagal menghapus appointment",
      color: "red",
    });
  }
}
</script>
