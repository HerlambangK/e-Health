<template>
  <div class="min-h-screen bg-white">
    <div class="w-full space-y-6 py-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary-500">Navigasi</p>
          <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl">Peta Rute Ambulans</h1>
          <p class="text-sm text-gray-500">
            {{ headerDescription }}
          </p>
        </div>
        <UBadge color="primary" variant="subtle" label="Live Tracking" />
      </header>

      <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section class="overflow-hidden rounded-2xl bg-white shadow">
          <div class="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Visualisasi Perjalanan</h2>
              <p class="text-sm text-gray-500">
                {{ routeDescription }}
              </p>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="inline-flex items-center gap-1">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                Start
              </span>
              <span class="inline-flex items-center gap-1">
                <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                Checkpoint
              </span>
              <span class="inline-flex items-center gap-1">
                <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                Finish
              </span>
            </div>
          </div>

          <div class="relative isolate">
            <div :id="mapContainerId" class="h-[320px] w-full sm:h-[420px] lg:h-[520px] z-0"></div>

            <div class="pointer-events-none absolute bottom-4 left-4 z-20 lg:bottom-6 lg:left-6">
              <UPopover :popper="{ placement: 'top-start', offsetDistance: 8 }">
                <UButton size="xs" variant="soft" icon="i-heroicons-information-circle" class="pointer-events-auto">
                  <span class="text-xs">Info Rute</span>
                  <span
                    class="ml-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-semibold text-white"
                  >
                    {{ displayStops.length }}
                  </span>
                </UButton>

                <template #panel>
                  <div
                    class="pointer-events-auto w-60 max-h-60 space-y-1 overflow-auto rounded-xl border border-gray-100 bg-white/95 p-2 shadow-lg backdrop-blur"
                  >
                    <div
                      v-for="stop in displayStops"
                      :key="stop.id"
                      class="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
                    >
                      <span
                        class="h-2 w-2 shrink-0 rounded-full"
                        :style="{ backgroundColor: stop.color ?? markerColors[stop.type] }"
                      ></span>
                      <div class="min-w-0">
                        <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          {{ typeLabels[stop.type] }}
                        </p>
                        <p class="truncate text-xs font-semibold text-gray-900">{{ stop.name }}</p>
                        <p v-if="stop.description" class="truncate text-[11px] text-gray-500">
                          {{ stop.description }}
                        </p>
                      </div>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </section>

        <aside class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow lg:h-full">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Informasi Rute</h2>
            <p class="text-sm text-gray-500">
              Detail perjalanan ambulans, termasuk durasi, jarak tempuh, dan catatan penting di tiap titik.
            </p>
          </div>

          <div class="space-y-3 rounded-xl border border-gray-100 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Titik Awal (Tetap)</p>
                <p class="text-sm font-semibold text-gray-900">{{ startStop.name }}</p>
                <p class="text-xs text-gray-500">{{ startStop.description }}</p>
              </div>
              <UButton size="xs" variant="soft" @click="addVehicle">Tambah Tujuan</UButton>
            </div>

            <UAccordion multiple :items="vehicleAccordionItems" :ui="{ wrapper: 'space-y-3' }">
              <template v-for="(vehicle, index) in vehicles" :key="vehicle.id" #[vehicle.id]>
                <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: vehicle.color }"></span>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">{{ vehicle.label }}</p>
                        <p class="text-xs text-gray-500">Ambulans {{ index + 1 }}</p>
                      </div>
                    </div>
                    <UButton
                      v-if="vehicles.length > 1"
                      size="xs"
                      color="rose"
                      variant="ghost"
                      @click="removeVehicle(vehicle.id)"
                    >
                      Hapus
                    </UButton>
                  </div>

                  <div class="mt-3 space-y-2">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Tujuan Perjalanan</p>
                    <USelectMenu
                      v-model="vehicle.destinationId"
                      :options="destinationOptions"
                      value-attribute="value"
                      searchable
                      placeholder="Pilih tujuan"
                    />
                  </div>

                  <div v-if="vehicle.destinationId === 'custom'" class="mt-3 space-y-2">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Cari Lokasi Tujuan</p>
                      <div class="relative mt-2">
                        <div class="flex items-center gap-2">
                          <UInput
                            v-model="vehicle.searchQuery"
                            placeholder="Masukkan nama lokasi"
                            class="flex-1"
                            @input="scheduleAutoSearch(vehicle, 'destination')"
                          />
                          <UButton size="xs" :loading="vehicle.searching" @click="searchPlaces(vehicle, 'destination')">
                            Search
                          </UButton>
                        </div>
                        <div
                          v-if="vehicle.searchResults.length"
                          class="absolute z-30 mt-2 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow"
                        >
                          <button
                            v-for="result in vehicle.searchResults"
                            :key="result.id"
                            class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            @click="selectSearchResult(vehicle, result, 'destination')"
                          >
                            <p class="font-medium text-gray-900">{{ result.mainText }}</p>
                            <p class="text-xs text-gray-500">{{ result.secondaryText }}</p>
                          </button>
                        </div>
                      </div>
                      <p v-if="searchServiceError" class="mt-2 text-xs text-rose-500">{{ searchServiceError }}</p>
                      <p v-if="vehicle.customDestinationError" class="mt-2 text-xs text-rose-500">
                        {{ vehicle.customDestinationError }}
                      </p>
                      <p v-if="vehicle.appliedCustomDestination" class="mt-2 text-xs text-emerald-600">
                        Dipakai: {{ vehicle.appliedCustomDestination.name }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-3 space-y-2">
                    <div class="flex items-center justify-between">
                      <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Checkpoint</p>
                      <UButton size="xs" variant="soft" @click="enableMapWaypoint(vehicle.id)">
                        Tambah dari Map
                      </UButton>
                    </div>
                    <div class="relative">
                      <div class="flex items-center gap-2">
                        <UInput
                          v-model="vehicle.waypointSearchQuery"
                          placeholder="Cari lokasi checkpoint"
                          class="flex-1"
                          @input="scheduleAutoSearch(vehicle, 'waypoint')"
                        />
                        <UButton size="xs" :loading="vehicle.waypointSearching" @click="searchPlaces(vehicle, 'waypoint')">
                          Search
                        </UButton>
                      </div>
                      <div
                        v-if="vehicle.waypointSearchResults.length"
                        class="absolute z-30 mt-2 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow"
                      >
                        <button
                          v-for="result in vehicle.waypointSearchResults"
                          :key="result.id"
                          class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          @click="selectSearchResult(vehicle, result, 'waypoint')"
                        >
                          <p class="font-medium text-gray-900">{{ result.mainText }}</p>
                          <p class="text-xs text-gray-500">{{ result.secondaryText }}</p>
                        </button>
                      </div>
                    </div>
                    <p v-if="searchServiceError" class="text-xs text-rose-500">{{ searchServiceError }}</p>
                    <p v-if="vehicle.waypointError" class="text-xs text-rose-500">{{ vehicle.waypointError }}</p>
                    <p v-if="activeMapTargetVehicleId === vehicle.id" class="text-xs text-primary-600">
                      Klik peta untuk menambahkan checkpoint. <button class="underline" @click="cancelMapWaypoint">Batal</button>
                    </p>
                    <div v-if="vehicle.waypoints.length" class="space-y-2">
                      <div
                        v-for="waypoint in vehicle.waypoints"
                        :key="waypoint.id"
                        draggable="true"
                        class="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                        @dragstart="handleWaypointDragStart(vehicle.id, waypoint.id)"
                        @dragover.prevent
                        @drop="handleWaypointDrop(vehicle, waypoint.id)"
                        @dragend="handleWaypointDragEnd"
                      >
                        <div class="flex items-center gap-2">
                          <span class="cursor-grab text-sm text-gray-400">⋮⋮</span>
                          <div>
                            <p class="text-xs font-semibold text-gray-900">{{ waypoint.name }}</p>
                            <p class="text-[11px] text-gray-500">
                              {{ waypoint.coords[0].toFixed(5) }}, {{ waypoint.coords[1].toFixed(5) }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <input
                            v-model="waypoint.color"
                            type="color"
                            class="h-6 w-10 cursor-pointer rounded border border-gray-200 bg-white"
                          />
                          <UButton size="xs" color="rose" variant="ghost" @click="removeWaypoint(vehicle, waypoint.id)">
                            Hapus
                          </UButton>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 space-y-2">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Ikon Kendaraan</p>
                    <div class="grid grid-cols-2 gap-2">
                      <USelectMenu v-model="vehicle.vehicleType" :options="vehicleOptions" value-attribute="value" />
                      <UInput v-model="vehicle.label" placeholder="Label ambulans" />
                    </div>
                  </div>

                  <div class="mt-3 space-y-2">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Gaya Rute</p>
                    <div class="grid grid-cols-2 gap-2">
                      <div class="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1.5">
                        <span class="text-xs text-gray-500">Warna</span>
                        <input
                          v-model="vehicle.color"
                          type="color"
                          class="h-6 w-10 cursor-pointer rounded border border-gray-200 bg-white"
                        />
                      </div>
                      <UInput
                        v-model.number="vehicle.routeWeight"
                        type="number"
                        min="2"
                        max="8"
                        step="1"
                        placeholder="Ketebalan"
                      />
                    </div>
                    <p class="text-xs text-gray-500">Sesuaikan warna dan ketebalan garis rute.</p>
                  </div>

                  <p v-if="vehicleMetrics[vehicle.id]" class="mt-2 text-xs text-gray-500">
                    Estimasi {{ formatDuration(vehicleMetrics[vehicle.id].durationMin) }} •
                    {{ formatDistance(vehicleMetrics[vehicle.id].distanceKm) }}
                  </p>
                </div>
              </template>
            </UAccordion>
          </div>

          <div class="space-y-4">
            <div class="rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
              <span v-if="summaryText">{{ summaryText }}</span>
              <span v-else>Memuat estimasi jarak dan durasi rute...</span>
            </div>

            <dl class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <dt class="text-sm text-gray-500">Kapasitas ambulans</dt>
                <dd class="text-sm font-medium text-gray-900">4 penumpang</dd>
              </div>
              <div class="flex items-start justify-between gap-3">
                <dt class="text-sm text-gray-500">Petugas medis</dt>
                <dd class="text-sm font-medium text-gray-900">Dokter + 2 Perawat</dd>
              </div>
              <div class="flex items-start justify-between gap-3">
                <dt class="text-sm text-gray-500">Status saat ini</dt>
                <dd class="text-sm font-medium text-emerald-600">Dalam perjalanan</dd>
              </div>
            </dl>
          </div>

          <div class="space-y-2">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-400">Catatan Lapangan</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li>• Rute utama melalui Tol Jakarta-Cikampek, siapkan e-toll.</li>
              <li>• Titik padat biasanya terjadi di akses Karawang Barat dan Cawang.</li>
              <li>• Koordinasi dengan pos kesehatan sekitar tujuan untuk pengalihan lalu lintas.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { Map as LeafletMap, Polyline, Marker, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});

const mapContainerId = "ambulance-map";

type RouteStop = {
  id: string;
  name: string;
  description: string;
  coords: [number, number];
  type: "start" | "checkpoint" | "end";
  wait: number;
  pathIndex?: number;
  color?: string;
};

type LatLngPoint = { lat: number; lng: number };

type DestinationOption = {
  label: string;
  value: string;
  coords?: [number, number];
  description: string;
};

type VehicleOption = {
  label: string;
  value: string;
  iconUrl: string;
  size: number;
  headingOffset?: number;
};

type VehicleConfig = {
  id: string;
  label: string;
  destinationId: string;
  vehicleType: string;
  customDestination: { name: string; lat: string; lng: string };
  customDestinationError: string;
  appliedCustomDestination: RouteStop | null;
  searchQuery: string;
  searchResults: SearchResult[];
  searching: boolean;
  waypointSearchQuery: string;
  waypointSearchResults: SearchResult[];
  waypointSearching: boolean;
  waypoints: Waypoint[];
  waypointError: string;
  color: string;
  routeWeight: number;
};

type SearchResult = {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  mainText: string;
  secondaryText: string;
};

type Waypoint = {
  id: string;
  name: string;
  coords: [number, number];
  color: string;
};

type RouteMetrics = { distanceKm: number; durationMin: number };

type DistanceCache = {
  segmentDistances: number[];
  segmentHeadings: number[];
  cumulativeDistances: number[];
  totalDistance: number;
};

type VehicleState = {
  id: string;
  marker: Marker | null;
  polyline: Polyline | null;
  stopMarkers: Marker[];
  stopIds: string[];
  travelPath: LatLngPoint[];
  cache: DistanceCache;
  stopIndexLookup: Map<number, RouteStop>;
  routeIndex: number;
  segmentProgress: number;
  speedMps: number;
  pauseUntil: number;
};

const startStop: RouteStop = {
  id: "start",
  name: "RS Jantung IHC Karawang",
  description: "Titik keberangkatan ambulans dari kawasan Podomoro Parkland Karawang.",
  coords: [-6.3182, 107.273],
  type: "start",
  wait: 3500,
};

const destinationOptions: DestinationOption[] = [
  {
    label: "Monas",
    value: "monas",
    coords: [-6.1753, 106.8269],
    description: "Kawasan Monumen Nasional, Jakarta Pusat.",
  },
  {
    label: "Stasiun Gambir",
    value: "gambir",
    coords: [-6.1767, 106.8307],
    description: "Stasiun utama menuju pusat transportasi kota.",
  },
  {
    label: "GBK Senayan",
    value: "gbk",
    coords: [-6.2184, 106.8022],
    description: "Kompleks Gelora Bung Karno, Senayan.",
  },
  {
    label: "Bundaran HI",
    value: "bundaran-hi",
    coords: [-6.1931, 106.823],
    description: "Area bundaran Hotel Indonesia, pusat kota.",
  },
  {
    label: "Bandara Soekarno-Hatta",
    value: "soetta",
    coords: [-6.1256, 106.6559],
    description: "Bandara internasional utama di Tangerang.",
  },
  {
    label: "Kustom (isi manual)",
    value: "custom",
    description: "Masukkan koordinat tujuan sendiri.",
  },
];

const defaultDestinationOptions = destinationOptions.filter((option) => option.value !== "custom");

const vehicleOptions: VehicleOption[] = [
  {
    label: "Mobil Besar (car.png)",
    value: "car",
    iconUrl: "/img/car.png",
    size: 36,
    headingOffset: 0,
  },
  {
    label: "Mobil Mini (car-mini.png)",
    value: "mini",
    iconUrl: "/img/car-mini.png",
    size: 30,
    headingOffset: 0,
  },
];

const routeColors = ["#0ea5e9", "#22c55e", "#f97316", "#ef4444", "#a855f7", "#14b8a6"];
const waypointColors = ["#f59e0b", "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#22c55e"];

let vehicleCounter = 1;

function createVehicleConfig(): VehicleConfig {
  const id = `vehicle-${vehicleCounter}`;
  const destinationIndex = (vehicleCounter - 1) % defaultDestinationOptions.length;
  const destinationId = defaultDestinationOptions[destinationIndex]?.value ?? destinationOptions[0].value;
  const color = routeColors[(vehicleCounter - 1) % routeColors.length];
  const label = `Ambulans ${vehicleCounter}`;
  vehicleCounter += 1;

  return {
    id,
    label,
    destinationId,
    vehicleType: vehicleOptions[0].value,
    customDestination: { name: "", lat: "", lng: "" },
    customDestinationError: "",
    appliedCustomDestination: null,
    searchQuery: "",
    searchResults: [],
    searching: false,
    waypointSearchQuery: "",
    waypointSearchResults: [],
    waypointSearching: false,
    waypoints: [],
    waypointError: "",
    color,
    routeWeight: 4,
  };
}

const vehicles = ref<VehicleConfig[]>([createVehicleConfig(), createVehicleConfig()]);
const vehicleMetrics = ref<Record<string, RouteMetrics | null>>({});

const searchServiceError = ref("");
const activeMapTargetVehicleId = ref<string | null>(null);
const autoSearchTimers = new Map<string, ReturnType<typeof setTimeout>>();
const dragState = ref<{ vehicleId: string; waypointId: string | null } | null>(null);

const typeLabels: Record<string, string> = {
  start: "Titik Awal",
  checkpoint: "Checkpoint",
  end: "Titik Tujuan",
};

const markerColors: Record<string, string> = {
  start: "#10b981",
  checkpoint: "#f59e0b",
  end: "#f43f5e",
};

const destinationLabel = computed(() => {
  if (vehicles.value.length === 1) {
    return getDestinationStop(vehicles.value[0]).name;
  }
  return "beberapa tujuan";
});

const headerDescription = computed(() => {
  if (vehicles.value.length === 1) {
    return `Pantau rute ambulans dari ${startStop.name} menuju ${destinationLabel.value} lengkap dengan animasi perjalanan.`;
  }
  return `Pantau rute ambulans dari ${startStop.name} menuju beberapa tujuan lengkap dengan animasi perjalanan.`;
});

const routeDescription = computed(() => {
  if (vehicles.value.length === 1) {
    return `Garis rute menunjukkan perjalanan dari ${startStop.name} ke ${destinationLabel.value}.`;
  }
  return "Garis berwarna menunjukkan rute dari RS Jantung IHC Karawang ke berbagai tujuan.";
});

const displayStops = computed(() => {
  const stops: RouteStop[] = [
    {
      ...startStop,
      id: "start",
    },
  ];

  vehicles.value.forEach((vehicle) => {
    vehicle.waypoints.forEach((waypoint) => {
      stops.push({
        id: `${vehicle.id}-${waypoint.id}`,
        name: vehicles.value.length > 1 ? `${waypoint.name} (${vehicle.label})` : waypoint.name,
        description: "Checkpoint tambahan.",
        coords: waypoint.coords,
        type: "checkpoint",
        wait: 2000,
      });
    });
    const destination = getDestinationStop(vehicle);
    stops.push({
      ...destination,
      id: `${vehicle.id}-end`,
      name: vehicles.value.length > 1 ? `${destination.name} (${vehicle.label})` : destination.name,
    });
  });

  return stops;
});

const summaryText = computed(() => {
  if (!vehicles.value.length) return "";
  if (vehicles.value.length === 1) {
    const metrics = vehicleMetrics.value[vehicles.value[0].id];
    if (metrics) {
      return `Perkiraan durasi ${formatDuration(metrics.durationMin)} dengan jarak ${formatDistance(
        metrics.distanceKm
      )}.`;
    }
  }
  return `Menampilkan ${vehicles.value.length} rute ambulans aktif dari ${startStop.name}.`;
});

const vehicleAccordionItems = computed(() =>
  vehicles.value.map((vehicle, index) => ({
    label: vehicle.label || `Ambulans ${index + 1}`,
    icon: "i-heroicons-truck",
    slot: vehicle.id,
  }))
);

function formatDistance(distanceKm: number) {
  if (!Number.isFinite(distanceKm)) return "";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  const decimals = distanceKm < 10 ? 1 : 0;
  return `${distanceKm.toFixed(decimals)} km`;
}

function formatDuration(durationMin: number) {
  if (!Number.isFinite(durationMin)) return "";
  const totalMinutes = Math.max(1, Math.round(durationMin));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} menit`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
}

function getDestinationStop(vehicle: VehicleConfig): RouteStop {
  if (vehicle.destinationId === "custom" && vehicle.appliedCustomDestination) {
    return vehicle.appliedCustomDestination;
  }

  const selectedOption =
    destinationOptions.find((option) => option.value === vehicle.destinationId) ?? destinationOptions[0];

  if (!selectedOption.coords) {
    return (
      vehicle.appliedCustomDestination ?? {
        id: "end",
        name: destinationOptions[0].label,
        description: destinationOptions[0].description,
        coords: destinationOptions[0].coords ?? [-6.1753, 106.8269],
        type: "end",
        wait: 3500,
      }
    );
  }

  return {
    id: "end",
    name: selectedOption.label,
    description: selectedOption.description,
    coords: selectedOption.coords,
    type: "end",
    wait: 3500,
  };
}

function getVehicleStops(vehicle: VehicleConfig): RouteStop[] {
  const destination = getDestinationStop(vehicle);
  const checkpointStops = vehicle.waypoints.map((waypoint, index) => ({
    id: waypoint.id,
    name: waypoint.name || `Checkpoint ${index + 1}`,
    description: "Checkpoint tambahan.",
    coords: waypoint.coords,
    type: "checkpoint" as const,
    wait: 2000,
    color: waypoint.color,
  }));
  return [startStop, ...checkpointStops, destination];
}

function resolveStopColor(vehicle: VehicleConfig, stopId: string) {
  if (stopId === "end") return vehicle.color;
  const waypoint = vehicle.waypoints.find((point) => point.id === stopId);
  return waypoint?.color ?? vehicle.color;
}

function addVehicle() {
  vehicles.value.push(createVehicleConfig());
}

function removeVehicle(id: string) {
  if (vehicles.value.length <= 1) return;
  vehicles.value = vehicles.value.filter((vehicle) => vehicle.id !== id);
  if (activeMapTargetVehicleId.value === id) {
    activeMapTargetVehicleId.value = null;
  }
  const nextMetrics = { ...vehicleMetrics.value };
  delete nextMetrics[id];
  vehicleMetrics.value = nextMetrics;
}

async function searchLocation(query: string): Promise<SearchResult[]> {
  searchServiceError.value = "";
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    query
  )}&limit=6&countrycodes=id&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "id",
    },
  });

  if (!response.ok) {
    throw new Error("Search service error");
  }

  const results = (await response.json()) as Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
  }>;

  return results.map((item) => {
    const parts = item.display_name.split(",");
    const mainText = parts[0]?.trim() || item.display_name;
    const secondaryText = parts.slice(1).join(",").trim();
    return {
      id: String(item.place_id),
      name: mainText,
      description: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      mainText,
      secondaryText,
    };
  });
}

async function searchPlaces(vehicle: VehicleConfig, mode: "destination" | "waypoint") {
  const query = (mode === "destination" ? vehicle.searchQuery : vehicle.waypointSearchQuery).trim();
  if (!query) {
    if (mode === "destination") {
      vehicle.customDestinationError = "Masukkan kata kunci lokasi.";
    } else {
      vehicle.waypointError = "Masukkan kata kunci lokasi.";
    }
    return;
  }

  vehicle.customDestinationError = "";
  vehicle.waypointError = "";
  vehicle.searching = mode === "destination";
  vehicle.waypointSearching = mode === "waypoint";
  vehicle.searchResults = mode === "destination" ? [] : vehicle.searchResults;
  vehicle.waypointSearchResults = mode === "waypoint" ? [] : vehicle.waypointSearchResults;

  try {
    const results = await searchLocation(query);
    if (!results.length) {
      if (mode === "destination") {
        vehicle.customDestinationError = "Lokasi tidak ditemukan. Coba kata kunci lain.";
      } else {
        vehicle.waypointError = "Lokasi tidak ditemukan. Coba kata kunci lain.";
      }
    }
    if (mode === "destination") {
      vehicle.searchResults = results;
    } else {
      vehicle.waypointSearchResults = results;
    }
  } catch (error) {
    searchServiceError.value = "Gagal mencari lokasi. Coba lagi nanti.";
  } finally {
    vehicle.searching = false;
    vehicle.waypointSearching = false;
  }
}

function selectSearchResult(vehicle: VehicleConfig, result: SearchResult, mode: "destination" | "waypoint") {
  if (!Number.isFinite(result.lat) || !Number.isFinite(result.lng)) {
    if (mode === "destination") {
      vehicle.customDestinationError = "Koordinat lokasi tidak valid.";
    } else {
      vehicle.waypointError = "Koordinat lokasi tidak valid.";
    }
    return;
  }

  if (mode === "destination") {
    vehicle.searchResults = [];
    vehicle.searchQuery = result.name;
    vehicle.customDestination = {
      name: result.name,
      lat: result.lat.toFixed(6),
      lng: result.lng.toFixed(6),
    };
    vehicle.appliedCustomDestination = {
      id: "end",
      name: result.name,
      description: result.description,
      coords: [result.lat, result.lng],
      type: "end",
      wait: 3500,
    };
    vehicle.destinationId = "custom";
    return;
  }

  addWaypoint(vehicle, {
    id: `wp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: result.name,
    coords: [result.lat, result.lng],
    color: waypointColors[vehicle.waypoints.length % waypointColors.length],
  });
  vehicle.waypointError = "";
  vehicle.waypointSearchResults = [];
  vehicle.waypointSearchQuery = "";
}

