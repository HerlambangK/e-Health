import IotDevice from '~/server/models/IotDevice';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const id = getRouterParam(event, 'id') || '';
		const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
		const filter = isObjectId ? { _id: id } : { deviceId: id.trim().toUpperCase() };

		const device = await IotDevice.findOne(filter);

		if (!device) {
			return sendApiError(
				event,
				404,
				'not_found',
				'Perangkat tidak ditemukan',
			);
		}

		// Jika perangkat tidak memiliki IP Address terdaftar, tidak bisa di-ping
		if (!device.ipAddress || device.ipAddress === '-' || device.ipAddress === '0.0.0.0') {
			device.status = 'offline';
			await device.save();

			return sendSuccess(event, {
				isOnline: false,
				responded: false,
				status: 'offline',
				message: `Tidak ada balasan: Perangkat ${device.name} belum memiliki IP Address terdaftar. Status tetap OFFLINE.`,
				device,
			});
		}

		// Lakukan ping nyata ke endpoint perangkat (timeout 2 detik)
		let responded = false;
		const targetUrl = `http://${device.ipAddress}/ping`;

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 2000);

			const pingRes = await fetch(targetUrl, {
				method: 'GET',
				signal: controller.signal,
			}).catch(async () => {
				// Coba fallback ke root URL perangkat
				return await fetch(`http://${device.ipAddress}/`, {
					method: 'GET',
					signal: controller.signal,
				});
			});

			clearTimeout(timeoutId);

			if (pingRes && (pingRes.ok || pingRes.status < 500)) {
				responded = true;
			}
		} catch (netErr: any) {
			// Perangkat tidak merespons (unreachable / timeout / connection refused)
			responded = false;
		}

		if (responded) {
			// Jika ada balasan nyata dari perangkat
			device.lastSeen = new Date();
			device.status = 'online';
			await device.save();

			return sendSuccess(event, {
				isOnline: true,
				responded: true,
				status: 'online',
				message: `Balasan diterima dari perangkat ${device.name} (${device.ipAddress}). Status: ONLINE.`,
				device,
			});
		} else {
			// Jika TIDAK ada balasan dari perangkat -> status TETAP OFFLINE
			device.status = 'offline';
			await device.save();

			return sendSuccess(event, {
				isOnline: false,
				responded: false,
				status: 'offline',
				message: `Tidak ada balasan dari ${device.name} (${device.ipAddress}). Timeout / tidak terjangkau. Status tetap OFFLINE.`,
				device,
			});
		}
	} catch (error: any) {
		console.error('[IoT Ping Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal melakukan pengujian ping perangkat',
		);
	}
});
