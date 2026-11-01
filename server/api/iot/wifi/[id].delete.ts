import IotWifi from '~/server/models/IotWifi';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const id = getRouterParam(event, 'id');
		const deleted = await IotWifi.findByIdAndDelete(id);

		if (!deleted) {
			return sendApiError(
				event,
				404,
				'not_found',
				'Konfigurasi WiFi tidak ditemukan',
			);
		}

		return sendSuccess(event, {
			message: `Konfigurasi WiFi '${deleted.ssid}' berhasil dihapus`,
		});
	} catch (error: any) {
		console.error('[IoT Delete WiFi Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal menghapus konfigurasi WiFi',
		);
	}
});

