import IotDevice from '~/server/models/IotDevice';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const id = getRouterParam(event, 'id') || '';
		const body = await readBody(event);

		const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
		const filter = isObjectId ? { _id: id } : { deviceId: id.trim().toUpperCase() };

		const updated = await IotDevice.findOneAndUpdate(
			filter,
			{
				$set: {
					...(body.name ? { name: body.name.trim() } : {}),
					...(body.type ? { type: body.type === 'sensor' ? 'sensor' : 'presensi' } : {}),
					...(body.location !== undefined
						? { location: body.location.trim() }
						: {}),
					...(body.notes !== undefined ? { notes: body.notes.trim() } : {}),
					...(body.isActive !== undefined ? { isActive: !!body.isActive } : {}),
					...(Array.isArray(body.sensorConfig)
						? {
								sensorConfig: body.sensorConfig.map((sc: any) => ({
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
								})),
							}
						: {}),
				},
			},
			{ new: true },
		);

		if (!updated) {
			return sendApiError(event, 404, 'not_found', 'Perangkat tidak ditemukan');
		}

		return sendSuccess(event, updated);
	} catch (error: any) {
		console.error('[IoT Update Device Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal memperbarui perangkat',
		);
	}
});
