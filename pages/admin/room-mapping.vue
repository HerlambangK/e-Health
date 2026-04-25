<template>
  <div class="min-h-screen bg-slate-50">
    <div class="w-full space-y-6 py-6">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-3xl space-y-2">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-amber-600">Admin • Mapping Ruangan</p>
          <h1 class="text-2xl font-semibold text-slate-900 sm:text-3xl">Denah Interaktif Lantai 1</h1>
          <p class="text-sm leading-6 text-slate-600">
            Data ruangan diambil dari file
            <span class="font-semibold text-slate-900">{{ floorPlan.source }}</span>
            lalu dirender ulang sebagai
            <span class="font-semibold text-slate-900">SVG overlay</span> di atas crop PDF agar klik mengikuti
            area ruang lantai satu, bukan lagi marker titik atau scene WebGL.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton color="gray" variant="soft" icon="i-heroicons-arrows-pointing-out" @click="focusSelectedRoom">
            Fokus Ruangan
          </UButton>
          <UButton color="primary" variant="soft" icon="i-heroicons-arrow-path" @click="resetMap">
            Reset View
          </UButton>
        </div>
      </header>

      <section class="grid gap-6 xl:grid-cols-[360px,1fr]">
        <aside class="space-y-4">
          <UCard :ui="{ body: { padding: 'p-5' } }">
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sumber Data</p>
                  <h2 class="text-lg font-semibold text-slate-900">{{ floorPlan.name }}</h2>
                  <p class="text-sm text-slate-500">{{ floorPlan.notes }}</p>
                </div>
                <div class="rounded-2xl bg-slate-900 px-3 py-2 text-right text-white shadow-sm">
                  <p class="text-[10px] uppercase tracking-[0.18em] text-slate-400">Status</p>
                  <p class="text-sm font-semibold">Fase 1</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Floor</p>
                  <p class="mt-1 text-lg font-semibold text-slate-900">{{ floorPlan.shortLabel }}</p>
                </div>
                <div class="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ruangan</p>
                  <p class="mt-1 text-lg font-semibold text-slate-900">{{ rooms.length }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                  :class="
                    'border-slate-900 bg-slate-900 text-white'
                  "
                >
                  {{ floorPlan.shortLabel }}
                </button>
                <button
                  type="button"
                  disabled
                  class="rounded-full border border-dashed border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-400"
                >
                  LT.2+ Menunggu Data
                </button>
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: { padding: 'p-5' } }">
            <div class="space-y-4">
              <div>
                <h2 class="text-base font-semibold text-slate-900">Filter & Pencarian</h2>
                <p class="text-sm text-slate-500">Cari ruangan lalu fokuskan area ruang di denah.</p>
              </div>

              <UInput
                v-model="searchQuery"
                icon="i-heroicons-magnifying-glass-20-solid"
                placeholder="Cari nama ruang, cluster, atau label..."
              />

              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="rounded-2xl px-3 py-2 text-left text-sm font-semibold ring-1 transition"
                  :class="
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white ring-slate-900'
                      : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                  "
                  @click="selectedCategory = 'all'"
                >
                  Semua
                </button>
                <button
                  v-for="category in categories"
                  :key="category.id"
                  type="button"
                  class="rounded-2xl px-3 py-2 text-left text-sm font-semibold ring-1 transition"
                  :class="
                    selectedCategory === category.id
                      ? 'text-white ring-transparent'
                      : `${category.softClass} hover:opacity-90`
                  "
                  :style="selectedCategory === category.id ? { backgroundColor: category.color } : undefined"
                  @click="selectedCategory = category.id"
                >
                  {{ category.label }}
                </button>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="category in categories"
                  :key="`stat-${category.id}`"
                  class="rounded-2xl bg-white p-3 ring-1 ring-slate-200"
                >
                  <div class="flex items-center gap-2">
                    <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: category.color }"></span>
                    <p class="text-xs font-semibold text-slate-600">{{ category.label }}</p>
                  </div>
                  <p class="mt-2 text-lg font-semibold text-slate-900">{{ category.count }}</p>
                </div>
              </div>
            </div>
          </UCard>

          <UCard v-if="selectedRoom" :ui="{ body: { padding: 'p-5' } }">
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ruangan Terpilih</p>
                  <h2 class="text-lg font-semibold text-slate-900">{{ selectedRoom.name }}</h2>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold ring-1"
                  :class="roomCategoryStyles[selectedRoom.category].softClass"
                >
                  {{ roomCategoryStyles[selectedRoom.category].label }}
                </span>
              </div>

              <div class="rounded-2xl bg-slate-900 p-4 text-white">
                <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Cluster</p>
                <p class="mt-1 text-base font-semibold">{{ selectedRoom.cluster }}</p>
                <p class="mt-3 text-sm leading-6 text-slate-300">{{ selectedRoom.description }}</p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Label Denah</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ selectedRoom.sourceLabel || selectedRoom.name }}</p>
                </div>
                <div class="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Aksi</p>
                  <button class="mt-1 text-sm font-semibold text-primary-600" @click="focusSelectedRoom">
                    Pusatkan ke ruangan
                  </button>
                </div>
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: { padding: 'p-0' } }">
            <div class="border-b border-slate-100 px-5 py-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-base font-semibold text-slate-900">Daftar Ruangan</h2>
                  <p class="text-sm text-slate-500">{{ filteredRooms.length }} ruang tampil dari {{ rooms.length }} total.</p>
                </div>
                <UBadge color="gray" variant="subtle" :label="floorPlan.shortLabel" />
              </div>
            </div>

            <div class="max-h-[520px] space-y-2 overflow-y-auto p-3">
              <button
                v-for="room in filteredRooms"
                :key="room.id"
                type="button"
                class="w-full rounded-2xl border px-4 py-3 text-left transition"
                :class="
                  selectedRoomId === room.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                "
                @click="selectRoom(room)"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="mt-1 h-2.5 w-2.5 rounded-full"
                    :style="{ backgroundColor: roomCategoryStyles[room.category].color }"
                  ></span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold">{{ room.name }}</p>
                    <p
                      class="truncate text-xs"
                      :class="selectedRoomId === room.id ? 'text-slate-300' : 'text-slate-500'"
                    >
                      {{ room.cluster }}
                    </p>
                  </div>
                </div>
              </button>

              <div
                v-if="filteredRooms.length === 0"
                class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500"
              >
                Tidak ada ruangan yang cocok dengan filter saat ini.
              </div>
            </div>
          </UCard>
        </aside>

        <div class="min-w-0 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-[28px] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Mode Interaktif</p>
              <p class="text-sm text-slate-600">
                Denah ini mengikuti hasil crop lantai 1 pada PDF. Filter di kiri akan menyorot area ruang yang cocok,
                lalu ruang bisa dipilih langsung dari overlay atau dari daftar ruangan.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                PDF LT.1
              </span>
              <span
                v-for="category in categories"
                :key="`legend-${category.id}`"
                class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
              >
                <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: category.color }"></span>
                {{ category.label }}
              </span>
            </div>
          </div>

          <ClientOnly>
            <AdminRoomMappingCanvas
              ref="mapCanvasRef"
              :floor-plan="floorPlan"
              :rooms="rooms"
              :selected-room-id="selectedRoomId"
              :active-room-ids="filteredRoomIds"
              @select="handleMapSelect"
            />

            <template #fallback>
              <div class="rounded-[28px] bg-slate-900 p-10 text-center text-white">Memuat denah interaktif...</div>
            </template>
          </ClientOnly>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminRoomMappingCanvas from "~/components/admin/RoomMappingCanvas.vue";
