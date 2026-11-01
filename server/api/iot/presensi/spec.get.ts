import { sendSuccess } from '~/server/utils/response';

export default defineEventHandler((event) => {
	const spec = {
		title: 'Presensi IoT API Documentation (Mini-Swagger)',
		module: 'presensi',
		description:
			'Koleksi endpoint API resmi untuk integrasi perangkat IoT Mesin Presensi (ESP32/Arduino RFID reader) dengan modul Presensi e-Health.',
		version: '1.0.0',
		endpoints: [
			{
				method: 'POST',
				path: '/api/iot/presensi',
				title: 'Kirim Data Presensi (Tap RFID / UID)',
				description:
					'Dipanggil oleh mesin presensi ketika kartu RFID / UID pegawai berhasil di-tap. Backend otomatis mencocokkan UID dengan database pegawai dan mencatat status Masuk atau Pulang.',
				auth: 'Public / Hardware Bypass',
				headers: [
					{ name: 'Content-Type', value: 'application/json', required: true },
					{
						name: 'X-Device-Id',
						value: '001',
						required: false,
						description: 'ID Mesin Presensi pengirim',
					},
				],
				body: {
					deviceId: '001',
					uid: 'A1B2C3D4',
					type: 'masuk',
					connectedSsid: 'Klinik_WiFi_Utama',
					notes: 'Tap otomatis RFID RC522',
				},
				response: {
					statusCode: 201,
					body: {
						success: true,
						message: 'Presensi berhasil dicatat',
						data: {
							attendance: {
								id: '6724fa...',
								deviceId: '001',
								userName: 'dr. Budi Santoso',
								userNip: '198501012010121001',
								type: 'masuk',
								status: 'tepat_waktu',
								timestamp: '2026-11-01T07:45:00.000Z',
							},
						},
					},
				},
			},
			{
				method: 'POST',
				path: '/api/iot/heartbeat',
				title: 'Heartbeat & Ping Status Perangkat',
				description:
					'Dipanggil secara berkala (interval 30–60 detik) oleh perangkat IoT untuk menandakan mesin tetap aktif (ONLINE) serta melaporkan IP, SSID, dan kekuatan sinyal (RSSI).',
				auth: 'Public / Hardware Bypass',
				headers: [
					{ name: 'Content-Type', value: 'application/json', required: true },
				],
				body: {
					deviceId: '001',
					connectedSsid: 'Klinik_WiFi_Utama',
					ipAddress: '192.168.1.105',
					rssi: -58,
					firmwareVersion: 'v2.1.0-rfid',
				},
				response: {
					statusCode: 200,
					body: {
						success: true,
						message: 'Heartbeat diterima',
						data: {
							deviceId: '001',
							status: 'online',
							lastSeen: '2026-11-01T17:00:00.000Z',
						},
					},
				},
			},
			{
				method: 'GET',
				path: '/api/wifi-config',
				title: 'Ambil Konfigurasi Multi-AP WiFi Pool',
				description:
					'Dipanggil oleh perangkat IoT saat booting atau saat terjadi putus koneksi (WiFi fallback). Mengembalikan daftar SSID dan password urut prioritas tertinggi.',
				auth: 'Public / Hardware Bypass',
				headers: [
					{ name: 'Accept', value: 'application/json', required: false },
				],
				body: null,
				response: {
					statusCode: 200,
					body: {
						success: true,
						message: 'Daftar WiFi berhasil dimuat',
						data: [
							{
								ssid: 'Klinik_WiFi_Utama',
								password: 'PasswordSuper123',
								priority: 1,
								timeoutMs: 12000,
							},
							{
								ssid: 'Klinik_WiFi_Cadangan',
								password: 'BackupWifi456',
								priority: 2,
								timeoutMs: 10000,
							},
						],
					},
				},
			},
			{
				method: 'POST',
				path: '/api/iot/device-name',
				title: 'Perbarui / Daftarkan Nama Perangkat Otomatis',
				description:
					'Memungkinkan perangkat mengirimkan nama perangkat lokal ke server saat inisialisasi agar nama device sinkron.',
				auth: 'Public / Hardware Bypass',
				headers: [
					{ name: 'Content-Type', value: 'application/json', required: true },
				],
				body: {
					deviceId: '001',
					name: 'Mesin Presensi Lobi Utama',
					type: 'presensi',
				},
				response: {
					statusCode: 200,
					body: {
						success: true,
						message: 'Nama perangkat berhasil diperbarui',
						data: {
							deviceId: '001',
							name: 'Mesin Presensi Lobi Utama',
						},
					},
				},
			},
			{
				method: 'GET',
				path: '/api/iot/attendance',
				title: 'Ambil Riwayat Presensi Masuk & Pulang',
				description:
					'Digunakan oleh frontend atau aplikasi integrasi untuk mengambil daftar kehadiran pegawai dengan filter rentang tanggal atau pencarian nama.',
				auth: 'Session Token / Authorization',
				headers: [
					{ name: 'Accept', value: 'application/json', required: true },
				],
				queryParams: [
					{ name: 'date', type: 'string', description: 'Format YYYY-MM-DD' },
					{
						name: 'search',
						type: 'string',
						description: 'Kata kunci nama/NIP',
					},
				],
				body: null,
				response: {
					statusCode: 200,
					body: {
						success: true,
						message: 'Data presensi berhasil dimuat',
						data: [],
					},
				},
			},
		],
	};

	return sendSuccess(event, 200, 'Presensi API Spec retrieved', spec);
});

