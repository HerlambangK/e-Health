<template>
  <section id="map3d" class="py-16 sm:py-20">
    <div class="home-container grid gap-10 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
      <div class="space-y-6">
        <div
          class="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-200"
        >
          3D Map Feature
        </div>
        <h2 class="font-display text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          Eksplorasi RS Jantung & Pembuluh Darah IHC Karawang dalam peta 3D.
        </h2>
        <p class="text-base leading-relaxed text-slate-600 sm:text-lg">
          Tampilan peta interaktif ini menampilkan marker rumah sakit, boundary kampus, dan bentuk gedung 3D untuk
          membantu visualisasi lokasi secara real-time.
        </p>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="glass-card rounded-2xl p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Koordinat</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">Lat -6.3182, Lng 107.2730</p>
            <p class="text-xs text-slate-500">Podomoro Parkland, Karawang</p>
          </div>
          <div class="glass-card rounded-2xl p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Jumlah Bed</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">92 Bed</p>
            <p class="text-xs text-slate-500">Rencana kapasitas layanan</p>
          </div>
          <div class="glass-card rounded-2xl p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Luas Lahan</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">6.326 m²</p>
            <p class="text-xs text-slate-500">Boundary kampus</p>
          </div>
          <div class="glass-card rounded-2xl p-4">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Jumlah Lantai</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">9 Lantai</p>
            <p class="text-xs text-slate-500">1 semi-basement</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton size="sm" color="primary" @click="focusHospital">Fokus Lokasi</UButton>
          <UButton size="sm" color="gray" variant="soft" @click="toggle3D">
            {{ is3D ? "Mode 2D" : "Mode 3D" }}
          </UButton>
        </div>

        <p v-if="mapError" class="text-sm font-semibold text-rose-600">
          {{ mapError }}
        </p>
      </div>

      <div class="relative">
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div :id="mapContainerId" class="h-[320px] w-full sm:h-[420px] lg:h-[520px]"></div>
        </div>

        <div
          class="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow backdrop-blur"
        >
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          {{ mapReady ? (is3D ? "Mode 3D aktif" : "Mode 2D aktif") : "Memuat peta..." }}
        </div>

        <div
          v-if="!mapReady && !mapError"
          class="absolute inset-0 z-20 flex items-center justify-center bg-white/60 text-sm font-medium text-gray-600"
        >
          <div class="rounded-2xl bg-white/90 px-4 py-2 shadow">Menyiapkan tampilan peta...</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type mapboxgl from "mapbox-gl";

const runtimeConfig = useRuntimeConfig();
const mapContainerId = "ihc-3d-public-map";
const mapReady = ref(false);
const mapError = ref("");
const is3D = ref(true);

const mapboxToken = computed(() =>
  (runtimeConfig.public.mapboxToken || "").trim().replace(/^['"]|['"]$/g, "")
);

const hospital = {
  name: "RS Jantung & Pembuluh Darah IHC Karawang",
  coords: [107.273, -6.3182] as [number, number],
};

const campusGeojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Kawasan IHC Karawang" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.2726, -6.31845],
            [107.2734, -6.31855],
            [107.2735, -6.31798],
            [107.2727, -6.31792],
            [107.2726, -6.31845],
          ],
        ],
      },
    },
  ],
};

const buildingGeojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "RSJPD IHC Karawang",
        height: 45,
        base: 0,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.27295, -6.31835],
            [107.27328, -6.31842],
            [107.27335, -6.31812],
            [107.27302, -6.31805],
            [107.27295, -6.31835],
          ],
        ],
      },
    },
  ],
};

const campusBounds = getPolygonBounds(campusGeojson.features[0].geometry.coordinates[0]);

let mapInstance: mapboxgl.Map | null = null;
let mapboxLib: typeof mapboxgl | null = null;
let markerInstance: mapboxgl.Marker | null = null;
let markerPopup: mapboxgl.Popup | null = null;
let buildingPopup: mapboxgl.Popup | null = null;

function getPolygonBounds(coords: [number, number][]) {
  let minLng = coords[0][0];
  let maxLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];

  coords.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ] as [[number, number], [number, number]];
}

