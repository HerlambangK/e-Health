import NotificationSetting from '~/server/models/NotificationSetting';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const user = event.context.user;
		if (!user || user.role !== 'admin') {
			return sendApiError(event, 403, 'forbidden', 'Forbidden: Hanya admin yang dapat mengakses');
		}

		const id = getRouterParam(event, 'id') || event.context.params?.id;
		if (!id) {
			return sendApiError(event, 400, 'invalid_param', 'ID wajib diisi');
		}

		const body = await readBody(event);
		
		if (body.email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(String(body.email).trim())) {
				return sendApiError(event, 400, 'validation_error', 'Format email tidak valid');
			}
			
			const cleanEmail = String(body.email).toLowerCase().trim();
			const existing = await NotificationSetting.findOne({ 
				email: cleanEmail, 
				_id: { $ne: id } 
			});
			if (existing) {
				return sendApiError(event, 400, 'duplicate_email', 'Email tersebut sudah terdaftar pada entri lain');
			}
			body.email = cleanEmail;
		}

		const setting = await NotificationSetting.findByIdAndUpdate(
			id,
			{ $set: body },
			{ new: true }
		);

		if (!setting) {
			return sendApiError(event, 404, 'not_found', 'Pengaturan email tidak ditemukan');
		}

		return sendSuccess(event, setting);
	} catch (error: any) {
		console.error('[Update Notification Setting Error]:', error);
		return sendApiError(event, 500, 'server_error', error.message || 'Internal Server Error');
	}
});
