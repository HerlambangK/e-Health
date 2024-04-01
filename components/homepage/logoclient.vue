<template>
  <div class="bg-white py-24 sm:pb-32">
    <div class="mx-auto md:max-w-2xl px-6 lg:px-8">
      <h2 class="text-center text-lg font-semibold leading-8 text-gray-900">
        Trusted by the world’s most innovative teams
      </h2>
      <div
        class="mx-auto mt-10 grid max-w-lg grid-cols-3 md:grid-cols-4 items-center gap-x-8 gap-y-10 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5"
      >
        <img
          v-for="asset in assets"
          :key="asset.imgLogo"
          class="w-20 object-cover"
          :src="asset.imgLogo"
          :alt="asset.alt"
        />
        <!-- <NuxtImg
          v-for="asset in assets"
          :key="asset.imgLogo"
          class="w-20 object-cover"
          :src="asset.imgLogo"
          :alt="asset.alt"
        /> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const assets = ref([
  {
    imgLogo: "/img/logo.png",
    alt: "Kadar1",
  },
  {
    imgLogo: "/img/logo.png",
    alt: "Kadar2",
  },
  {
    imgLogo: "/img/logo.png",
    alt: "Kadar3",
  },
  {
    imgLogo: "/img/logo.png",
    alt: "Kadar4",
  },
  {
    imgLogo: "/img/logo.png",
    alt: "Kadar5",
  },
  // {
  //   imgLogo: "/img/logo.png",
  //   alt: "Kadar5",
  // },
]);
</script>

<style></style>
