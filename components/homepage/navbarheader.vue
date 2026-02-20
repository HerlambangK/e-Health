<template>
  <nav class="fixed inset-x-0 top-0 z-30">
    <div class="home-container">
      <div
        class="mt-4 flex items-center justify-between rounded-full bg-white/80 px-4 py-3 shadow-sm ring-1 ring-black/5 backdrop-blur"
      >
        <NuxtLink to="/" class="flex items-center gap-3">
          <Logo class="h-10 w-10" />
          <div class="leading-tight">
            <div class="font-display text-lg font-semibold text-slate-900">e-Health</div>
            <div class="text-[10px] uppercase tracking-[0.24em] text-slate-400">Care OS</div>
          </div>
        </NuxtLink>

        <div class="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a
            v-for="item in link"
            :key="item.title"
            :href="item.link"
            class="transition hover:text-slate-900"
          >
            {{ item.title }}
          </a>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink :to="isLoggedIn ? '/dashboard' : '/auth/signin'">
            <UButton size="sm" color="primary">Mulai</UButton>
          </NuxtLink>

          <div class="md:hidden">
            <UPopover :popper="{ arrow: true, placement: 'bottom-end' }">
              <UButton
                color="white"
                variant="soft"
                trailing-icon="i-heroicons-bars-3-20-solid"
                size="xs"
              />

              <template #panel>
                <div class="w-64 rounded-xl bg-white p-2 shadow-lg">
                  <NuxtLink v-for="item in link" :key="item.title" :to="item.link">
                    <div
                      class="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <span>{{ item.title }}</span>
                      <span class="text-xs text-slate-400">↗</span>
                    </div>
                  </NuxtLink>
                </div>
              </template>
            </UPopover>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const link = reactive([
  {
    title: "Home",
    link: "/",
  },
  {
    title: "About",
    link: "#about",
  },
  {
    title: "Services",
    link: "#service",
  },
  {
    title: "Contact",
    link: "#contact",
  },
]);

const { data: session } = useAuth();
const isLoggedIn = computed(() => Boolean(session.value?.user));
</script>