async function waitForMapContainer(maxFrames = 30) {
  for (let attempt = 0; attempt < maxFrames; attempt += 1) {
    await nextTick();
    const container = document.getElementById(mapContainerId);
    if (container) {
      const { width, height } = container.getBoundingClientRect();
      if (width > 10 && height > 10) return container;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.getElementById(mapContainerId);
}

function scheduleMapResize(attempt = 0) {
  if (!mapInstance) return;
  const { width, height } = mapInstance.getContainer().getBoundingClientRect();

  if ((width < 10 || height < 10) && attempt < 5) {
    requestAnimationFrame(() => scheduleMapResize(attempt + 1));
    return;
  }

  mapInstance.resize();
}

function normalizeMapboxError(error: unknown) {
  if (!error) return "Gagal memuat Mapbox. Periksa token dan koneksi.";
  const message = (error as { message?: string; status?: number })?.message || String(error);
  const status = (error as { status?: number })?.status;

  if (status === 401 || message.includes("401")) {
    return "Token tidak valid. Gunakan Mapbox public token (pk.*).";
  }
  if (status === 403 || message.includes("403")) {
    return "Akses ditolak. Periksa Allowed URLs di Mapbox.";
  }
  return message;
}

async function initMap() {
  if (mapInstance) return;

  try {
    const container = await waitForMapContainer();
    if (!container) {
      mapError.value = "Container peta belum siap. Silakan refresh halaman.";
      return;
    }

    if (!mapboxToken.value || !mapboxToken.value.startsWith("pk.")) {
      mapError.value = "Token Mapbox tidak valid. Gunakan token public (pk.*).";
      return;
    }

    const mapboxModule = await import("mapbox-gl");
    mapboxLib = mapboxModule.default;
    mapboxLib.accessToken = mapboxToken.value;

    mapInstance = new mapboxLib.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: hospital.coords,
      zoom: 17.1,
      pitch: is3D.value ? 60 : 0,
      bearing: 20,
      antialias: true,
      interactive: true,
      projection: "mercator",
    });

    mapInstance.scrollZoom.disable();

    mapInstance.on("load", () => {
      scheduleMapResize();
      setupScene(mapInstance!);
      addMarker(mapInstance!);
      mapReady.value = true;
      focusHospital();
      enableInteractions();
    });

    mapInstance.on("error", (event) => {
      if (mapError.value) return;
      mapError.value = normalizeMapboxError(event?.error ?? event);
      mapReady.value = false;
      console.error("Mapbox error:", event?.error ?? event);
    });
  } catch (error) {
    mapError.value = normalizeMapboxError(error);
  }
}

function enableInteractions() {
  if (!mapInstance) return;
  mapInstance.dragPan.enable();
  mapInstance.dragRotate.enable();
  mapInstance.doubleClickZoom.enable();
  mapInstance.touchZoomRotate.enable();
  mapInstance.keyboard.enable();
}

function setupScene(map: mapboxgl.Map) {
  ensureTerrain(map);
  ensureCampus(map);
  ensureBuildings(map);
  ensureCustomBuilding(map);
  attachBuildingInteractions(map);
}

function ensureTerrain(map: mapboxgl.Map) {
  if (!map.getSource("mapbox-dem")) {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });
  }

  if (is3D.value) {
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
  } else {
    map.setTerrain(null);
  }
}

function ensureCampus(map: mapboxgl.Map) {
  if (!map.getSource("ihc-campus")) {
    map.addSource("ihc-campus", {
      type: "geojson",
      data: campusGeojson,
    });
  }

  if (!map.getLayer("ihc-campus-fill")) {
    map.addLayer({
      id: "ihc-campus-fill",
      type: "fill",
      source: "ihc-campus",
      paint: {
        "fill-color": "#38bdf8",
        "fill-opacity": 0.2,
      },
    });
  }

  if (!map.getLayer("ihc-campus-outline")) {
    map.addLayer({
      id: "ihc-campus-outline",
      type: "line",
      source: "ihc-campus",
      paint: {
        "line-color": "#0284c7",
        "line-width": 2,
      },
    });
  }
}

function ensureBuildings(map: mapboxgl.Map) {
  if (map.getLayer("3d-buildings")) return;

  const layers = map.getStyle().layers ?? [];
  const labelLayerId = layers.find(
    (layer) => layer.type === "symbol" && layer.layout && "text-field" in layer.layout
  )?.id;

  map.addLayer(
    {
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 14.8,
      paint: {
        "fill-extrusion-color": "#cbd5f5",
        "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14.8, 0, 16, ["get", "height"]],
        "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 14.8, 0, 16, ["get", "min_height"]],
        "fill-extrusion-opacity": 0.6,
      },
    },
    labelLayerId
  );

  updateBuildingVisibility();
}

function ensureCustomBuilding(map: mapboxgl.Map) {
  if (!map.getSource("ihc-building")) {
    map.addSource("ihc-building", {
      type: "geojson",
      data: buildingGeojson,
    });
  }

  if (!map.getLayer("ihc-building-extrusion")) {
    map.addLayer({
      id: "ihc-building-extrusion",
      type: "fill-extrusion",
      source: "ihc-building",
      minzoom: 14,
      paint: {
        "fill-extrusion-color": "#94a3b8",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "base"],
        "fill-extrusion-opacity": 0.85,
      },
    });
  }

  updateBuildingVisibility();
}

