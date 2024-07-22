<template>
  <div class="flex justify-center items-center h-screen">
    <div id="map" class=" h-full"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useHead } from '@vueuse/head';

// Menggunakan @vueuse/head untuk menambahkan CSS Leaflet hanya di klien
useHead({
  link: [
    { rel: 'stylesheet', href: 'https://unpkg.com/leaflet/dist/leaflet.css' }
  ]
});

onMounted(async () => {
  const L = await import('leaflet');

  const map = L.map('map').setView([-7.9467, 110.6037], 12); // View focused on Gunungkidul

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const locations = [
    { coords: [-7.9602, 110.6145], type: 'start', detail: 'Start Point: Dinihari Kopi, Wonosari, Gunungkidul' },
    { coords: [-7.9658, 110.6029], type: 'checkpoint', detail: 'Checkpoint 1: Rumah Makan Bu Sudar, Jeruk Kepek, Wonosari, Gunungkidul' },
    { coords: [-8.1510, 110.6167], type: 'end', detail: 'End Point: Pantai Indrayanti, Gunungkidul' }
  ];

  const route = L.polyline(locations.map(loc => loc.coords)).addTo(map);

  const carIcon = L.icon({
    iconUrl: '/img/car.png',
    iconSize: [32, 32],
  });

  let carMarker = L.marker(locations[0].coords, { icon: carIcon }).addTo(map);

  const speed = 0.00005; // Adjust speed for smoother animation
  let routeIndex = 0;
  let progress = 0;

  locations.forEach(loc => {
    L.marker(loc.coords).addTo(map).bindPopup(loc.detail);
  });

  function animateCar(waitTime = 2000) {
    const routeLatLngs = route.getLatLngs();
    if (routeIndex < routeLatLngs.length - 1) {
      const startPoint = routeLatLngs[routeIndex];
      const endPoint = routeLatLngs[routeIndex + 1];
      const dx = endPoint.lng - startPoint.lng;
      const dy = endPoint.lat - startPoint.lat;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      progress += speed;
      if (progress >= distance) {
        progress = 0;
        routeIndex++;

        // Check if we are at a checkpoint, start, or end point
        const location = locations.find(loc =>
          loc.coords[0] === endPoint.lat && loc.coords[1] === endPoint.lng
        );
        if (location) {
          carMarker.bindPopup(location.detail).openPopup();
          setTimeout(() => {
            carMarker.closePopup();
            requestAnimationFrame(() => animateCar(location.type === 'start' ? 4000 : 2000));
          }, location.type === 'start' ? 4000 : waitTime); // Wait for 4 seconds at start, 2 seconds at other checkpoints
          return;
        }
      } else {
        const newLng = startPoint.lng + (dx * progress) / distance;
        const newLat = startPoint.lat + (dy * progress) / distance;
        carMarker.setLatLng([newLat, newLng]);
      }
    } else {
      // Reset route index and progress to create a loop
      routeIndex = 0;
      progress = 0;
      carMarker.setLatLng(routeLatLngs[0]);
      carMarker.bindPopup(locations[0].detail).openPopup();
      setTimeout(() => {
        carMarker.closePopup();
        requestAnimationFrame(() => animateCar(4000)); // Start with 4 seconds delay at the beginning
      }, 4000); // Wait for 4 seconds at the beginning of the loop
      return;
    }
    requestAnimationFrame(() => animateCar(waitTime));
  }
  animateCar(4000); // Start with 4 seconds delay at the beginning
});
</script>

<style scoped>
#map {
  height: 100vh;
  width: 100%;
}
</style>
