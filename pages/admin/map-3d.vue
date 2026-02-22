<template>
  <div class="min-h-screen bg-slate-50">
    <div class="w-full space-y-6 py-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary-500">Admin • Advanced 3D</p>
          <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl">Peta 3D IHC Karawang</h1>
          <p class="text-sm text-gray-500">
            Visualisasi RS Jantung & Pembuluh Darah IHC Karawang di kawasan Podomoro Parkland dengan tampilan 3D Mapbox
            GL, marker interaktif, dan boundary kampus.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton color="gray" variant="soft" icon="i-heroicons-map-pin" @click="focusHospital">
            Fokus IHC
          </UButton>
          <UButton color="primary" variant="soft" icon="i-heroicons-arrow-path" @click="resetView">
            Reset View
          </UButton>
        </div>
      </header>

      <section class="grid gap-6 lg:grid-cols-[360px,1fr]">
        <aside class="space-y-4">
          <UCard class="overflow-hidden" :ui="{ body: { padding: 'p-0' } }">
            <img :src="buildingImage" alt="Rumah Sakit Jantung IHC" class="h-44 w-full object-cover" />
            <div class="space-y-4 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Rumah Sakit Spesialis</p>
                  <h2 class="text-lg font-semibold text-gray-900">{{ hospital.name }}</h2>
                  <p class="text-xs text-gray-500">{{ hospital.address }}</p>
                  <p class="text-xs font-semibold text-primary-600">{{ hospital.website }}</p>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <UBadge color="primary" variant="subtle" :label="hospital.badge" />
                  <span class="text-[10px] font-semibold uppercase tracking-wide text-rose-500">
                    {{ hospital.status }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div v-for="fact in hospitalFacts" :key="fact.label" class="flex items-start gap-2">
                  <UIcon :name="fact.icon" class="mt-0.5 h-4 w-4 text-primary-500" />
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{{ fact.label }}</p>
                    <p class="text-xs font-semibold text-gray-700">{{ fact.value }}</p>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton size="sm" icon="i-heroicons-sparkles" @click="focusHospital">Highlight 3D</UButton>
                <UButton size="sm" color="gray" variant="soft" icon="i-heroicons-share">Bagikan</UButton>
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: { padding: 'p-4' } }">
            <template #header>
              <div class="space-y-1">
                <h3 class="text-base font-semibold text-gray-900">Kontrol Tampilan</h3>
                <p class="text-xs text-gray-500">Atur sudut pandang, mode 3D, dan highlight area kampus.</p>
              </div>
            </template>
            <div class="space-y-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-gray-900">Mode 3D Bangunan</p>
                  <p class="text-xs text-gray-500">Aktifkan ekstrusi gedung & terrain.</p>
                </div>
                <UToggle v-model="is3D" />
              </div>

              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-gray-900">Zona Kampus</p>
                  <p class="text-xs text-gray-500">Tampilkan boundary kawasan IHC.</p>
                </div>
                <UToggle v-model="showCampus" />
              </div>

              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Gaya Peta</p>
                <div class="mt-2 grid grid-cols-3 gap-2">
                  <button
                    v-for="option in styleOptions"
                    :key="option.id"
                    class="rounded-xl border px-2 py-2 text-[11px] font-semibold transition"
                    :class="
                      option.id === activeStyle
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    "
                    @click="activeStyle = option.id"
                  >
                    <span class="block">{{ option.label }}</span>
                    <span class="block text-[10px] font-normal text-gray-400">{{ option.subtitle }}</span>
                  </button>
                </div>
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: { padding: 'p-4' } }">
            <template #header>
              <div class="space-y-1">
                <h3 class="text-base font-semibold text-gray-900">Spesifikasi Teknis</h3>
                <p class="text-xs text-gray-500">Ringkasan data proyek yang tampil pada peta 3D.</p>
              </div>
            </template>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="stat in quickStats"
                :key="stat.label"
                class="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ stat.label }}</p>
                <p class="mt-1 text-lg font-semibold text-gray-900">{{ stat.value }}</p>
                <p class="text-[10px] text-gray-500">{{ stat.note }}</p>
              </div>
            </div>
          </UCard>

          <UCard v-if="mapError" class="border border-rose-200 bg-rose-50">
            <div class="space-y-1 text-sm text-rose-700">
              <p class="font-semibold">Mapbox belum siap.</p>
              <p>{{ mapError }}</p>
            </div>
          </UCard>
        </aside>

        <div class="relative">
          <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div :id="mapContainerId" class="h-[420px] w-full sm:h-[560px] lg:h-[720px]"></div>
          </div>

          <div
            class="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow backdrop-blur"
          >
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            {{ mapStatusText }}
          </div>

          <div
            class="pointer-events-none absolute bottom-4 left-4 z-10 space-y-2 rounded-2xl bg-white/90 p-3 text-xs text-gray-600 shadow backdrop-blur"
          >
            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Legenda</p>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              <span>Marker IHC</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
              <span>Zona Kampus</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
              <span>Bangunan 3D</span>
            </div>
          </div>

          <div
            v-if="!mapReady && !mapError"
            class="absolute inset-0 z-20 flex items-center justify-center bg-white/60 text-sm font-medium text-gray-600"
          >
            <div class="rounded-2xl bg-white/90 px-4 py-2 shadow">Menyiapkan tampilan peta...</div>
          </div>

          <div
            v-if="mapError"
            class="absolute inset-0 z-20 flex items-center justify-center bg-white/80 text-sm text-rose-700"
          >
            <div class="max-w-sm rounded-2xl border border-rose-200 bg-white/95 p-4 shadow">
              <p class="text-sm font-semibold">Mapbox error</p>
              <p class="mt-1 text-xs text-rose-600">{{ mapError }}</p>
              <p class="mt-2 text-[10px] text-rose-500">
                Pastikan token Mapbox public (pk.*), domain localhost di-allow, dan tidak diblokir ekstensi browser.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type mapboxgl from "mapbox-gl";
