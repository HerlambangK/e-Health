<template>
  <div
    class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div className="flex item-center">
      <h2 className="mr-2 text-3xl font-bold tracking-tight">Welcome</h2>
    </div>
    <div class="w-full flex flex-row mt-12 gap-2">
      <div class="w-1/2 px-2 shadow-md rounded-lg border py-20">
        <h2>Riwayat Penyakit</h2>
      </div>

      <div
        class="w-1/2 p-8 mx-auto shadow-md rounded-lg border py-10 flex-col justify-center items-center"
      >
        <h2 class="font-semibold text-lg">Dokter</h2>
        <h1>10</h1>
      </div>
    </div>
  </div>

  <div
    class="md:ml-72 mt-3 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div class="w-full mt-12">
      <h1>Grafik</h1>
      haha Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore
      voluptas ipsa, cumque minus, aperiam placeat dolor obcaecati velit libero
      mollitia facere asperiores corrupti repellat ad, sunt accusantium?
      Tempora, mollitia vel.
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "default",
});
</script>
