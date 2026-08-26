import NotificationSetting from '~/server/models/NotificationSetting';
import { sendSuccess, sendApiError } from '~/server/utils/response';
import { parsePagination } from '~/server/utils/pagination';

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

		const query = getQuery(event) as Record<string, any>;
		const { page, pageSize, skip } = parsePagination(query);

		const filter = {};
		const [items, total] = await Promise.all([
			NotificationSetting.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(pageSize)
				.populate('createdBy', 'name email')
				.lean(),
			NotificationSetting.countDocuments(filter),
		]);

		return sendSuccess(event, items, 200, {
			total,
			page,
			pageSize,
		});
	} catch (error: any) {
		console.error('[Notification Setting List Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Internal Server Error',
		);
	}
});
