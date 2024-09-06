<template>
  <client-only>
    <div class="bg-white pt-2 dark:bg-gray-900 px-4 lg:px-8">
      <section id="sponsors" class="max-w-[65%] mx-auto pb-24 sm:pb-32">
        <h2 class="text-lg md:text-xl text-center mb-6 mt-12 font-semibold">Our Partners</h2>
        <div class="mx-auto">
          <Vue3Marquee :pause-on-hover="true" @on-pause="playState = 'paused'" @on-resume="playState = 'playing'">
            <div class="mx-4" v-for="(sponsor, idx) in sponsors" :key="idx">
              <img :src="`${sponsor.icon}`" :alt="sponsor.name" class="w-24 h-24 object-contain" />
            </div>
          </Vue3Marquee>
        </div>
      </section>
    </div>
  </client-only>

</template>

<script setup lang="ts">

// Data untuk sponsor
interface SponsorsProps {
  icon: string;
  name: string;
}

const sponsors: SponsorsProps[] = [
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo.png", name: "ICHC" },
  { icon: "/img/logo.png", name: "ICHC" },
]


</script>

<style scoped>
/* Style tambahan jika diperlukan */
</style>
