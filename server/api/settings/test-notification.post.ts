import { notify } from '~/server/utils/notify';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	const user = event.context.user;
	if (!user || user.role !== 'admin') {
		return sendApiError(
			event,
			403,
			'forbidden',
			'Forbidden: Hanya admin yang dapat mengakses',
		);
	}

	try {
		const body = await readBody(event).catch(() => ({}));
		const { email } = body || {};

		const timestampStr = new Date().toLocaleString('id-ID', {
			timeZone: 'Asia/Jakarta',
		});

		await notify({
			type: 'system',
			title: 'Uji Coba Notifikasi e-Health SIMPRS',
			message: `Notifikasi pengujian berhasil dikirim pada ${timestampStr}. WebSocket real-time dan pengiriman email admin berjalan normal.`,
			data: {
				isTest: true,
				requestedBy: user.email || user.name || 'Admin',
				targetEmail: email || 'Semua email penerima aktif',
				timestamp: new Date().toISOString(),
			},
			channel: 'broadcast',
			sendEmail: true,
		});

		return sendSuccess(event, {
			success: true,
			message:
				'Test notifikasi berhasil dikirim (diproses via WebSocket dan diteruskan ke email penerima)',
		});
	} catch (error: any) {
		console.error('[Test Notification Error]:', error);
		return sendApiError(
			event,
			500,
			'test_failed',
			error.message || 'Gagal mengirim test notifikasi',
		);
	}
});
