import IotDevice from '~/server/models/IotDevice';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const id = getRouterParam(event, 'id');
		const deleted = await IotDevice.findByIdAndDelete(id);

		if (!deleted) {
			return sendApiError(event, 404, 'not_found', 'Perangkat tidak ditemukan');
		}

		return sendSuccess(event, { message: 'Perangkat berhasil dihapus' });
	} catch (error: any) {
		console.error('[IoT Delete Device Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal menghapus perangkat',
		);
	}
});