import { floorPlans, roomCategoryStyles } from "~/data/room-mapping";
import type { RoomCategory, RoomMappingRoom } from "~/data/room-mapping";

definePageMeta({
  middleware: ["auth", "auth-middleware"],
});

type RoomMapCanvasExposed = {
  focusRoom: (roomId: string, immediate?: boolean) => void;
  resetView: (immediate?: boolean) => void;
};

const floorPlan = floorPlans["lantai-1"];
const rooms = floorPlan.rooms;
const searchQuery = ref("");
const selectedCategory = ref<RoomCategory | "all">("all");
const selectedRoomId = ref<string | null>("lobby-utama");
const mapCanvasRef = ref<RoomMapCanvasExposed | null>(null);

const filteredRooms = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return rooms.filter((room) => {
    const matchesCategory = selectedCategory.value === "all" || room.category === selectedCategory.value;
    const matchesQuery =
      query.length === 0 ||
      room.name.toLowerCase().includes(query) ||
      room.cluster.toLowerCase().includes(query) ||
      room.description.toLowerCase().includes(query) ||
      (room.sourceLabel || "").toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });
});

const filteredRoomIds = computed(() => filteredRooms.value.map((room) => room.id));

const selectedRoom = computed(
  () => rooms.find((room) => room.id === selectedRoomId.value) ?? filteredRooms.value[0] ?? null
);

const categories = computed(() => {
  const categoryIds: RoomCategory[] = ["public", "diagnostic", "emergency", "support"];

  return categoryIds.map((categoryId) => ({
    id: categoryId,
    ...roomCategoryStyles[categoryId],
    count: rooms.filter((room) => room.category === categoryId).length,
  }));
});

watch(
  filteredRooms,
  (value) => {
    if (value.length === 0) {
      selectedRoomId.value = null;
      return;
    }

    if (!selectedRoomId.value || !value.some((room) => room.id === selectedRoomId.value)) {
      selectedRoomId.value = value[0].id;
    }
  },
  { immediate: true }
);

function selectRoom(room: RoomMappingRoom) {
  selectedRoomId.value = room.id;
}

function focusSelectedRoom() {
  if (!selectedRoom.value) return;
  mapCanvasRef.value?.focusRoom(selectedRoom.value.id);
}

function resetMap() {
  searchQuery.value = "";
  selectedCategory.value = "all";

  nextTick(() => {
    mapCanvasRef.value?.resetView();
  });
}

function handleMapSelect(roomId: string) {
  selectedRoomId.value = roomId;
}
</script>
