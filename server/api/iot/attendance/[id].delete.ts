import IotAttendance from '~/server/models/IotAttendance';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const id = getRouterParam(event, 'id');
		const deleted = await IotAttendance.findByIdAndDelete(id);

		if (!deleted) {
			return sendApiError(
				event,
				404,
				'not_found',
				'Data presensi tidak ditemukan',
			);
		}

		return sendSuccess(event, { message: 'Data presensi berhasil dihapus' });
	} catch (error: any) {
		console.error('[IoT Delete Attendance Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal menghapus data presensi',
		);
	}
});

