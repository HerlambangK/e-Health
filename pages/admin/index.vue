<template>
  <div
    class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div className="flex item-center">
      <h2
        className="mr-2 text-2xl mt-6 font-semibold tracking-tight text-center"
      >
        Dashboard Admin
      </h2>
    </div>
    <div class="w-full flex flex-row mt-6 gap-2">
      <div
        class="w-1/2 p-8 mx-auto shadow-md rounded-lg border py-10 flex-col justify-center items-center"
      >
        <h2 class="font-semibold text-lg">Jumlah Pasien</h2>
        <h3>10</h3>
      </div>

      <div
        class="w-1/2 p-8 mx-auto shadow-md rounded-lg border py-10 flex-col justify-center items-center"
      >
        <h2 class="font-semibold text-lg">Jumlah Dokter</h2>
        <h3>10</h3>
      </div>
    </div>
  </div>

  <div
    class="md:ml-72 mt-3 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div class="w-full mt-12">
      <h1>Data</h1>
      <div class="flex flex-row justify-between">
        <UButton>Tambah Pasien</UButton>
        <UButton>Tambah Dokter</UButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "default",
});
</script>
