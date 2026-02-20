<template>
  <div class="min-h-screen bg-white">
    <div class="w-full space-y-6 py-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary-500">Navigasi</p>
          <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl">Peta Rute Ambulans</h1>
          <p class="text-sm text-gray-500">
            Pantau pergerakan ambulans dan titik penting untuk memastikan respon cepat terhadap pasien.
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
                Garis biru menunjukkan rute dari titik awal menuju lokasi pasien dan pantai tujuan.
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

          <div class="relative">
            <div :id="mapContainerId" class="h-[320px] w-full sm:h-[420px] lg:h-[520px]"></div>

            <div
              class="pointer-events-none absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-3 sm:gap-4 lg:bottom-6 lg:left-6 lg:right-auto"
            >
              <div
                v-for="stop in routeStops"
                :key="stop.id"
                class="rounded-xl bg-white/85 p-4 shadow backdrop-blur"
              >
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {{ typeLabels[stop.type] }}
                </p>
                <p class="text-sm font-semibold text-gray-900">{{ stop.name }}</p>
                <p class="mt-1 text-xs text-gray-500">
                  {{ stop.description }}
                </p>
              </div>
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

          <div class="space-y-4">
            <div class="rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
              Rata-rata durasi antar titik sekitar 12 menit dengan total jarak tempuh kurang lebih 22 km.
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
              <li>• Rute utama melewati wilayah Wonosari dengan lalu lintas padat.</li>
              <li>• Pastikan bahan bakar cadangan terisi untuk perjalanan pulang.</li>
              <li>• Koordinasi dengan pos kesehatan terdekat setiap 30 menit.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { Map as LeafletMap, Polyline, Marker } from "leaflet";
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
};

const routeStops = ref<RouteStop[]>([]);
const activeStops = ref<RouteStop[]>([]);

const fallbackStops: RouteStop[] = [
  {
    id: "start",
    name: "RSUD Wonosari",
    description: "Posko keberangkatan ambulans di pusat kota Wonosari.",
    coords: [-7.9653, 110.6054],
    type: "start",
    wait: 3500,
  },
  {
    id: "checkpoint",
    name: "Klinik Pratama",
    description: "Checkpoint pemeriksaan awal kondisi pasien.",
    coords: [-7.9712, 110.6132],
    type: "checkpoint",
    wait: 2000,
  },
  {
    id: "end",
    name: "Pantai Indrayanti",
    description: "Lokasi tujuan pasien dan serah terima tim medis.",
    coords: [-8.151, 110.6167],
    type: "end",
    wait: 3500,
  },
];

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

const { data: routeResponse } = await useAsyncData(
  "ambulance-route",
  () => $fetch("/api/routes/ambulance"),
  {
    default: () => ({ data: { stops: [] } }),
    server: false,
  }
);

watch(
  () => routeResponse.value,
  (value) => {
    const stops = (value as any)?.data?.stops;
    if (Array.isArray(stops)) {
      routeStops.value = stops;
    }
  },
  { immediate: true }
);

let mapInstance: LeafletMap | null = null;
let routePolyline: Polyline | null = null;
let carMarker: Marker | null = null;
let animationFrame: number | null = null;
let delayTimer: ReturnType<typeof setTimeout> | null = null;

const carSpeed = 0.00005;
let routeIndex = 0;
let progress = 0;

async function initMap(stops: RouteStop[]) {
  const L = await import("leaflet");

  if (!stops.length || mapInstance) {
    return;
  }

  mapInstance = L.map(mapContainerId, { zoomControl: false });
  mapInstance.setView(stops[0].coords, 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapInstance);

  if (stops.length > 1) {
    routePolyline = L.polyline(stops.map((stop) => stop.coords), {
      color: "#0ea5e9",
      weight: 4,
      opacity: 0.9,
    }).addTo(mapInstance);

    const bounds = L.latLngBounds(stops.map((stop) => stop.coords));
    mapInstance.fitBounds(bounds, { padding: [24, 24] });
  }

  activeStops.value = stops;
  stops.forEach((stop) => {
    const marker = L.circleMarker(stop.coords, {
      radius: 8,
      weight: 2,
      color: markerColors[stop.type],
      fillColor: markerColors[stop.type],
      fillOpacity: 0.9,
    }).addTo(mapInstance!);

    marker.bindPopup(`<strong>${stop.name}</strong><br>${stop.description}`);
  });

  const carIcon = L.icon({
    iconUrl: "/img/car.png",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  carMarker = L.marker(stops[0].coords, { icon: carIcon }).addTo(mapInstance);

  // reflow map on container resize
  setTimeout(() => {
    mapInstance?.invalidateSize();
  }, 300);

  if (routePolyline) {
    animateCar(4000);
  }
}

function animateCar(waitTime = 2000) {
  if (!routePolyline || !carMarker) {
    return;
  }

  const routeLatLngs = routePolyline.getLatLngs() as Array<{ lat: number; lng: number }>;
  if (routeLatLngs.length < 2) {
    return;
  }
  if (routeIndex >= routeLatLngs.length - 1) {
    routeIndex = 0;
    progress = 0;
    carMarker.setLatLng(routeLatLngs[0]);
  }

  const startPoint = routeLatLngs[routeIndex];
  const endPoint = routeLatLngs[routeIndex + 1];
  const dx = endPoint.lng - startPoint.lng;
  const dy = endPoint.lat - startPoint.lat;
  const distance = Math.sqrt(dx * dx + dy * dy);

  progress += carSpeed;

  if (progress >= distance) {
    progress = 0;
    routeIndex++;

    const currentStop = activeStops.value.find(
      (stop) => stop.coords[0] === endPoint.lat && stop.coords[1] === endPoint.lng
    );

    if (currentStop) {
      carMarker.bindPopup(`<strong>${currentStop.name}</strong><br>${currentStop.description}`).openPopup();
      delayTimer = setTimeout(() => {
        carMarker?.closePopup();
        animationFrame = requestAnimationFrame(() => animateCar(currentStop.wait));
      }, currentStop.wait);
      return;
    }
  } else {
    const newLng = startPoint.lng + (dx * progress) / distance;
    const newLat = startPoint.lat + (dy * progress) / distance;
    carMarker.setLatLng([newLat, newLng]);
  }

  animationFrame = requestAnimationFrame(() => animateCar(waitTime));
}

function stopAnimation() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  if (delayTimer) {
    clearTimeout(delayTimer);
    delayTimer = null;
  }
}

let stopWatcher: (() => void) | null = null;

onMounted(() => {
  stopWatcher = watch(
    () => (routeStops.value.length ? routeStops.value : fallbackStops),
    (stops) => {
      if (!stops.length) return;
      stopAnimation();
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
      routePolyline = null;
      carMarker = null;
      routeIndex = 0;
      progress = 0;
      initMap(stops);
    },
    { immediate: true }
  );
});

onBeforeUnmount(() => {
  if (stopWatcher) {
    stopWatcher();
    stopWatcher = null;
  }
  stopAnimation();
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  routePolyline = null;
  carMarker = null;
});
</script>

<style scoped>
#ambulance-map {
  height: 100%;
  width: 100%;
}
</style>
