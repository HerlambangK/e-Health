<template>
  <div class="bg-white pt-2 dark:bg-gray-900 px-4 lg:px-8" id="service">
    <div class="mx-auto md:max-w-4xl py-12 sm:py-48 lg:py-12">
      <h3
        class="text-lg mb:text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl text-center"
      >
        Our Service
      </h3>
      <div
        class="bg-white mx-auto py-2 px-10 grid grid-cols-2 mx2 md:grid-cols-2 lg:grid-cols-4 gap-2"
      >
        <a
          href="#"
          class="block rounded-lg p-4 shadow-sm shadow-indigo-100"
          v-for="asset in assets"
          :key="asset.title"
        >
          <img
            :src="asset.img"
            alt="kadar"
            class="h-32 w-full rounded-md object-cover"
          />

          <div class="mt-2">
            <dl>
              <div>
                <dt class="font-medium">{{ asset.title }}</dt>
              </div>
            </dl>

            <div class="mt-6 flex items-center gap-8 text-xs">
              {{ asset.description }}
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const assets = ref([
  {
    title: "Cek Kadar Gula",
    link: "#",
    img: "/img/drew-hays-tGYrlchfObE-unsplash.jpg",
    description:
      "Cek Kadar gula dan pemeriksaan gula darah untuk mendapatkan informasi kesehatan dalam diri anda",
  },
  {
    title: "Cek Kadar Gula",
    link: "#",
    img: "/img/drew-hays-tGYrlchfObE-unsplash.jpg",
    description:
      "Cek Kadar gula dan pemeriksaan gula darah untuk mendapatkan informasi kesehatan dalam diri anda",
  },
  {
    title: "Cek Kadar Gula",
    link: "#",
    img: "/img/drew-hays-tGYrlchfObE-unsplash.jpg",
    description:
      "Cek Kadar gula dan pemeriksaan gula darah untuk mendapatkan informasi kesehatan dalam diri anda",
  },
  {
    title: "Cek Kadar Gula",
    link: "#",
    img: "/img/drew-hays-tGYrlchfObE-unsplash.jpg",
    description:
      "Cek Kadar gula dan pemeriksaan gula darah untuk mendapatkan informasi kesehatan dalam diri anda",
  },
]);
</script>

<style></style>
