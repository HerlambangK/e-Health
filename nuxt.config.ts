// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	devtools: { enabled: true },
	// router: {
	//   middleware: ["auth"], // Terapkan kedua middleware
	// },
	// nitro: {
	//   prerender: {
	//     routes: [
	//       // "/_ipx/w_120/logo.png",
	//       // "/_ipx/w_140/logo.png",
	//       "/_ipx/_/img/logo.png",
	//       "/_ipx/_/img/drew-hays-tGYrlchfObE-unsplash.jpg",
	//       // etc.
	//     ],
	//   },
	// },
	modules: [
		'@nuxt/ui',
		'nuxt-server-utils',
		'@sidebase/nuxt-auth',
		'@nuxt/image',
		// '@vueuse/head',
		// 'axios',
		// '@vueuse/head',
		// "@glidejs/glide",
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
	},

	auth: {
		baseURL: process.env.AUTH_ORIGIN,
		provider: {
			type: 'authjs',
		},
	},
	colorMode: {
		preference: 'light',
	},
	ui: {},
	nuxtServerUtils: {
		mongodbUri: process.env.NEXTAUTH_URL,
	},
});
