// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },

  nitro: {
    prerender: {
      routes: [
        // "/_ipx/w_120/logo.png",
        // "/_ipx/w_140/logo.png",
        "/_ipx/_/img/logo.png",
        "/_ipx/_/img/drew-hays-tGYrlchfObE-unsplash.jpg",
        // etc.
      ],
    },
  },
  modules: [
    "@nuxt/ui",
    "nuxt-server-utils",
    "@sidebase/nuxt-auth",
    "@nuxt/image",
  ],
  // image: {
  //   provider: "netlify",
  //   domains: ["ehospitalku.netlify.app"],
  // },

  runtimeConfig: {
    auth: {
      origin: process.env.AUTH_ORIGIN,
      secret: process.env.AUTH_SECRET,
    },
    // stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    // stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    // public: {
    //   pixabayApiKey: process.env.PIXABAY_API_KEY,
    //   priceId: process.env.STRIPE_PRICE_ID,
    //   stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    // },
  },

  auth: {
    baseURL: process.env.AUTH_ORIGIN,
    provider: {
      type: "authjs",
    },
  },
  colorMode: {
    preference: "light",
  },
  ui: {},
  nuxtServerUtils: {
    mongodbUri: process.env.NEXTAUTH_URL,
  },
});
