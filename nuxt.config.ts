// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    auth: {
      secret: process.env.AUTH_SECRET,
      origin: process.env.AUTH_ORIGIN,
    },
    // mongodbUri: process.env.MONGODB_URI,
  },
  nitro: {
    preset: "vercel-edge",
  },
  routeRules: {
    // "/examples/*": { redirect: "/redirect-route" },
    "/modify-headers-route": { headers: { "x-magic-of": "nuxt and vercel" } },
    // Enables client-side rendering
    "/spa": { ssr: true },
  },
  build: {
    transpile: [/echarts/],
    // optimizeDeps: {
    //   include: [
    //     "naive-ui",
    //     "vueuc",
    //     "@css-render/vue3-ssr",
    //     "@juggle/resize-observer",
    //   ],
    // },
  },

  modules: [
    "@nuxt/ui",
    "nuxt-server-utils",
    "@nuxtjs/tailwindcss",
    "@sidebase/nuxt-auth",
    "@nuxt/image",
    // "nuxt-pdf",
    // "@bg-dev/nuxt-naiveui",
    // "@huntersofbook/naive-ui-nuxt",
  ],

  ui: {},
  nuxtServerUtils: {
    mongodbUri: process.env.MONGODB_URI,
  },
  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: "authjs",
    },
  },
  tailwindcss: {
    exposeConfig: true,
    cssPath: "~/assets/css/input.css",
    configPath: "tailwind.config",
  },
});
