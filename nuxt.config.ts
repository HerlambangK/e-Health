// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';

for (const file of [
	'.env',
	'.env.local',
	process.env.NODE_ENV === 'production' && '.env.production',
].filter(Boolean) as string[]) {
	if (existsSync(resolve(file))) {
		loadDotenv({ path: resolve(file), override: true });
	}
}

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
	],
	vite: {
		build: {
			rollupOptions: {
				output: {
					manualChunks(id: string) {
						// mapbox-gl is excluded — it's dynamically imported and auto-chunked
						if (
							id.includes('node_modules/echarts') ||
							id.includes('node_modules/vue-echarts')
						)
							return 'vendor-echarts';
						if (id.includes('node_modules/@fullcalendar'))
							return 'vendor-fullcalendar';
						if (id.includes('node_modules/xlsx')) return 'vendor-xlsx';
						if (
							id.includes('node_modules/chart.js') ||
							id.includes('node_modules/vue-chartjs')
						)
							return 'vendor-charts';
					},
				},
			},
		},
	},
	experimental: {
		treeshakeClientOnly: true,
	},
	image: {
		quality: 80,
		format: ['webp'],
	},
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
			replyTo: process.env.SMTP_REPLY_TO,
		},
		mongodbUri: process.env.MONGODB_URI,
		satusehat: {
			baseUrl: process.env.SATUSEHAT_BASE_URL,
			clientId: process.env.SATUSEHAT_CLIENT_ID,
			clientSecret: process.env.SATUSEHAT_CLIENT_SECRET,
			orgId: process.env.SATUSEHAT_ORG_ID,
		},
		sinoap: {
			baseUrl: process.env.SINOAP_BASE_URL,
			apiKey: process.env.SINOAP_API_KEY,
			facilityId: process.env.SINOAP_FACILITY_ID,
		},
		bpjs: {
			pCareUrl: process.env.BPJS_PCARE_URL,
			vClaimUrl: process.env.BPJS_VCLAIM_URL,
			consId: process.env.BPJS_CONS_ID,
			secretKey: process.env.BPJS_SECRET_KEY,
			userKey: process.env.BPJS_USER_KEY,
			ppkCode: process.env.BPJS_PPK_CODE,
		},
		public: {
			authOrigin: process.env.AUTH_ORIGIN,
			mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
			appName: 'e-Health SIMPRS',
			rsName: process.env.RS_NAME || 'Rumah Sakit',
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
	nitro: {
		scheduledTasks: {
			'*/30 * * * * *': ['satusehat-sync'],
			'*/5 * * * *': ['retry-failed-sync'],
			'0 2 * * *': ['bpjs-klaim'],
			'0 8 1 * *': ['sinoap-laporan'],
		},
	},
});
