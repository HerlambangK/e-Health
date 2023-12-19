<!-- File: components/PasienButton.vue -->
<template>
  <NButton type="primary" @click="goToPasienForm">Tambah Pasien</NButton>
</template>

<script setup>
import { useRouter } from "vue-router";

const goToPasienForm = () => {
  const router = useRouter();
  router.push("/form/pasien"); // Sesuaikan dengan path yang sesuai
};
</script>
