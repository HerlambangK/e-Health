<template>
  <div
    class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <h2 className="mr-2 mt-2 text-xl font-bold tracking-tight text-center">
      Welcome
    </h2>

    <div class="w-full flex md:flex-row flex-col mt-4 gap-2">
      <div class="w-full px-2 shadow-md rounded-lg border py-6">
        <h2 class="mr-2 my-2 text-2xl font-semibold tracking-tight text-center">
          Riwayat Penyakit
        </h2>
        <div class="grid gap-5 grid-cols-1 md:grid-cols-2">
          <!-- Diagnosis -->
          <div class="rounded-lg border bg-card p-6">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">Diagnosis Anda</p>
              <span class="shrink-0">
                <Icon
                  name="heroicons:chart-pie"
                  class="h-4 w-4 text-muted-foreground"
                />
              </span>
            </div>

            <p class="mt-1.5 text-xl font-extrabold">Flu Batuk</p>
            <p class="text-xs text-muted-foreground">17 Desember 2023</p>
          </div>
          <!-- Status -->
          <div class="rounded-lg border bg-card p-6">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium">Jenis Keanggotaan</p>
              <span class="shrink-0">
                <Icon
                  name="heroicons:user-circle"
                  class="h-4 w-4 text-muted-foreground"
                />
              </span>
            </div>

            <p class="mt-1.5 text-xl font-extrabold">BPJS Kesehatan</p>
            <p class="text-xs text-muted-foreground">
              Pasien terdaftar di Bpjs kesehatan
            </p>
          </div>
        </div>
      </div>

      <div
        class="w-full p-8 mx-auto shadow-md rounded-lg border py-10 flex-col justify-center items-center"
      >
        <h2 class="mr-2 my-2 text-2xl font-semibold tracking-tight text-center">
          Detail Profil
        </h2>
        <div class="flex gap-5 flex-col md:flex-row mt-6">
          <div class="flex items-center justify-center">
            <div
              class="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden"
            >
              <img
                class="object-cover w-full h-full rounded-full"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                alt="Profile Image"
              />
            </div>
          </div>

          <div class="place-items-center w-full">
            <div class="p-4 bg-white rounded-lg border">
              <h2 class="text-2xl font-semibold mb-4">{{ profile.nama }}</h2>
              <p class="text-gray-700">
                {{ profile.jenis_kelamin }} - {{ profile.umur }} tahun
              </p>
              <!-- Add more details as needed -->
              <UButton variant="soft" color="blue" class="mt-4"
                >Detail Profile</UButton
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="md:ml-72 mt-3 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <div class="w-full mt-12">
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
  middleware: ["auth", "auth-middleware"],
});

const profile = reactive({
  nama: "surminah",
  jenis_kelamin: "Perempuan",
  umur: "21",
  alamat: "Jl. Kediri",
});

// definePageMeta({
//   middleware: "auth",
// });
</script>
