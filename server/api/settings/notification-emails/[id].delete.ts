import NotificationSetting from '~/server/models/NotificationSetting';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const user = event.context.user;
		if (!user || user.role !== 'admin') {
			return sendApiError(
				event,
				403,
				'forbidden',
				'Forbidden: Hanya admin yang dapat mengakses',
			);
		}

		const id = getRouterParam(event, 'id') || event.context.params?.id;
		if (!id) {
			return sendApiError(event, 400, 'invalid_param', 'ID wajib diisi');
		}

		const setting = await NotificationSetting.findByIdAndDelete(id);

		if (!setting) {
			return sendApiError(
				event,
				404,
				'not_found',
				'Pengaturan email tidak ditemukan',
			);
		}

		return sendSuccess(event, { deleted: true });
	} catch (error: any) {
		console.error('[Delete Notification Setting Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Internal Server Error',
		);
	}
});
