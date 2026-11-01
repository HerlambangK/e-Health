import IotDevice from '~/server/models/IotDevice';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const deviceId = body?.deviceId?.trim().toUpperCase();

		if (!deviceId) {
			return sendApiError(event, 400, 'bad_request', 'Device ID wajib diisi');
		}

		const existing = await IotDevice.findOne({ deviceId });
		if (existing) {
			return sendApiError(
				event,
				400,
				'conflict',
				`Perangkat dengan ID ${deviceId} sudah terdaftar`,
			);
		}

		const type = body.type === 'sensor' ? 'sensor' : 'presensi';
		const sensorConfig = Array.isArray(body.sensorConfig) ? body.sensorConfig : [];

		const newDevice = await IotDevice.create({
			deviceId,
			name:
				body.name?.trim() ||
				(type === 'sensor' ? `Sensor IoT ${deviceId}` : `Mesin Presensi ${deviceId}`),
			type,
			location: body.location?.trim() || 'Pintu Masuk Utama',
			notes: body.notes?.trim() || '',
			status: 'offline',
			lastSeen: new Date(Date.now() - 3600000), // default 1 jam lalu
			registeredAt: new Date(),
			isActive: body.isActive ?? true,
			sensorConfig:
				type === 'sensor'
					? sensorConfig.map((sc: any) => ({
							key: sc.key?.trim() || 'value',
							name: sc.name?.trim() || 'Parameter',
							unit: sc.unit?.trim() || '',
							minThreshold:
								sc.minThreshold !== undefined && sc.minThreshold !== ''
									? Number(sc.minThreshold)
									: undefined,
							maxThreshold:
								sc.maxThreshold !== undefined && sc.maxThreshold !== ''
									? Number(sc.maxThreshold)
									: undefined,
						}))
					: [],
		});

		return sendSuccess(event, newDevice, 201);
	} catch (error: any) {
		console.error('[IoT Register Device Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal mendaftarkan perangkat',
		);
	}
});

