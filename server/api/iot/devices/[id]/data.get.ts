import IotDevice from '~/server/models/IotDevice';
import IotWifi from '~/server/models/IotWifi';
import IotAttendance from '~/server/models/IotAttendance';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const id = getRouterParam(event, 'id') || '';
		const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
		const filter = isObjectId ? { _id: id } : { deviceId: id.trim().toUpperCase() };

		const device = await IotDevice.findOne(filter).lean();

		if (!device) {
			return sendApiError(event, 404, 'not_found', 'Perangkat tidak ditemukan');
		}

		// Ambil daftar WiFi aktif
		const wifis = await IotWifi.find({ isActive: true })
			.sort({ priority: 1, createdAt: 1 })
			.lean();

		// Ambil log presensi terakhir khusus untuk perangkat ini
		const recentAttendances = await IotAttendance.find({ deviceId: device.deviceId })
			.sort({ timestamp: -1 })
			.limit(10)
			.populate('user', 'name nip email role department')
			.lean();

		// Hitung statistik presensi perangkat ini hari ini
		const now = new Date();
		const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
		const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

		const [deviceMasuk, devicePulang, deviceTotal] = await Promise.all([
			IotAttendance.countDocuments({
				deviceId: device.deviceId,
				timestamp: { $gte: startOfDay, $lte: endOfDay },
				type: 'masuk',
			}),
			IotAttendance.countDocuments({
				deviceId: device.deviceId,
				timestamp: { $gte: startOfDay, $lte: endOfDay },
				type: 'pulang',
			}),
			IotAttendance.countDocuments({ deviceId: device.deviceId }),
		]);

		const nowMs = Date.now();
		const lastSeenMs = new Date(device.lastSeen).getTime();
		const isOnline = nowMs - lastSeenMs <= 2 * 60 * 1000;

		// Bentuk payload JSON yang langsung terstruktur rapi untuk ArduinoJson v7
		const arduinoJsonPayload = {
			status: 'success',
			device_id: device.deviceId,
			device_name: device.name,
			location: device.location || 'Pintu Masuk Utama',
			device_status: isOnline ? 'online' : 'offline',
			connected_ssid: device.connectedSsid || null,
			ip_address: device.ipAddress || null,
			rssi: device.rssi ?? null,
			data: wifis.map((w) => ({
				ssid: w.ssid,
				password: w.password,
			})),
			timeout_ms: wifis.find((w) => w.timeoutMs)?.timeoutMs || 12000,
		};

		return sendSuccess(event, {
			device: {
				...device,
				computedStatus: isOnline ? 'online' : 'offline',
				lastSeenSecondsAgo: Math.floor((nowMs - lastSeenMs) / 1000),
			},
			arduinoJson: arduinoJsonPayload,
			recentAttendances,
			stats: {
				todayMasuk: deviceMasuk,
				todayPulang: devicePulang,
				totalHistorical: deviceTotal,
			},
			wifis,
		});
	} catch (error: any) {
		console.error('[IoT Device Data Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal memuat data perangkat',
		);
	}
});