function updateBuildingVisibility() {
  if (!mapInstance) return;
  if (mapInstance.getLayer("3d-buildings")) {
    mapInstance.setLayoutProperty("3d-buildings", "visibility", is3D.value ? "visible" : "none");
  }
  if (mapInstance.getLayer("ihc-building-extrusion")) {
    mapInstance.setLayoutProperty("ihc-building-extrusion", "visibility", is3D.value ? "visible" : "none");
  }
}

function addMarker(map: mapboxgl.Map) {
  if (!mapboxLib || markerInstance) return;

  const markerElement = document.createElement("div");
  markerElement.className = "ihc-marker";
  markerElement.innerHTML = `<div class="ihc-marker__pin"></div>`;

  markerPopup = new mapboxLib.Popup({ closeButton: false, offset: 16 }).setHTML(
    `
      <div class="ihc-popup">
        <p class="ihc-popup__title">RS Jantung & Pembuluh Darah</p>
        <p class="ihc-popup__subtitle">IHC Karawang</p>
        <div class="ihc-popup__meta">
          <span>9 lantai</span>
          <span>92 bed</span>
          <span>6.326 m² lahan</span>
        </div>
      </div>
    `
  );

  markerInstance = new mapboxLib.Marker({ element: markerElement, anchor: "bottom" })
    .setLngLat(hospital.coords)
    .setPopup(markerPopup)
    .addTo(map);
}

const handleBuildingClick = (event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
  if (!mapboxLib || !mapInstance || !event?.lngLat) return;
  buildingPopup?.remove();
  buildingPopup = new mapboxLib.Popup({ closeButton: false, offset: 16 })
    .setLngLat(event.lngLat)
    .setHTML(
      `
      <div class="ihc-popup">
        <p class="ihc-popup__title">RSJPD IHC Karawang</p>
        <p class="ihc-popup__subtitle">Podomoro Parkland • Telukjambe Timur</p>
        <div class="ihc-popup__meta">
          <span>9 lantai</span>
          <span>92 bed</span>
          <span>6.326 m² lahan</span>
        </div>
      </div>
    `
    )
    .addTo(mapInstance);
};

const handleBuildingEnter = () => {
  if (!mapInstance) return;
  mapInstance.getCanvas().style.cursor = "pointer";
};

const handleBuildingLeave = () => {
  if (!mapInstance) return;
  mapInstance.getCanvas().style.cursor = "";
};

function attachBuildingInteractions(map: mapboxgl.Map) {
  if (!map.getLayer("ihc-building-extrusion")) return;

  map.off("click", "ihc-building-extrusion", handleBuildingClick);
  map.off("mouseenter", "ihc-building-extrusion", handleBuildingEnter);
  map.off("mouseleave", "ihc-building-extrusion", handleBuildingLeave);

  map.on("click", "ihc-building-extrusion", handleBuildingClick);
  map.on("mouseenter", "ihc-building-extrusion", handleBuildingEnter);
  map.on("mouseleave", "ihc-building-extrusion", handleBuildingLeave);
}

function apply3DMode() {
  if (!mapInstance) return;
  updateBuildingVisibility();
  ensureTerrain(mapInstance);

  mapInstance.easeTo({
    pitch: is3D.value ? 60 : 0,
    bearing: 20,
    duration: 800,
  });
}

function focusHospital() {
  if (!mapInstance) return;
  mapInstance.fitBounds(campusBounds, {
    padding: { top: 80, bottom: 80, left: 80, right: 80 },
    duration: 1200,
    pitch: is3D.value ? 60 : 0,
    bearing: 20,
  });
}

function toggle3D() {
  is3D.value = !is3D.value;
  apply3DMode();
}

watch(is3D, () => {
  apply3DMode();
});

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  markerInstance?.remove();
  markerInstance = null;
  markerPopup?.remove();
  markerPopup = null;
  buildingPopup?.remove();
  buildingPopup = null;
  mapInstance?.remove();
  mapInstance = null;
});
</script>

<style scoped>
:global(.ihc-marker) {
  display: flex;
  align-items: flex-end;
  cursor: pointer;
}

:global(.ihc-marker__pin) {
  position: relative;
  height: 14px;
  width: 14px;
  border-radius: 9999px;
  background: #ef4444;
  box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.25);
  animation: ihc-pulse 2.2s infinite;
}

:global(.ihc-marker__pin::after) {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  height: 6px;
  width: 6px;
  border-radius: 9999px;
  background: #fff;
}

:global(.mapboxgl-popup-content) {
  border-radius: 14px;
  padding: 10px 12px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18);
}

:global(.ihc-popup) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 170px;
}

:global(.ihc-popup__title) {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

:global(.ihc-popup__subtitle) {
  font-size: 11px;
  color: #64748b;
}

:global(.ihc-popup__meta) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #f97316;
}

@keyframes ihc-pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.8;
  }
}
</style>
