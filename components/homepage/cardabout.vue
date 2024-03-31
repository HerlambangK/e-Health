<template>
  <div class="bg-white pt-2 dark:bg-gray-900 px-6 pt-14 lg:px-8" id="service">
    <div class="mx-auto max-w-screen py-12 sm:py-48 lg:py-12">
      <h3
        class="text-lg mb:text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl text-center"
      >
        Our Service
      </h3>
      <div
        class="bg-white mx-auto py-2 px-20 grid grid-cols-2 mx2 md:grid-cols-2 lg:grid-cols-4 gap-2"
      >
        <div class="col-span-1 py-2" v-for="asset in assets" :key="asset.title">
          <a
            :href="asset.link"
            class="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <img
              class="object-cover w-full rounded-t-lg h-48 md:h-40 md:w-40 md:rounded-none md:rounded-s-lg"
              :src="asset.img"
              alt="kadar"
            />
            <!-- <NuxtImg
              class="object-cover w-full rounded-t-lg h-48 md:h-40 md:w-40 md:rounded-none md:rounded-s-lg"
              :src="asset.img"
              alt="kadar"
            /> -->
            <div class="flex flex-col justify-between p-4 leading-normal">
              <h5
                class="mb-2 text-sm md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
              >
                {{ asset.title }}
              </h5>
              <p
                class="mb-3 text-sm md:text-md font-normal text-gray-700 dark:text-gray-400"
              >
                {{ asset.description }}
              </p>
            </div>
          </a>
        </div>
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
