import Notification from '~/server/models/Notification';
import { sendSuccess, sendApiError } from '~/server/utils/response';
import { parsePagination } from '~/server/utils/pagination';

export default defineEventHandler(async (event) => {
	try {
		const user = event.context.user;
		if (!user) {
			return sendApiError(event, 401, 'unauthorized', 'Unauthorized');
		}

		const query = getQuery(event) as Record<string, any>;
		const { page, pageSize, skip } = parsePagination(query);

		const userId = user._id || user.id;
		const filter: any = {
			$or: [{ recipientId: userId }, { recipientRole: user.role }],
		};

		if (query.unreadOnly === 'true') {
			filter.isRead = false;
		}

		const [items, total] = await Promise.all([
			Notification.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(pageSize)
				.lean(),
			Notification.countDocuments(filter),
		]);

		return sendSuccess(event, items, 200, {
			total,
			page,
			pageSize,
		});
	} catch (error: any) {
		console.error('[Notifications Index Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Internal Server Error',
		);
	}
});
