<template>
  <div class="relative min-w-0 overflow-hidden rounded-[28px] bg-slate-100">
    <div
      class="pointer-events-none absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur"
    >
      <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
      Denah LT.1 dari PDF • klik area ruang untuk detail • scroll untuk jelajah
    </div>

    <div
      ref="viewportRef"
      class="relative max-h-[78vh] overflow-auto px-4 pb-4 pt-14"
      :style="viewportStyle"
    >
      <div class="relative mx-auto" :style="planStyle">
        <img
          :src="floorPlan.image"
          :alt="floorPlan.name"
          class="absolute inset-0 h-full w-full rounded-[26px] object-cover shadow-sm ring-1 ring-slate-300/70"
          draggable="false"
          @load="handleImageLoad"
          @error="handleImageError"
        />

        <svg
          class="absolute inset-0 h-full w-full"
          :viewBox="`0 0 ${floorPlan.width} ${floorPlan.height}`"
          preserveAspectRatio="none"
        >
          <path
            v-for="room in rooms"
            :key="room.id"
            :d="room.path"
            :style="roomPathStyle(room)"
            tabindex="0"
            @click.stop="emit('select', room.id)"
            @mouseenter="hoveredRoomId = room.id"
            @mouseleave="hoveredRoomId = null"
            @focus="hoveredRoomId = room.id"
            @blur="hoveredRoomId = null"
            @keydown.enter.prevent="emit('select', room.id)"
          >
            <title>{{ room.name }}</title>
          </path>

          <circle
            v-for="room in emphasizedRooms"
            :key="`focus-${room.id}`"
            :cx="room.x"
            :cy="room.y"
            :r="room.id === selectedRoomId ? 14 : 9"
            :fill="room.id === selectedRoomId ? roomCategoryStyles[room.category].color : '#ffffff'"
            :stroke="roomCategoryStyles[room.category].color"
            :stroke-width="room.id === selectedRoomId ? 4 : 3"
            class="pointer-events-none"
          />
        </svg>

        <div
          v-if="tooltipRoom"
          class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-2xl bg-slate-900/96 px-3 py-2 text-white shadow-xl backdrop-blur"
          :style="tooltipStyle"
        >
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {{ roomCategoryStyles[tooltipRoom.category].label }}
          </p>
          <p class="text-sm font-semibold">{{ tooltipRoom.name }}</p>
          <p class="text-[11px] text-slate-300">{{ tooltipRoom.cluster }}</p>
          <p class="max-w-[18rem] text-[11px] text-slate-400">{{ tooltipRoom.sourceLabel || tooltipRoom.name }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="!isReady"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm font-medium text-slate-700"
    >
      <div class="rounded-2xl bg-white/95 px-4 py-2 shadow-lg ring-1 ring-slate-200">
        Menyiapkan denah lantai 1...
      </div>
    </div>

    <div
      v-if="renderError"
      class="absolute inset-0 z-30 flex items-center justify-center bg-white/80 px-6 text-center text-slate-900"
    >
      <div class="max-w-md rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-2xl">
        <p class="text-sm font-semibold">Denah interaktif belum berhasil dimuat</p>
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ renderError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from "vue";

import { roomCategoryStyles } from "~/data/room-mapping";
import type { FloorPlanDefinition, RoomMappingRoom } from "~/data/room-mapping";

const props = defineProps<{
  floorPlan: FloorPlanDefinition;
  rooms: RoomMappingRoom[];
  selectedRoomId: string | null;
  activeRoomIds: string[];
}>();

const emit = defineEmits<{
  (event: "select", roomId: string): void;
}>();

const viewportRef = ref<HTMLElement | null>(null);
const hoveredRoomId = ref<string | null>(null);
const isReady = ref(false);
const renderError = ref("");
const viewportWidth = ref(0);

const minimumPlanWidth = 1480;

let resizeObserver: ResizeObserver | null = null;
let resizeFrame: number | null = null;

const rooms = computed(() => props.rooms);
const roomMap = computed(() => new Map(props.rooms.map((room) => [room.id, room])));
const activeRoomIdsSet = computed(() => new Set(props.activeRoomIds));
const selectedRoomId = computed(() => props.selectedRoomId);
const tooltipRoom = computed(() => {
  const roomId = hoveredRoomId.value ?? props.selectedRoomId;
  if (!roomId) {
    return null;
  }

  return roomMap.value.get(roomId) ?? null;
});

const renderedWidth = computed(() => Math.max(viewportWidth.value || minimumPlanWidth, minimumPlanWidth));
const renderedHeight = computed(() =>
  Math.round((renderedWidth.value * props.floorPlan.height) / props.floorPlan.width)
);
const scaleX = computed(() => renderedWidth.value / props.floorPlan.width);
const scaleY = computed(() => renderedHeight.value / props.floorPlan.height);
const planStyle = computed<CSSProperties>(() => ({
  width: `${renderedWidth.value}px`,
  height: `${renderedHeight.value}px`,
}));
const viewportStyle = computed<CSSProperties>(() => ({
  scrollbarGutter: "stable both-edges",
}));

const tooltipStyle = computed<CSSProperties>(() => {
  if (!tooltipRoom.value) {
    return {};
  }

  return {
    left: `${tooltipRoom.value.x * scaleX.value}px`,
    top: `${tooltipRoom.value.y * scaleY.value}px`,
  };
});

const emphasizedRooms = computed(() => {
  const roomIds = [props.selectedRoomId, hoveredRoomId.value].filter(Boolean) as string[];

  return roomIds
    .filter((roomId, index) => roomIds.indexOf(roomId) === index)
    .map((roomId) => roomMap.value.get(roomId))
    .filter((room): room is RoomMappingRoom => Boolean(room));
});

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  const value = Number.parseInt(full, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function roomPathStyle(room: RoomMappingRoom): CSSProperties {
  const categoryStyle = roomCategoryStyles[room.category];
  const isSelected = room.id === props.selectedRoomId;
  const isHovered = room.id === hoveredRoomId.value;
  const isDimmed = activeRoomIdsSet.value.size > 0 && !activeRoomIdsSet.value.has(room.id);
  const fillAlpha = isSelected ? 0.34 : isHovered ? 0.24 : 0.08;
  const strokeAlpha = isSelected ? 0.95 : isHovered ? 0.85 : 0.55;

  return {
    fill: hexToRgba(categoryStyle.color, fillAlpha),
    stroke: hexToRgba(categoryStyle.color, strokeAlpha),
    strokeWidth: isSelected ? "5" : isHovered ? "4" : "2.5",
    opacity: isDimmed ? "0.24" : "1",
    cursor: "pointer",
    transition: "fill 160ms ease, stroke 160ms ease, opacity 160ms ease, stroke-width 160ms ease",
    vectorEffect: "non-scaling-stroke",
    strokeLinejoin: "round",
  };
}

function syncViewportSize() {
  if (!viewportRef.value) {
    viewportWidth.value = minimumPlanWidth;
    return;
  }

  const styles = window.getComputedStyle(viewportRef.value);
  const paddingX =
    Number.parseFloat(styles.paddingLeft || "0") + Number.parseFloat(styles.paddingRight || "0");
  const nextWidth = Math.max(0, Math.round(viewportRef.value.clientWidth - paddingX));

  if (nextWidth !== viewportWidth.value) {
    viewportWidth.value = nextWidth;
  }
}

function clampScrollLeft(value: number) {
  if (!viewportRef.value) {
    return value;
  }

  return Math.max(0, Math.min(value, Math.max(0, viewportRef.value.scrollWidth - viewportRef.value.clientWidth)));
}

function clampScrollTop(value: number) {
  if (!viewportRef.value) {
    return value;
  }

  return Math.max(
    0,
    Math.min(value, Math.max(0, viewportRef.value.scrollHeight - viewportRef.value.clientHeight))
  );
}

function focusRoom(roomId: string, immediate = false) {
  const room = roomMap.value.get(roomId);
  if (!room || !viewportRef.value) {
    return;
  }

  const targetLeft = room.x * scaleX.value - viewportRef.value.clientWidth / 2;
  const targetTop = room.y * scaleY.value - viewportRef.value.clientHeight / 2;

  viewportRef.value.scrollTo({
    left: clampScrollLeft(targetLeft),
    top: clampScrollTop(targetTop),
    behavior: immediate ? "auto" : "smooth",
  });
}

function resetView(immediate = false) {
  if (!viewportRef.value) {
    return;
  }

  viewportRef.value.scrollTo({
    left: 0,
    top: 0,
    behavior: immediate ? "auto" : "smooth",
  });
}

function handleImageLoad() {
  renderError.value = "";
  isReady.value = true;

  nextTick(() => {
    syncViewportSize();

    if (props.selectedRoomId) {
      focusRoom(props.selectedRoomId, true);
    }
  });
}

function handleImageError() {
  renderError.value =
    "Aset denah gagal dimuat. Pastikan PNG lantai 1 hasil ekstraksi PDF tersedia di folder public/room-mapping.";
  isReady.value = true;
}

function bindResizeObserver() {
  if (!viewportRef.value) {
    return;
  }

  resizeObserver = new ResizeObserver(() => {
    if (resizeFrame !== null) {
      cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      syncViewportSize();
    });
  });

  resizeObserver.observe(viewportRef.value);
}

defineExpose({
  focusRoom,
  resetView,
});

watch(
  () => props.floorPlan.id,
  () => {
    isReady.value = false;
    renderError.value = "";
    hoveredRoomId.value = null;
    nextTick(() => {
      syncViewportSize();
      resetView(true);
    });
  }
);

watch(
  () => props.selectedRoomId,
  (roomId) => {
    if (!roomId || !isReady.value) {
      return;
    }

    nextTick(() => {
      focusRoom(roomId);
    });
  }
);

onMounted(() => {
  syncViewportSize();
  bindResizeObserver();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;

  if (resizeFrame !== null) {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
  }
});
</script>
