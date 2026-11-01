import IotWifi from '~/server/models/IotWifi';
import IotDevice from '~/server/models/IotDevice';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		// 1. Ambil semua konfigurasi WiFi
		let wifis = await IotWifi.find().sort({ priority: 1, createdAt: 1 }).lean();

		// Auto seed jika belum ada data sama sekali
		if (wifis.length === 0) {
			await IotWifi.insertMany([
				{
					ssid: 'Kantor_Utama',
					password: 'passwordUtama123',
					priority: 1,
					isActive: true,
					description: 'Jaringan Utama Kantor & Poli SIMPRS',
					timeoutMs: 12000,
				},
				{
					ssid: 'Kantor_Cadangan',
					password: 'passwordCadangan456',
					priority: 2,
					isActive: true,
					description: 'Jaringan Cadangan Ruang Dokter & IT',
					timeoutMs: 12000,
				},
				{
					ssid: 'Hotspot_Maintenance',
					password: 'bembietigaduasatu',
					priority: 3,
					isActive: true,
					description: 'Hotspot Darurat Teknisi / Maintenance IoT',
					timeoutMs: 12000,
				},
			]);
			wifis = await IotWifi.find().sort({ priority: 1, createdAt: 1 }).lean();
		}

		// 2. Cek perangkat online mana saja yang saat ini terkoneksi ke masing-masing SSID
		const now = Date.now();
		const onlineDevices = await IotDevice.find({
			lastSeen: { $gte: new Date(now - 2 * 60 * 1000) },
		}).lean();

		const wifiWithUsage = wifis.map((item) => {
			const connected = onlineDevices.filter(
				(d) => d.connectedSsid === item.ssid,
			);
			return {
				...item,
				connectedDevices: connected.map((d) => ({
					deviceId: d.deviceId,
					name: d.name,
					ipAddress: d.ipAddress,
					rssi: d.rssi,
				})),
				connectedCount: connected.length,
			};
		});

		const defaultTimeout =
			wifis.find((w) => w.timeoutMs && w.timeoutMs > 0)?.timeoutMs || 12000;

		return sendSuccess(event, {
			wifis: wifiWithUsage,
			timeout_ms: defaultTimeout,
			totalActive: wifis.filter((w) => w.isActive).length,
			totalAll: wifis.length,
		});
	} catch (error: any) {
		console.error('[IoT WiFi List Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal memuat daftar WiFi',
		);
	}
});

