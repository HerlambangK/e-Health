import { User } from '~/server/models/User';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	const sessionUser = event.context.user;
	if (!sessionUser) {
		return sendApiError(
			event,
			401,
			'unauthorized',
			'Unauthorized: Silakan login terlebih dahulu',
		);
	}

	try {
		const userId = sessionUser._id || sessionUser.id;
		const user = await User.findById(userId).select('-password').lean();

		if (!user) {
			return sendApiError(event, 404, 'user_not_found', 'User tidak ditemukan');
		}

		return sendSuccess(event, user);
	} catch (error: any) {
		console.error('[Profile Get Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal mengambil data profil',
		);
	}
});
