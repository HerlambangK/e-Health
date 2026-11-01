import IotDevice from '~/server/models/IotDevice';
import IotSensorTelemetry from '~/server/models/IotSensorTelemetry';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const { deviceId, data, connectedSsid, rssi, alertMessage } = body || {};

		if (!deviceId) {
			return sendApiError(event, 400, 'bad_request', 'deviceId wajib diisi');
		}

		if (!data || typeof data !== 'object') {
			return sendApiError(
				event,
				400,
				'bad_request',
				'data parameter sensor wajib berupa object key-value (e.g. { temperature: 26.5 })',
			);
		}

		// Cari atau update device registry
		let device = await IotDevice.findOne({ deviceId });
		if (!device) {
			device = await IotDevice.create({
				deviceId,
				name: `Sensor ${deviceId}`,
				type: 'sensor',
				status: 'online',
				lastSeen: new Date(),
				connectedSsid: connectedSsid || '',
				rssi: typeof rssi === 'number' ? rssi : undefined,
			});
		} else {
			device.status = 'online';
			device.lastSeen = new Date();
			if (connectedSsid) device.connectedSsid = connectedSsid;
			if (typeof rssi === 'number') device.rssi = rssi;
		}

		// Evaluasi status ambang batas (threshold) jika ada konfigurasi
		let overallStatus: 'normal' | 'warning' | 'danger' = 'normal';
		let generatedAlert = alertMessage || '';

		if (device.sensorConfig && device.sensorConfig.length > 0) {
			for (const param of device.sensorConfig) {
				const val = data[param.key];
				if (typeof val === 'number') {
					if (
						(param.minThreshold !== undefined && val < param.minThreshold) ||
						(param.maxThreshold !== undefined && val > param.maxThreshold)
					) {
						overallStatus = 'danger';
						generatedAlert = `Nilai ${param.name} (${val} ${param.unit}) di luar batas aman [${param.minThreshold ?? '-'} - ${param.maxThreshold ?? '-'}]`;
						break;
					}
				}
			}
		}

		// Update latest telemetry pada device
		device.latestTelemetry = {
			values: data,
			status: overallStatus,
			alertMessage: generatedAlert,
			updatedAt: new Date(),
		};
		await device.save();

		// Simpan record time-series ke database
		const log = await IotSensorTelemetry.create({
			deviceId,
			deviceName: device.name,
			timestamp: new Date(),
			data,
			status: overallStatus,
			alertMessage: generatedAlert,
			connectedSsid,
			rssi,
		});

		return sendSuccess(event, 201, 'Data telemetri berhasil dicatat', {
			logId: log._id,
			deviceId,
			status: overallStatus,
			latestValues: data,
		});
	} catch (error: any) {
		console.error('[IoT Sensor Telemetry Ingest Error]:', error);
		return sendApiError(event, 500, 'internal_error', error.message);
	}
});

