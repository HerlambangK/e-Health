import Notification from '~/server/models/Notification';
import { sendSuccess } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	const user = event.context.user;
	if (!user) {
		throw createError({ statusCode: 401, message: 'Unauthorized' });
	}

	const userId = user._id || user.id;
	const orConditions: any[] = [
		{ recipientId: userId },
		{ recipientRole: user.role },
		{ channel: 'broadcast' },
	];
	if (user.role === 'admin') {
		orConditions.push({ recipientRole: 'admin' });
	}

	const id = getRouterParam(event, 'id');
	if (!id) {
		throw createError({
			statusCode: 400,
			message: 'Notification ID is required',
		});
	}

	const notification = await Notification.findOneAndUpdate(
		{ _id: id, $or: orConditions },
		{ isRead: true, readAt: new Date() },
		{ new: true },
	);

	if (!notification) {
		throw createError({ statusCode: 404, message: 'Notification not found' });
	}

	return sendSuccess(event, notification);
});
