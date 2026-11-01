import { sendSuccess } from '~/server/utils/response';

export default defineEventHandler((event) => {
	const spec = {
		title: 'IoT Sensor API Documentation (Mini-Swagger)',
		module: 'sensor',
		description:
			'Koleksi endpoint API resmi untuk integrasi perangkat IoT Sensor (ESP32/Arduino DHT22, BME280, Tekanan Gas Medis, Suhu Ruangan Operasi) dengan modul IoT Sensor e-Health.',
		version: '1.0.0',
		endpoints: [
			{
				method: 'POST',
				path: '/api/iot/sensor/telemetry',
				title: 'Ingest Data Telemetri Multi-Parameter',
				description:
					'Dipanggil oleh perangkat IoT Sensor untuk mengirim pembacaan parameter fisik secara berkala. Menerima payload key-value fleksibel (e.g. temperature, humidity, pressure, voltage).',
				auth: 'Public / Hardware Bypass',
				headers: [
					{ name: 'Content-Type', value: 'application/json', required: true },
					{
						name: 'X-Device-Id',
						value: 'SN-001',
						required: false,
						description: 'ID Sensor pengirim',
					},
				],
				body: {
					deviceId: 'SN-001',
					data: {
						temperature: 24.8,
						humidity: 58.2,
						pressure: 1013.2,
					},
					connectedSsid: 'Klinik_WiFi_Utama',
					rssi: -62,
				},
				response: {
					statusCode: 201,
					body: {
						success: true,
						message: 'Data telemetri berhasil dicatat',
						data: {
							logId: '6724fce...',
							deviceId: 'SN-001',
							status: 'normal',
							latestValues: {
								temperature: 24.8,
								humidity: 58.2,
								pressure: 1013.2,
							},
						},
					},
				},
			},
			{
				method: 'GET',
				path: '/api/iot/sensor/telemetry',
				title: 'Ambil Data Historis Telemetri untuk Grafik',
				description:
					'Mengambil data time-series pembacaan sensor dengan filter deviceId dan rentang waktu (1h, 24h, 7d). Data terurut kronologis siap dirender ke chart.',
				auth: 'Session Token / Authorization',
				headers: [
					{ name: 'Accept', value: 'application/json', required: true },
				],
				queryParams: [
					{
						name: 'deviceId',
						type: 'string',
						required: true,
						description: 'ID unik sensor',
					},
					{
						name: 'range',
						type: 'string',
						required: false,
						description: 'Rentang waktu: 1h, 24h, 7d (default: 24h)',
					},
					{
						name: 'limit',
						type: 'number',
						required: false,
						description: 'Maksimal titik data (default 100, max 500)',
					},
				],
				body: null,
				response: {
					statusCode: 200,
					body: {
						success: true,
						message: 'Data telemetri berhasil dimuat',
						data: {
							range: '24h',
							total: 48,
							logs: [
								{
									_id: '6724f...',
									deviceId: 'SN-001',
									timestamp: '2026-11-01T16:00:00.000Z',
									data: { temperature: 24.2, humidity: 59 },
									status: 'normal',
								},
							],
						},
					},
				},
			},
			{
				method: 'PUT',
				path: '/api/iot/sensor/parameters',
				title: 'Simpan / Konfigurasi Parameter Sensor Dinamis',
				description:
					'Menentukan parameter apa saja yang dipantau oleh perangkat sensor tertentu beserta satuan unit dan batas aman (threshold).',
				auth: 'Session Token / Admin & Staff',
				headers: [
					{ name: 'Content-Type', value: 'application/json', required: true },
				],
				body: {
					deviceId: 'SN-001',
					sensorConfig: [
						{
							key: 'temperature',
							name: 'Suhu Cold Storage',
							unit: '°C',
							minThreshold: 2.0,
							maxThreshold: 8.0,
						},
						{
							key: 'humidity',
							name: 'Kelembaban Ruangan',
							unit: '%',
							minThreshold: 40.0,
							maxThreshold: 70.0,
						},
					],
				},
				response: {
					statusCode: 200,
					body: {
						success: true,
						message: 'Konfigurasi parameter sensor berhasil disimpan',
						data: {
							deviceId: 'SN-001',
							name: 'Sensor Vaksin Cold Storage',
							sensorConfig: [],
						},
					},
				},
			},
			{
				method: 'POST',
				path: '/api/iot/heartbeat',
				title: 'Sensor Heartbeat & Ping Status',
				description:
					'Melaporkan bahwa node sensor tetap menyala dan terhubung ke jaringan.',
				auth: 'Public / Hardware Bypass',
				headers: [
					{ name: 'Content-Type', value: 'application/json', required: true },
				],
				body: {
					deviceId: 'SN-001',
					connectedSsid: 'Klinik_WiFi_Utama',
					ipAddress: '192.168.1.112',
					rssi: -65,
				},
				response: {
					statusCode: 200,
					body: {
						success: true,
						message: 'Heartbeat diterima',
						data: { deviceId: 'SN-001', status: 'online' },
					},
				},
			},
		],
	};

	return sendSuccess(event, 200, 'Sensor API Spec retrieved', spec);
});