import buildingImage from "~/image_ihc.png";

definePageMeta({
  middleware: ["auth", "auth-middleware"],
});

const runtimeConfig = useRuntimeConfig();
const mapContainerId = "ihc-3d-map";
const mapReady = ref(false);
const mapError = ref("");
const is3D = ref(true);
const showCampus = ref(true);
const mapboxToken = computed(() =>
  (runtimeConfig.public.mapboxToken || "").trim().replace(/^['"]|['"]$/g, "")
);
const mapStatusText = computed(() => {
  if (mapError.value) return "Mapbox error";
  if (!mapReady.value) return "Memuat peta...";
  return is3D.value ? "Mode 3D aktif" : "Mode 2D aktif";
});

const styleOptions = [
  {
    id: "streets",
    label: "Streets",
    subtitle: "Default",
    style: "mapbox://styles/mapbox/streets-v12",
  },
  {
    id: "light",
    label: "Light",
    subtitle: "Clinic",
    style: "mapbox://styles/mapbox/light-v11",
  },
  {
    id: "satellite",
    label: "Satellite",
    subtitle: "Aerial",
    style: "mapbox://styles/mapbox/satellite-streets-v12",
  },
];

const activeStyle = ref(styleOptions[0].id);

const hospitalCoords: [number, number] = [107.273, -6.3182];

const hospital = {
  name: "RS Jantung & Pembuluh Darah IHC Karawang",
  address: "Jl. Podomoro Boulevard Kav. 1 & 3, Podomoro Parkland, Desa Wadas, Telukjambe Timur, Karawang",
  coords: hospitalCoords,
  website: "parklandpodomoro.com",
  badge: "Tipe B",
  status: "Under construction • 2026",
};

const hospitalFacts = [
  {
    label: "Koordinat",
    value: "Lat -6.3182, Lng 107.2730",
    icon: "i-heroicons-map-pin",
  },
  {
    label: "Luas Lahan",
    value: "6.326 m²",
    icon: "i-heroicons-squares-2x2",
  },
  {
    label: "Luas Lantai",
    value: "9.981 m²",
    icon: "i-heroicons-building-office",
  },
  {
    label: "Jumlah Bed",
    value: "92",
    icon: "i-heroicons-user-group",
  },
];

const quickStats = [
  { label: "Jumlah lantai", value: "9", note: "1 semi-basement" },
  { label: "Jumlah bed", value: "92", note: "Rencana kapasitas" },
  { label: "Luas lahan", value: "6.326 m²", note: "Parkland Podomoro" },
  { label: "Luas lantai", value: "9.981 m²", note: "Spesifikasi teknis" },
];

const campusGeojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Kawasan IHC Karawang",
      },
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
let markerInstance: mapboxgl.Marker | null = null;
let mapboxLib: typeof mapboxgl | null = null;
let buildingPopup: mapboxgl.Popup | null = null;
let markerPopup: mapboxgl.Popup | null = null;

const hasValidToken = computed(() => mapboxToken.value.startsWith("pk."));

function getStyleUri(id: string) {
  return styleOptions.find((option) => option.id === id)?.style ?? styleOptions[0].style;
}

function normalizeMapboxError(error: unknown) {
  if (!error) return "Gagal memuat Mapbox. Periksa token, koneksi, dan izin domain.";

  const message = (error as { message?: string; status?: number })?.message || String(error);
  const status = (error as { status?: number })?.status;

  if (status === 401 || message.includes("401") || message.toLowerCase().includes("unauthorized")) {
    return "Token tidak valid/expired. Pastikan MAPBOX_ACCESS_TOKEN adalah public token (pk.*).";
  }

  if (status === 403 || message.includes("403") || message.toLowerCase().includes("forbidden")) {
    return "Akses ditolak. Periksa Allowed URLs/Token restrictions di Mapbox.";
  }

  if (message.toLowerCase().includes("style")) {
    return "Style map tidak bisa dimuat. Coba ganti style ke Light atau Streets.";
  }

  return message;
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
  const container = mapInstance.getContainer();
  const { width, height } = container.getBoundingClientRect();

  if ((width < 10 || height < 10) && attempt < 5) {
    requestAnimationFrame(() => scheduleMapResize(attempt + 1));
    return;
  }

  mapInstance.resize();
}

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

async function initMap() {
  if (mapInstance) return;

  try {
    const container = await waitForMapContainer();
    if (!container) {
      mapError.value = "Container peta belum siap. Silakan refresh halaman.";
      return;
    }

    const mapboxModule = await import("mapbox-gl");
    mapboxLib = mapboxModule.default;
    mapboxLib.accessToken = mapboxToken.value;

    mapInstance = new mapboxLib.Map({
      container,
      style: getStyleUri(activeStyle.value),
      center: hospital.coords,
      zoom: 17.2,
      pitch: is3D.value ? 65 : 0,
      bearing: is3D.value ? 20 : 0,
      antialias: true,
      projection: "globe",
      interactive: false,
      scrollZoom: false,
      dragPan: false,
      dragRotate: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      keyboard: false,
    });

    mapInstance.addControl(new mapboxLib.NavigationControl({ visualizePitch: true }), "top-right");
    mapInstance.addControl(new mapboxLib.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");

    mapInstance.on("load", () => {
      scheduleMapResize();
      setupScene(mapInstance!);
      addMarker(mapInstance!);
      mapReady.value = true;
      focusHospital();
      enableInteractions();
    });

    mapInstance.on("style.load", () => {
      if (!mapInstance) return;
      scheduleMapResize();
      setupScene(mapInstance);
      apply3DMode();
      updateCampusVisibility();
      mapReady.value = true;
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
  mapInstance.scrollZoom.enable();
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
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.35 });
  } else {
    map.setTerrain(null);
  }

  if (!map.getLayer("sky")) {
    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0, 0],
        "sky-atmosphere-sun-intensity": 12,
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
        "fill-extrusion-opacity": 0.82,
      },
    },
    labelLayerId
  );

  updateBuildingVisibility();
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
        "fill-opacity": 0.22,
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

  updateCampusVisibility();
}

