<template>
  <main class="min-h-screen overflow-x-hidden">
    <HomepageNavbarheader />
    <HomepageHeader />
    <HomepageAboutus />
    <HomepageCardabout />
    <HomepageClientSlide />
    <HomepageContactform />
    <HomepageFooter />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "home",
});
</script>
