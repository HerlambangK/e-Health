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
		smtp: {
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
			secure: process.env.SMTP_SECURE === 'true',
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
			from: process.env.SMTP_FROM,
		},
		mongodbUri: process.env.MONGODB_URI,
		public: {
			authOrigin: process.env.AUTH_ORIGIN,
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
		mongodbUri: process.env.MONGODB_URI,
	},
});
