import IotAttendance from '~/server/models/IotAttendance';
import { sendSuccess, sendApiError } from '~/server/utils/response';
import { parsePagination } from '~/server/utils/pagination';

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event) as Record<string, any>;
		const { page, pageSize, skip } = parsePagination(query);

		const filter: Record<string, any> = {};

		// Filter Tipe (masuk / pulang)
		if (query.type && query.type !== 'all') {
			filter.type = query.type;
		}

		// Filter Status Ketepatan
		if (query.status && query.status !== 'all') {
			filter.status = query.status;
		}

		// Filter Device ID
		if (query.deviceId && query.deviceId !== 'all') {
			filter.deviceId = query.deviceId;
		}

		// Filter Rentang Tanggal
		if (query.dateFrom || query.dateTo) {
			filter.timestamp = {};
			if (query.dateFrom) {
				const fromDate = new Date(query.dateFrom);
				fromDate.setHours(0, 0, 0, 0);
				filter.timestamp.$gte = fromDate;
			}
			if (query.dateTo) {
				const toDate = new Date(query.dateTo);
				toDate.setHours(23, 59, 59, 999);
				filter.timestamp.$lte = toDate;
			}
		}

		// Filter Pencarian Teks
		if (query.search && String(query.search).trim()) {
			const s = String(query.search).trim();
			filter.$or = [
				{ userName: { $regex: s, $options: 'i' } },
				{ userNip: { $regex: s, $options: 'i' } },
				{ uid: { $regex: s, $options: 'i' } },
				{ deviceId: { $regex: s, $options: 'i' } },
				{ connectedSsid: { $regex: s, $options: 'i' } },
			];
		}

		// Hitung statistik hari ini
		const now = new Date();
		const startOfToday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0,
		);
		const endOfToday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			23,
			59,
			59,
			999,
		);

		const [items, total, todayMasuk, todayPulang, todayTerlambat] =
			await Promise.all([
				IotAttendance.find(filter)
					.sort({ timestamp: -1 })
					.skip(skip)
					.limit(pageSize)
					.populate('user', 'name email avatar role department')
					.lean(),
				IotAttendance.countDocuments(filter),
				IotAttendance.countDocuments({
					timestamp: { $gte: startOfToday, $lte: endOfToday },
					type: 'masuk',
				}),
				IotAttendance.countDocuments({
					timestamp: { $gte: startOfToday, $lte: endOfToday },
					type: 'pulang',
				}),
				IotAttendance.countDocuments({
					timestamp: { $gte: startOfToday, $lte: endOfToday },
					type: 'masuk',
					status: 'terlambat',
				}),
			]);

		return sendSuccess(
			event,
			{
				items,
				stats: {
					todayTotal: todayMasuk + todayPulang,
					todayMasuk,
					todayPulang,
					todayTerlambat,
				},
			},
			200,
			{
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize),
			},
		);
	} catch (error: any) {
		console.error('[IoT Attendance List Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal memuat log presensi',
		);
	}
});