function ensureCustomBuilding(map: mapboxgl.Map) {
  if (!map.getSource("ihc-building")) {
    map.addSource("ihc-building", {
      type: "geojson",
      data: buildingGeojson,
    });
  }

  if (!map.getLayer("ihc-building-footprint")) {
    map.addLayer({
      id: "ihc-building-footprint",
      type: "fill",
      source: "ihc-building",
      paint: {
        "fill-color": "#fb7185",
        "fill-opacity": 0.2,
      },
    });
  }

  if (!map.getLayer("ihc-building-outline")) {
    map.addLayer({
      id: "ihc-building-outline",
      type: "line",
      source: "ihc-building",
      paint: {
        "line-color": "#f43f5e",
        "line-width": 2,
      },
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
        "fill-extrusion-opacity": 0.88,
      },
    });
  }

  updateBuildingVisibility();
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

function addMarker(map: mapboxgl.Map) {
  if (!mapboxLib || markerInstance) return;

  const markerElement = document.createElement("div");
  markerElement.className = "ihc-marker";
  markerElement.innerHTML = `
    <div class="ihc-marker__pin"></div>
  `;

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

function updateBuildingVisibility() {
  if (!mapInstance) return;

  if (mapInstance.getLayer("3d-buildings")) {
    mapInstance.setLayoutProperty("3d-buildings", "visibility", is3D.value ? "visible" : "none");
  }

  if (mapInstance.getLayer("ihc-building-extrusion")) {
    mapInstance.setLayoutProperty("ihc-building-extrusion", "visibility", is3D.value ? "visible" : "none");
  }

  if (mapInstance.getLayer("ihc-building-footprint")) {
    mapInstance.setLayoutProperty("ihc-building-footprint", "visibility", is3D.value ? "none" : "visible");
  }

  if (mapInstance.getLayer("ihc-building-outline")) {
    mapInstance.setLayoutProperty("ihc-building-outline", "visibility", "visible");
  }
}

function updateCampusVisibility() {
  if (!mapInstance) return;
  const visibility = showCampus.value ? "visible" : "none";
  if (mapInstance.getLayer("ihc-campus-fill")) {
    mapInstance.setLayoutProperty("ihc-campus-fill", "visibility", visibility);
  }
  if (mapInstance.getLayer("ihc-campus-outline")) {
    mapInstance.setLayoutProperty("ihc-campus-outline", "visibility", visibility);
  }
}

function apply3DMode() {
  if (!mapInstance) return;
  updateBuildingVisibility();
  ensureTerrain(mapInstance);

  mapInstance.easeTo({
    pitch: is3D.value ? 65 : 0,
    bearing: is3D.value ? 20 : 0,
    duration: 900,
  });
}

function focusHospital() {
  if (!mapInstance) return;
  mapInstance.fitBounds(campusBounds, {
    padding: { top: 120, bottom: 120, left: 120, right: 120 },
    duration: 1300,
    pitch: is3D.value ? 65 : 0,
    bearing: is3D.value ? 20 : 0,
  });
}

function resetView() {
  if (!mapInstance) return;
  mapInstance.easeTo({
    center: hospital.coords,
    zoom: 17,
    pitch: is3D.value ? 65 : 0,
    bearing: is3D.value ? 20 : 0,
    duration: 1000,
  });
}

watch(activeStyle, (styleId) => {
  if (!mapInstance) return;
  mapError.value = "";
  mapReady.value = false;
  mapInstance.setStyle(getStyleUri(styleId));
});

watch(is3D, () => {
  apply3DMode();
});

watch(showCampus, () => {
  updateCampusVisibility();
});

onMounted(() => {
  if (!mapboxToken.value) {
    mapError.value = "Tambahkan MAPBOX_ACCESS_TOKEN di environment agar peta bisa dimuat.";
    return;
  }

  if (mapboxToken.value.startsWith("sk.")) {
    mapError.value = "Token Mapbox harus public (pk.*). Ganti MAPBOX_ACCESS_TOKEN dengan token publik.";
    return;
  }

  if (!hasValidToken.value) {
    mapError.value = "Format token tidak dikenali. Gunakan token Mapbox public (pk.*).";
    return;
  }

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
:global(.mapboxgl-ctrl-group) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
}

:global(.mapboxgl-ctrl-group button) {
  width: 32px;
  height: 32px;
}

:global(.mapboxgl-ctrl-scale) {
  border-radius: 9999px;
  padding: 4px 10px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.9);
}

:global(.ihc-marker) {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  cursor: pointer;
}

:global(.ihc-marker__pin) {
  position: relative;
  height: 16px;
  width: 16px;
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
  height: 8px;
  width: 8px;
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
  min-width: 180px;
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
