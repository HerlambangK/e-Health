import IotWifi from '~/server/models/IotWifi';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const ssid = body?.ssid?.trim();
		const password = body?.password?.trim();

		if (!ssid) {
			return sendApiError(event, 400, 'bad_request', 'Nama SSID wajib diisi');
		}

		if (password === undefined || password === null) {
			return sendApiError(
				event,
				400,
				'bad_request',
				'Password WiFi wajib diisi',
			);
		}

		// Hitung prioritas berikutnya jika tidak diberikan
		let priority = body.priority;
		if (priority === undefined || priority === null) {
			const highest = await IotWifi.findOne().sort({ priority: -1 }).lean();
			priority = highest?.priority ? highest.priority + 1 : 1;
		}

		const newWifi = await IotWifi.create({
			ssid,
			password,
			priority: Number(priority),
			isActive: body.isActive ?? true,
			description: body.description?.trim() || '',
			timeoutMs: body.timeoutMs ? Number(body.timeoutMs) : 12000,
		});

		return sendSuccess(event, newWifi, 201);
	} catch (error: any) {
		console.error('[IoT Create WiFi Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal menyimpan konfigurasi WiFi',
		);
	}
});

