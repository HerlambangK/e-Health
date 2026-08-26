import Notification from '~/server/models/Notification';
import { sendSuccess } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	const user = event.context.user;
	if (!user) {
		throw createError({ statusCode: 401, message: 'Unauthorized' });
	}

	const result = await Notification.updateMany(
		{
			$or: [{ recipientId: user._id }, { recipientRole: user.role }],
			isRead: false,
		},
		{
			isRead: true,
			readAt: new Date(),
		},
	);

	return sendSuccess(event, { updatedCount: result.modifiedCount });
});
