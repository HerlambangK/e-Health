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
    // "@bg-dev/nuxt-naiveui",
    // "@huntersofbook/naive-ui-nuxt",
    // "@nuxt/image",
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
  // naiveUI: {
  //   themeOverrides: {
  //     common: {
  //       primaryColor: "#ff0000",
  //       primaryColorHover: "#8b0000",
  //     },
  //   },
  // },
});
