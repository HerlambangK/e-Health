<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
    <div class="mx-auto w-full max-w-[1920px] space-y-4 px-3 py-4 lg:px-5 lg:py-5">
      <!-- Minimal Header -->
      <header class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <button
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-95"
            :title="sidebarOpen ? 'Tutup panel' : 'Buka panel'"
            @click="sidebarOpen = !sidebarOpen"
          >
            <span class="text-slate-600">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </span>
          </button>
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600">Mapping Ruangan</p>
            <h1 class="truncate text-base font-semibold text-slate-900 sm:text-lg leading-tight">
              {{ floorPlan.shortLabel }} &mdash; {{ floorPlan.name }}
            </h1>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="hidden items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 sm:inline-flex">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {{ rooms.length }} ruang
          </span>
          <UTooltip text="Pusatkan ke ruangan terpilih" :popper="{ placement: 'bottom' }">
            <UButton color="gray" variant="soft" icon="i-heroicons-arrows-pointing-out" size="sm" @click="focusSelectedRoom" />
          </UTooltip>
          <UTooltip text="Reset tampilan" :popper="{ placement: 'bottom' }">
            <UButton color="gray" variant="soft" icon="i-heroicons-arrow-path" size="sm" @click="resetMap" />
          </UTooltip>
        </div>
      </header>

      <!-- Main: Sidebar + Canvas -->
      <div class="relative flex gap-3 lg:gap-4">
        <!-- Sidebar -->
        <aside
          class="shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          :class="sidebarOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0'"
        >
          <div class="w-[320px] space-y-3">
            <!-- Search & Filter -->
            <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
              <UInput
                v-model="searchQuery"
                icon="i-heroicons-magnifying-glass-20-solid"
                placeholder="Cari nama, cluster, label..."
                size="sm"
                class="mb-3"
              />
              <div class="grid grid-cols-2 gap-1.5">
                <button
                  v-for="cat in filterOptions"
                  :key="cat.id"
                  @click="selectedCategory = cat.id"
                  class="rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all"
                  :class="selectedCategory === cat.id
                    ? 'text-white shadow-sm'
                    : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'"
                  :style="selectedCategory === cat.id ? { backgroundColor: cat.color } : {}"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <!-- Selected Room Detail -->
            <Transition name="slide-up">
              <div v-if="selectedRoom" class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Terpilih</p>
                    <h3 class="truncate text-base font-semibold text-slate-900">{{ selectedRoom.name }}</h3>
                  </div>
                  <span
                    class="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1"
                    :class="roomCategoryStyles[selectedRoom.category].softClass"
                  >
                    {{ roomCategoryStyles[selectedRoom.category].label }}
                  </span>
                </div>
                <p class="mt-1.5 text-[13px] text-slate-500">{{ selectedRoom.cluster }}</p>
                <p class="mt-1 text-xs text-slate-400">{{ selectedRoom.description }}</p>
              </div>
            </Transition>

            <!-- Room List -->
            <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
              <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p class="text-xs font-semibold text-slate-700">
                  Daftar Ruangan
                  <span class="text-slate-400 font-normal">({{ filteredRooms.length }})</span>
                </p>
                <UBadge color="gray" variant="subtle" size="xs" :label="floorPlan.shortLabel" />
              </div>
              <div class="max-h-[calc(100vh-18rem)] space-y-0.5 overflow-y-auto p-2">
                <button
                  v-for="room in filteredRooms"
                  :key="room.id"
                  @click="selectRoom(room)"
                  class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all"
                  :class="selectedRoomId === room.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'"
                >
                  <span
                    class="h-2 w-2 shrink-0 rounded-full"
                    :style="{ backgroundColor: roomCategoryStyles[room.category].color }"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{{ room.name }}</p>
                    <p
                      class="truncate text-[11px]"
                      :class="selectedRoomId === room.id ? 'text-slate-300' : 'text-slate-400'"
                    >
                      {{ room.cluster }}
                    </p>
                  </div>
                </button>
                <div
                  v-if="filteredRooms.length === 0"
                  class="flex flex-col items-center justify-center py-12 text-xs text-slate-400"
                >
                  Tidak ada ruangan yang cocok
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Canvas -->
        <div class="min-w-0 flex-1">
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
              <div class="flex h-[70vh] items-center justify-center rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
                <p class="text-sm text-slate-500">Memuat denah&hellip;</p>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
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
const sidebarOpen = ref(true);

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

const filterOptions = computed(() => {
  const categoryIds: RoomCategory[] = ["public", "diagnostic", "emergency", "support"];

  return [
    { id: "all" as const, label: "Semua", color: "#1e293b" },
    ...categoryIds.map((categoryId) => ({
      id: categoryId,
      ...roomCategoryStyles[categoryId],
    })),
  ];
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

<style scoped>
.slide-up-enter-active {
  transition: all 0.2s ease-out;
}
.slide-up-leave-active {
  transition: all 0.15s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
