import NotificationSetting from '~/server/models/NotificationSetting';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const user = event.context.user;
		if (!user || user.role !== 'admin') {
			return sendApiError(event, 403, 'forbidden', 'Forbidden: Hanya admin yang dapat mengakses');
		}

		const body = await readBody(event);
		
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!body?.email || !emailRegex.test(String(body.email).trim())) {
			return sendApiError(event, 400, 'validation_error', 'Format email tidak valid');
		}

		const cleanEmail = String(body.email).toLowerCase().trim();
		const existing = await NotificationSetting.findOne({ email: cleanEmail });
		if (existing) {
			return sendApiError(event, 400, 'duplicate_email', 'Email tersebut sudah terdaftar');
		}

		const setting = await NotificationSetting.create({
			email: cleanEmail,
			name: body.name ? String(body.name).trim() : cleanEmail,
			isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
			notificationTypes: Array.isArray(body.notificationTypes) && body.notificationTypes.length > 0 ? body.notificationTypes : ['Semua'],
			createdBy: user._id || user.id,
		});

		return sendSuccess(event, setting, 201);
	} catch (error: any) {
		console.error('[Create Notification Setting Error]:', error);
		return sendApiError(event, 500, 'server_error', error.message || 'Internal Server Error');
	}
});