function addWaypoint(vehicle: VehicleConfig, waypoint: Waypoint) {
  vehicle.waypoints.push(waypoint);
}

function removeWaypoint(vehicle: VehicleConfig, waypointId: string) {
  vehicle.waypoints = vehicle.waypoints.filter((point) => point.id !== waypointId);
}

function scheduleAutoSearch(vehicle: VehicleConfig, mode: "destination" | "waypoint") {
  const key = `${vehicle.id}:${mode}`;
  const query = mode === "destination" ? vehicle.searchQuery : vehicle.waypointSearchQuery;

  if (autoSearchTimers.has(key)) {
    clearTimeout(autoSearchTimers.get(key));
  }

  if (!query || query.trim().length < 3) {
    if (mode === "destination") {
      vehicle.searchResults = [];
    } else {
      vehicle.waypointSearchResults = [];
    }
    return;
  }

  autoSearchTimers.set(
    key,
    setTimeout(() => {
      searchPlaces(vehicle, mode);
    }, 450)
  );
}

function handleWaypointDragStart(vehicleId: string, waypointId: string) {
  dragState.value = { vehicleId, waypointId };
}

function handleWaypointDrop(vehicle: VehicleConfig, targetId: string) {
  if (!dragState.value || dragState.value.vehicleId !== vehicle.id) return;
  const sourceId = dragState.value.waypointId;
  if (!sourceId || sourceId === targetId) return;

  const current = vehicle.waypoints.slice();
  const sourceIndex = current.findIndex((point) => point.id === sourceId);
  const targetIndex = current.findIndex((point) => point.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;

  const [moved] = current.splice(sourceIndex, 1);
  current.splice(targetIndex, 0, moved);
  vehicle.waypoints = current;
}

function handleWaypointDragEnd() {
  dragState.value = null;
}

function enableMapWaypoint(vehicleId: string) {
  activeMapTargetVehicleId.value = vehicleId;
}

function cancelMapWaypoint() {
  activeMapTargetVehicleId.value = null;
}

let mapInstance: LeafletMap | null = null;
let leafletRef: typeof import("leaflet") | null = null;
let animationFrame: number | null = null;
let lastTimestamp: number | null = null;
let startMarker: Marker | null = null;
const vehicleStates = new Map<string, VehicleState>();
let mapBuildId = 0;

function distanceMeters(start: LatLngPoint, end: LatLngPoint) {
  if (leafletRef) {
    return leafletRef.latLng(start.lat, start.lng).distanceTo([end.lat, end.lng]);
  }
  const dx = start.lng - end.lng;
  const dy = start.lat - end.lat;
  return Math.sqrt(dx * dx + dy * dy) * 111_000;
}

function computePathDistanceKm(path: LatLngPoint[]) {
  if (path.length < 2) return 0;
  let meters = 0;
  for (let index = 0; index < path.length - 1; index += 1) {
    meters += distanceMeters(path[index], path[index + 1]);
  }
  return meters / 1000;
}

function getHeadingDegrees(start: LatLngPoint, end: LatLngPoint) {
  const radians = Math.atan2(end.lng - start.lng, end.lat - start.lat);
  let degrees = (radians * 180) / Math.PI;
  if (degrees < 0) degrees += 360;
  return degrees;
}

function buildDistanceCache(path: LatLngPoint[]): DistanceCache {
  const segmentDistances: number[] = [];
  const segmentHeadings: number[] = [];
  const cumulativeDistances: number[] = [0];
  let totalDistance = 0;

  if (path.length < 2) {
    return { segmentDistances, segmentHeadings, cumulativeDistances, totalDistance };
  }

  for (let index = 0; index < path.length - 1; index += 1) {
    const distance = distanceMeters(path[index], path[index + 1]);
    segmentDistances.push(distance);
    segmentHeadings.push(getHeadingDegrees(path[index], path[index + 1]));
    totalDistance += distance;
    cumulativeDistances.push(totalDistance);
  }

  return { segmentDistances, segmentHeadings, cumulativeDistances, totalDistance };
}

function getPositionAtDistance(path: LatLngPoint[], cache: DistanceCache, distance: number) {
  if (!path.length) {
    return { position: { lat: startStop.coords[0], lng: startStop.coords[1] }, heading: 0 };
  }
  if (cache.totalDistance === 0 || cache.segmentDistances.length === 0) {
    return { position: path[0], heading: 0 };
  }

  let target = distance % cache.totalDistance;
  if (target < 0) target += cache.totalDistance;

  let left = 0;
  let right = cache.cumulativeDistances.length - 2;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (cache.cumulativeDistances[mid + 1] <= target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  const segmentIndex = Math.min(left, cache.segmentDistances.length - 1);
  const segmentDistance = cache.segmentDistances[segmentIndex] || 0;
  const startPoint = path[segmentIndex];
  const endPoint = path[segmentIndex + 1] ?? startPoint;
  const ratio = segmentDistance ? (target - cache.cumulativeDistances[segmentIndex]) / segmentDistance : 0;
  const position = {
    lat: startPoint.lat + (endPoint.lat - startPoint.lat) * ratio,
    lng: startPoint.lng + (endPoint.lng - startPoint.lng) * ratio,
  };

  return { position, heading: cache.segmentHeadings[segmentIndex] ?? 0 };
}

function getVehicleOption(vehicle: VehicleConfig) {
  return vehicleOptions.find((option) => option.value === vehicle.vehicleType) ?? vehicleOptions[0];
}

function createVehicleIcon(option: VehicleOption) {
  if (!leafletRef) return null;
  const size = option.size;
  const html = `
    <div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:transparent;">
      <img src="${option.iconUrl}" alt="" style="width:${size}px;height:${size}px;display:block;transform:rotate(0deg);transform-origin:50% 50%;" />
    </div>
  `;
  return leafletRef.divIcon({
    html,
    className: "vehicle-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function updateVehicleHeading(marker: Marker, heading: number) {
  const element = marker.getElement();
  const img = element?.querySelector("img") as HTMLImageElement | null;
  if (img) {
    img.style.transform = `rotate(${heading}deg)`;
  }
}

function updateVehiclePopup(vehicle: VehicleConfig, metrics: RouteMetrics | null) {
  const state = vehicleStates.get(vehicle.id);
  if (!state?.marker) return;
  const destination = getDestinationStop(vehicle);
  const metricsText = metrics
    ? `<br><span>Estimasi ${formatDuration(metrics.durationMin)} • ${formatDistance(metrics.distanceKm)}</span>`
    : "";
  const content = `<strong>${vehicle.label}</strong><br>Tujuan: ${destination.name}${metricsText}`;
  state.marker.bindPopup(content);
}

function applyVehiclePosition(state: VehicleState, vehicle: VehicleConfig, baseDistance: number) {
  if (!state.marker || !state.travelPath.length) return;
  const { position, heading } = getPositionAtDistance(state.travelPath, state.cache, baseDistance);
  state.marker.setLatLng([position.lat, position.lng]);
  const option = getVehicleOption(vehicle);
  updateVehicleHeading(state.marker, heading + (option.headingOffset ?? 0));
}

function handleMapClick(event: { latlng: { lat: number; lng: number } }) {
  const targetId = activeMapTargetVehicleId.value;
  if (!targetId) return;
  const vehicle = vehicles.value.find((item) => item.id === targetId);
  if (!vehicle) return;

  const lat = Number(event.latlng.lat.toFixed(6));
  const lng = Number(event.latlng.lng.toFixed(6));
  const name = `Checkpoint ${vehicle.waypoints.length + 1}`;
  addWaypoint(vehicle, {
    id: `wp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    coords: [lat, lng],
    color: waypointColors[vehicle.waypoints.length % waypointColors.length],
  });

  activeMapTargetVehicleId.value = null;
}

function findClosestIndex(path: LatLngPoint[], coords: [number, number]) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  path.forEach((point, index) => {
    const dx = point.lng - coords[1];
    const dy = point.lat - coords[0];
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function buildStopsForRoute(stops: RouteStop[], path: LatLngPoint[]) {
  return stops;
}

function normalizeStopsToRoute(stops: RouteStop[], path: LatLngPoint[]) {
  if (!path.length) return stops;
  return stops.map((stop, index) => {
    const pathIndex =
      index === 0 ? 0 : index === stops.length - 1 ? path.length - 1 : findClosestIndex(path, stop.coords);
    return {
      ...stop,
      coords: [path[pathIndex].lat, path[pathIndex].lng],
      pathIndex,
    };
  });
}

async function fetchRoutePath(points: [number, number][]) {
  try {
    const coordString = points.map((point) => `${point[1]},${point[0]}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.code !== "Ok" || !Array.isArray(data?.routes) || !data.routes[0]?.geometry?.coordinates?.length) {
      return null;
    }
    const route = data.routes[0];
    const path: LatLngPoint[] = route.geometry.coordinates.map(([lng, lat]: [number, number]) => ({
      lat,
      lng,
    }));
    return {
      path,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    };
  } catch (error) {
    return null;
  }
}

function buildTravelData(path: LatLngPoint[], stops: RouteStop[]) {
  if (path.length < 2) {
    return {
      stops,
      travelPath: path,
      cache: buildDistanceCache(path),
      stopIndexLookup: new Map<number, RouteStop>(),
    };
  }

  const stopsForRoute = buildStopsForRoute(stops, path);
  const normalizedStops = normalizeStopsToRoute(stopsForRoute, path);
  const travelPath = path.concat(path.slice(0, -1).reverse());
  const cache = buildDistanceCache(travelPath);
  const stopIndexLookup = new Map<number, RouteStop>();

  normalizedStops.forEach((stop) => {
    if (typeof stop.pathIndex !== "number") return;
    stopIndexLookup.set(stop.pathIndex, stop);
    const reverseIndex = path.length - 1 + (path.length - 1 - stop.pathIndex);
    stopIndexLookup.set(reverseIndex, stop);
  });

  return { stops: normalizedStops, travelPath, cache, stopIndexLookup };
}

function buildVehiclePopup(vehicle: VehicleConfig, destination: RouteStop, metrics: RouteMetrics | null) {
  const metricsText = metrics
    ? `<br><span>Estimasi ${formatDuration(metrics.durationMin)} • ${formatDistance(metrics.distanceKm)}</span>`
    : "";
  return `<strong>${vehicle.label}</strong><br>Tujuan: ${destination.name}${metricsText}`;
}

function clearVehicleState(state: VehicleState) {
  state.marker?.remove();
  state.polyline?.remove();
  state.stopMarkers.forEach((marker) => marker.remove());
}

function clearAllVehicleStates() {
  vehicleStates.forEach((state) => clearVehicleState(state));
  vehicleStates.clear();
}

function extendBounds(bounds: LatLngBounds, path: LatLngPoint[]) {
  if (!leafletRef || path.length === 0) return;
  const step = Math.max(1, Math.floor(path.length / 60));
  for (let index = 0; index < path.length; index += step) {
    bounds.extend([path[index].lat, path[index].lng]);
  }
}

async function buildVehicleRoute(vehicle: VehicleConfig, bounds: LatLngBounds, buildId: number) {
  if (!leafletRef || !mapInstance) return;
  const stops = getVehicleStops(vehicle);
  const destination = stops[stops.length - 1];
  let routePath: LatLngPoint[] = stops.map((stop) => ({ lat: stop.coords[0], lng: stop.coords[1] }));
  let metrics: RouteMetrics | null = null;

  const routeData = await fetchRoutePath(stops.map((stop) => stop.coords));
  if (buildId !== mapBuildId) return;

  if (routeData?.path?.length) {
    routePath = routeData.path;
    metrics = { distanceKm: routeData.distanceKm, durationMin: routeData.durationMin };
  }

  if (!metrics && routePath.length > 1) {
    const distanceKm = computePathDistanceKm(routePath);
    if (distanceKm) {
      metrics = { distanceKm, durationMin: (distanceKm / 50) * 60 };
    }
  }

  const travelData = buildTravelData(routePath, stops);

  const polyline = leafletRef
    .polyline(
      routePath.map((point) => [point.lat, point.lng]),
      {
        color: vehicle.color,
        weight: Math.min(Math.max(vehicle.routeWeight || 4, 2), 8),
        opacity: 0.9,
      }
    )
    .addTo(mapInstance);

  const stopMarkers: Marker[] = [];
  const stopIds: string[] = [];
  travelData.stops.forEach((stop) => {
    if (stop.type === "start") return;
    const stopColor = stop.color ?? vehicle.color;
    const marker = leafletRef!
      .circleMarker(stop.coords, {
        radius: 7,
        weight: 2,
        color: stopColor,
        fillColor: stopColor,
        fillOpacity: 0.9,
      })
      .addTo(mapInstance!);
    marker.bindPopup(`<strong>${stop.name}</strong><br>${stop.description}`);
    stopMarkers.push(marker);
    stopIds.push(stop.id);
  });

  const option = getVehicleOption(vehicle);
  const icon = createVehicleIcon(option);
  const marker = icon
    ? leafletRef.marker([travelData.travelPath[0].lat, travelData.travelPath[0].lng], {
        icon,
        interactive: true,
      })
    : null;

  if (marker) {
    marker.addTo(mapInstance);
    marker.bindPopup(buildVehiclePopup(vehicle, destination, metrics));
  }

  const speedMps = metrics ? Math.min(Math.max((metrics.distanceKm * 1000) / 70, 180), 900) : 260;

  vehicleStates.set(vehicle.id, {
    id: vehicle.id,
    marker,
    polyline,
    stopMarkers,
    stopIds,
    travelPath: travelData.travelPath,
    cache: travelData.cache,
    stopIndexLookup: travelData.stopIndexLookup,
    routeIndex: 0,
    segmentProgress: 0,
    speedMps,
    pauseUntil: 0,
  });

  vehicleMetrics.value = {
    ...vehicleMetrics.value,
    [vehicle.id]: metrics,
  };

  updateVehiclePopup(vehicle, metrics);
  extendBounds(bounds, routePath);
}

async function initMap() {
  mapBuildId += 1;
  const buildId = mapBuildId;
  if (mapInstance) return;

  leafletRef = await import("leaflet");
  if (buildId !== mapBuildId) return;

  mapInstance = leafletRef.map(mapContainerId, { zoomControl: false });
  mapInstance.setView(startStop.coords, 11);
  mapInstance.on("click", handleMapClick);

  leafletRef
    .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })
    .addTo(mapInstance);

  startMarker = leafletRef
    .circleMarker(startStop.coords, {
      radius: 8,
      weight: 2,
      color: markerColors.start,
      fillColor: markerColors.start,
      fillOpacity: 0.9,
    })
    .addTo(mapInstance);
  startMarker.bindPopup(`<strong>${startStop.name}</strong><br>${startStop.description}`);

  const bounds = leafletRef.latLngBounds([startStop.coords]);
  await Promise.all(vehicles.value.map((vehicle) => buildVehicleRoute(vehicle, bounds, buildId)));

  if (buildId !== mapBuildId || !mapInstance) return;
  if (bounds.isValid()) {
    mapInstance.fitBounds(bounds, { padding: [24, 24] });
  }

  setTimeout(() => {
    mapInstance?.invalidateSize();
  }, 300);

  if (vehicleStates.size) {
    lastTimestamp = null;
    animationFrame = requestAnimationFrame(animateVehicles);
  }
}

function stopAnimation() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  lastTimestamp = null;
}

function resetMap() {
  stopAnimation();
  clearAllVehicleStates();
  startMarker?.remove();
  startMarker = null;
  activeMapTargetVehicleId.value = null;
  if (mapInstance) {
    mapInstance.off("click", handleMapClick);
    mapInstance.remove();
    mapInstance = null;
  }
  initMap();
}

function animateVehicles(timestamp = 0) {
  if (!vehicleStates.size) return;
  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
  }

  const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.12);
  lastTimestamp = timestamp;

  vehicleStates.forEach((state) => {
    const vehicle = vehicles.value.find((item) => item.id === state.id);
    if (!vehicle || !state.marker || state.cache.totalDistance === 0 || state.travelPath.length < 2) {
      return;
    }

    if (state.pauseUntil && timestamp < state.pauseUntil) {
      const baseDistance = (state.cache.cumulativeDistances[state.routeIndex] ?? 0) + state.segmentProgress;
      applyVehiclePosition(state, vehicle, baseDistance);
      return;
    }

    if (state.pauseUntil && timestamp >= state.pauseUntil) {
      state.pauseUntil = 0;
      state.marker.closePopup();
    }

    let remaining = state.speedMps * deltaSeconds;

    while (remaining > 0) {
      if (state.routeIndex >= state.travelPath.length - 1) {
        state.routeIndex = 0;
        state.segmentProgress = 0;
      }

      const segmentDistance = state.cache.segmentDistances[state.routeIndex] ?? 0;
      if (segmentDistance === 0) {
        state.routeIndex++;
        continue;
      }

      const distanceLeft = segmentDistance - state.segmentProgress;

      if (remaining >= distanceLeft) {
        remaining -= distanceLeft;
        state.segmentProgress = 0;
        state.routeIndex++;

        const currentStop = state.stopIndexLookup.get(state.routeIndex);
        if (currentStop) {
          state.marker.openPopup();
          state.pauseUntil = timestamp + currentStop.wait;
          return;
        }
      } else {
        state.segmentProgress += remaining;
        remaining = 0;
      }
    }

    const baseDistance = (state.cache.cumulativeDistances[state.routeIndex] ?? 0) + state.segmentProgress;
    applyVehiclePosition(state, vehicle, baseDistance);
  });

  animationFrame = requestAnimationFrame(animateVehicles);
}

