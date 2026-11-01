import IotWifi from '~/server/models/IotWifi';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const id = getRouterParam(event, 'id');
		const body = await readBody(event);

		const updatePayload: Record<string, any> = {};
		if (body.ssid) updatePayload.ssid = body.ssid.trim();
		if (body.password !== undefined) updatePayload.password = body.password.trim();
		if (body.priority !== undefined) updatePayload.priority = Number(body.priority);
		if (body.isActive !== undefined) updatePayload.isActive = !!body.isActive;
		if (body.description !== undefined) updatePayload.description = body.description.trim();
		if (body.timeoutMs !== undefined) updatePayload.timeoutMs = Number(body.timeoutMs);

		const updated = await IotWifi.findByIdAndUpdate(
			id,
			{ $set: updatePayload },
			{ new: true },
		);

		if (!updated) {
			return sendApiError(
				event,
				404,
				'not_found',
				'Konfigurasi WiFi tidak ditemukan',
			);
		}

		return sendSuccess(event, updated);
	} catch (error: any) {
		console.error('[IoT Update WiFi Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal memperbarui konfigurasi WiFi',
		);
	}
});

