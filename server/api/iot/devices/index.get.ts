import IotDevice from '~/server/models/IotDevice';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const devices = await IotDevice.find().sort({ lastSeen: -1 }).lean();

		const now = Date.now();
		const OFFLINE_THRESHOLD_MS = 2 * 60 * 1000; // 2 menit

		let onlineCount = 0;
		let offlineCount = 0;

		const enrichedDevices = devices.map((dev) => {
			const lastSeenTime = new Date(dev.lastSeen).getTime();
			const diffMs = now - lastSeenTime;
			const isOnline = diffMs <= OFFLINE_THRESHOLD_MS;

			if (isOnline) {
				onlineCount++;
			} else {
				offlineCount++;
			}

			return {
				...dev,
				computedStatus: isOnline ? 'online' : 'offline',
				lastSeenSecondsAgo: Math.floor(diffMs / 1000),
			};
		});

		return sendSuccess(event, {
			devices: enrichedDevices,
			stats: {
				total: enrichedDevices.length,
				online: onlineCount,
				offline: offlineCount,
			},
		});
	} catch (error: any) {
		console.error('[IoT Devices List Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal memuat daftar perangkat',
		);
	}
});

