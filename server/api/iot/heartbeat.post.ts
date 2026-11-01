import IotDevice from '~/server/models/IotDevice';
import IotWifi from '~/server/models/IotWifi';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const rawDeviceId = body?.deviceId || body?.device_id || body?.id;

		if (!rawDeviceId) {
			return {
				status: 'error',
				message: 'Parameter deviceId wajib disertakan',
			};
		}

		const deviceId = String(rawDeviceId).trim().toUpperCase();
		const connectedSsid = body?.connectedSsid || body?.ssid;
		const ipAddress = body?.ipAddress || body?.ip;
		const rssi = body?.rssi !== undefined ? Number(body.rssi) : undefined;
		const name = body?.name || body?.deviceName;
		const location = body?.location || body?.lokasi;
		const firmwareVersion = body?.firmwareVersion || body?.firmware;

		// Otomatis tambahkan WiFi baru jika perangkat terhubung ke SSID fallback yang belum terdaftar
		if (connectedSsid && typeof connectedSsid === 'string' && connectedSsid.trim().length > 0) {
			const cleanSsid = connectedSsid.trim();
			const existingWifi = await IotWifi.findOne({ ssid: cleanSsid });
			if (!existingWifi) {
				const highest = await IotWifi.findOne().sort({ priority: -1 }).lean();
				const nextPriority = highest?.priority ? highest.priority + 1 : 1;
				await IotWifi.create({
					ssid: cleanSsid,
					password: body?.wifiPassword ? String(body.wifiPassword).trim() : 'terdeteksi-otomatis',
					priority: nextPriority,
					isActive: true,
					description: `Otomatis ditambahkan dari fallback perangkat ${deviceId}`,
					timeoutMs: 12000,
				});
			}
		}

		const existingDevice = await IotDevice.findOne({ deviceId });
		const defaultFallbackName = `Perangkat Presensi ${deviceId}`;

		// Jika nama diubah di web dashboard, jangan ditimpa nama default dari hardware
		let finalName = existingDevice ? existingDevice.name : (name ? name.trim() : defaultFallbackName);
		if (body?.forceRename && name) {
			finalName = name.trim();
		}

		const device = await IotDevice.findOneAndUpdate(
			{ deviceId },
			{
				$set: {
					lastSeen: new Date(),
					status: 'online',
					...(body?.forceRename && name ? { name: finalName } : {}),
					...(connectedSsid ? { connectedSsid } : {}),
					...(ipAddress ? { ipAddress } : {}),
					...(rssi !== undefined ? { rssi } : {}),
					...(firmwareVersion ? { firmwareVersion } : {}),
					...(location ? { location } : {}),
				},
				$setOnInsert: {
					name: finalName,
					registeredAt: new Date(),
					isActive: true,
				},
			},
			{ upsert: true, new: true },
		);

		return {
			status: 'success',
			message: 'Heartbeat & status WiFi perangkat berhasil dicatat',
			serverTime: new Date().toISOString(),
			device: {
				deviceId: device.deviceId,
				name: device.name,
				status: device.status,
				connectedSsid: device.connectedSsid || null,
				ipAddress: device.ipAddress || null,
				rssi: device.rssi ?? null,
				lastSeen: device.lastSeen,
			},
		};
	} catch (error: any) {
		console.error('[IoT Heartbeat Error]:', error);
		return {
			status: 'error',
			message: error.message || 'Gagal memproses heartbeat perangkat',
		};
	}
});