function refreshVehicleIcons() {
  if (!leafletRef) return;
  vehicleStates.forEach((state) => {
    const vehicle = vehicles.value.find((item) => item.id === state.id);
    if (!vehicle || !state.marker) return;
    const icon = createVehicleIcon(getVehicleOption(vehicle));
    if (icon) {
      state.marker.setIcon(icon);
    }
    updateVehiclePopup(vehicle, vehicleMetrics.value[vehicle.id] ?? null);
  });
}

function refreshRouteStyles() {
  if (!leafletRef) return;
  vehicleStates.forEach((state) => {
    const vehicle = vehicles.value.find((item) => item.id === state.id);
    if (!vehicle) return;
    if (state.polyline) {
      state.polyline.setStyle({
        color: vehicle.color,
        weight: Math.min(Math.max(vehicle.routeWeight || 4, 2), 8),
        opacity: 0.9,
      });
    }
    state.stopMarkers.forEach((marker, index) => {
      const stopId = state.stopIds[index];
      const stopColor = resolveStopColor(vehicle, stopId);
      const anyMarker = marker as any;
      if (typeof anyMarker.setStyle === "function") {
        anyMarker.setStyle({
          color: stopColor,
          fillColor: stopColor,
        });
      }
    });
  });
}

let routeWatcher: (() => void) | null = null;
let iconWatcher: (() => void) | null = null;
let styleWatcher: (() => void) | null = null;

