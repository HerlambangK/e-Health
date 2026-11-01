import IotSensorTelemetry from '~/server/models/IotSensorTelemetry';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);
		const deviceId = query.deviceId as string;
		const range = (query.range as string) || '24h'; // '1h' | '24h' | '7d' | 'all'
		const limit = Math.min(Number(query.limit) || 100, 500);

		const filter: Record<string, any> = {};
		if (deviceId) {
			filter.deviceId = deviceId;
		}

		const now = new Date();
		if (range === '1h') {
			filter.timestamp = { $gte: new Date(now.getTime() - 60 * 60 * 1000) };
		} else if (range === '24h') {
			filter.timestamp = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
		} else if (range === '7d') {
			filter.timestamp = {
				$gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
			};
		}

		const logs = await IotSensorTelemetry.find(filter)
			.sort({ timestamp: -1 })
			.limit(limit)
			.lean();

		return sendSuccess(event, 200, 'Data telemetri berhasil dimuat', {
			range,
			total: logs.length,
			logs: logs.reverse(), // kembalikan kronologis urut waktu naik untuk grafik
		});
	} catch (error: any) {
		console.error('[IoT Sensor Telemetry Fetch Error]:', error);
		return sendApiError(event, 500, 'internal_error', error.message);
	}
});

