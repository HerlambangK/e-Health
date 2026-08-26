import Notification from '~/server/models/Notification';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const user = event.context.user;
		if (!user) {
			return sendApiError(event, 401, 'unauthorized', 'Unauthorized');
		}

		const userId = user._id || user.id;
		const count = await Notification.countDocuments({
			$or: [{ recipientId: userId }, { recipientRole: user.role }],
			isRead: false,
		});

		return sendSuccess(event, { count });
	} catch (error: any) {
		console.error('[Unread Count Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Internal Server Error',
		);
	}
});
