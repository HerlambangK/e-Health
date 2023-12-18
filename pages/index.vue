<template>
  <main class="h-full overflow-auto">
    <!-- Header -->
    <!-- nav -->
    <HomepageNavbarheader />
    <!-- jumbotron -->
    <HomepageHeader />
    <!-- Hero -->
    <HomepageAboutus />
    <HomepageCardabout />
    <!-- Logos -->
    <HomepageLogoclient />
    <HomepageContactform />
    <HomepageFooter />
  </main>
</template>

<script setup lang="ts">
// import Jumbotron from "~/components/homepage/jumbotron.vue";
const user = true;
definePageMeta({
  layout: "home",
});
definePageMeta({
  middleware: "auth",
});
</script>

<style scoped></style>