onMounted(() => {
  initMap();

  routeWatcher = watch(
    () =>
      vehicles.value.map(
        (vehicle) => {
          const destination = getDestinationStop(vehicle);
          const waypointSignature = vehicle.waypoints
            .map((point) => `${point.coords[0]}:${point.coords[1]}`)
            .join("|");
          return `${vehicle.id}:${vehicle.destinationId}:${destination.coords[0]}:${destination.coords[1]}:${waypointSignature}`;
        }
      ),
    () => {
      vehicles.value.forEach((vehicle) => {
        if (vehicle.destinationId !== "custom") {
          vehicle.customDestinationError = "";
        }
      });
      resetMap();
    }
  );

  iconWatcher = watch(
    () => vehicles.value.map((vehicle) => `${vehicle.id}:${vehicle.vehicleType}:${vehicle.label}`),
    () => {
      refreshVehicleIcons();
    }
  );

  styleWatcher = watch(
    () =>
      vehicles.value.map((vehicle) => {
        const waypointColors = vehicle.waypoints.map((point) => `${point.id}:${point.color}`).join("|");
        return `${vehicle.id}:${vehicle.color}:${vehicle.routeWeight}:${waypointColors}`;
      }),
    () => {
      refreshRouteStyles();
    }
  );
});

onBeforeUnmount(() => {
  if (routeWatcher) routeWatcher();
  if (iconWatcher) iconWatcher();
  if (styleWatcher) styleWatcher();
  autoSearchTimers.forEach((timer) => clearTimeout(timer));
  autoSearchTimers.clear();
  stopAnimation();
  clearAllVehicleStates();
  startMarker?.remove();
  startMarker = null;
  if (mapInstance) {
    mapInstance.off("click", handleMapClick);
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>
