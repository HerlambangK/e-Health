import IotDevice from '~/server/models/IotDevice';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const { deviceId, sensorConfig } = body || {};

		if (!deviceId) {
			return sendApiError(event, 400, 'bad_request', 'deviceId wajib diisi');
		}

		if (!Array.isArray(sensorConfig)) {
			return sendApiError(
				event,
				400,
				'bad_request',
				'sensorConfig wajib berupa array konfigurasi parameter',
			);
		}

		// Validasi setiap parameter
		for (const param of sensorConfig) {
			if (!param.key || !param.name) {
				return sendApiError(
					event,
					400,
					'bad_request',
					'Setiap parameter wajib memiliki "key" dan "name"',
				);
			}
		}

		const device = await IotDevice.findOneAndUpdate(
			{ deviceId },
			{
				$set: {
					sensorConfig,
					type: 'sensor',
				},
			},
			{ new: true },
		);

		if (!device) {
			return sendApiError(
				event,
				404,
				'not_found',
				`Perangkat dengan deviceId "${deviceId}" tidak ditemukan`,
			);
		}

		return sendSuccess(
			event,
			200,
			'Konfigurasi parameter sensor berhasil disimpan',
			{
				deviceId: device.deviceId,
				name: device.name,
				sensorConfig: device.sensorConfig,
			},
		);
	} catch (error: any) {
		console.error('[IoT Sensor Param Update Error]:', error);
		return sendApiError(event, 500, 'internal_error', error.message);
	}
});

