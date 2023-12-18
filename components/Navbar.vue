<script lang="ts" setup>
// import type { UserDocument } from "~/server/models/User";
const { data, signOut } = useAuth();
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");
const currentDate = dayjs();
function formatDate(date: dayjs.Dayjs) {
  // Format date to "dddd, DD MMMM YYYY"
  return date.format("dddd, DD MMMM YYYY");
}
const formattedCurrentDate = formatDate(currentDate);
// const { showSubscriptionModal, accessPortal } = useSubscription();

const currentTime = ref("");

onMounted(() => {
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000); // Perbarui setiap detik
});

function updateCurrentTime() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString();
}
const dropdownItems = ref([
  [
    {
      label: "Profile",
      slot: "profile",
      disabled: true,
    },
  ],
  [
    {
      label: "Billing",
      icon: "i-heroicons-credit-card",
      click: () => {
        useRouter().push("/patient-record/billing");
      },
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: handleSignout,
    },
  ],
]);

async function handleSignout() {
  await signOut();
}
</script>
<template>
  <div>
    <header class="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
      <div>
        <div class="flex justify-between">
          <span class="hidden md:block font-semibold text-xm md:text-md">
            <!-- Senin, 12 Desember 2023  tanggal hari ini-->
            <p>{{ formattedCurrentDate }}</p>
          </span>
          <div class="md:hidden block">
            <AdminNavburger />
          </div>

          <div class="inline-flex justify-end gap-4 items-center">
            <slot name="actions"></slot>

            <UButton color="white" variant="solid" size="xs">
              {{ currentTime }}
            </UButton>
            <ColorSwitcher />
            <UPopover>
              <div
                class="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900"
              >
                <span class="text-[10px]">2</span>
              </div>
              <UButton
                color="white"
                trailing-icon="i-heroicons-bell"
                size="xs"
              />

              <template #panel>
                <div class="p-4">
                  <DashboardHistory />
                </div>
              </template>
            </UPopover>
            <UDropdown :items="dropdownItems">
              <UIcon name="i-heroicons-user-circle" class="w-6 h-6" />

              <template #profile>
                <div class="text-left">
                  <p>Signed in as</p>
                  <p class="truncate font-medium text-gray-900 dark:text-white">
                    {{ data?.user?.email ? data?.user?.email : "none" }}
                    <!-- herlambangk25@gmail.com -->
                  </p>
                  <span
                    class="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300"
                  >
                    <span class="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                    Online
                  </span>
                </div>
              </template>
            </UDropdown>
          </div>
        </div>
      </div>
    </header>

    <main class="my-4">
      <UContainer>
        <slot />
      </UContainer>
    </main>
  </div>
</template>

<style></style>
