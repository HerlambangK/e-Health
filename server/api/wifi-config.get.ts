import IotWifi from '~/server/models/IotWifi';
import IotDevice from '~/server/models/IotDevice';

export default defineEventHandler(async (event) => {
	try {
		// 1. Periksa apakah perangkat menyertakan query telemetry (heartbeat via GET poll)
		const query = getQuery(event);
		const deviceId = (query.deviceId || query.device_id || query.id) as string;
		const connectedSsid = (query.connected_ssid || query.ssid) as string;
		const ipAddress = (query.ip || query.ipAddress) as string;
		const rssi = query.rssi ? Number(query.rssi) : undefined;
		const location = (query.location || query.lokasi) as string;

		let currentDeviceName: string | undefined = undefined;

		if (connectedSsid && typeof connectedSsid === 'string' && connectedSsid.trim().length > 0) {
			const cleanSsid = connectedSsid.trim();
			const existingWifi = await IotWifi.findOne({ ssid: cleanSsid });
			if (!existingWifi) {
				const highest = await IotWifi.findOne().sort({ priority: -1 }).lean();
				const nextPriority = highest?.priority ? highest.priority + 1 : 1;
				await IotWifi.create({
					ssid: cleanSsid,
					password: 'terdeteksi-otomatis',
					priority: nextPriority,
					isActive: true,
					description: `Otomatis ditambahkan dari fallback perangkat ${deviceId || 'IoT'}`,
					timeoutMs: 12000,
				});
			}
		}

		if (deviceId) {
			const cleanDeviceId = deviceId.trim().toUpperCase();
			const queryName = (query.deviceName || query.name || query.nama) as string;

			const existingDevice = await IotDevice.findOne({ deviceId: cleanDeviceId });
			
			// Jika perangkat baru, pakai nama dari query atau default.
			// Jika sudah ada di database, prioritaskan nama yang sudah diset oleh user di web!
			const nameToSet = existingDevice
				? existingDevice.name
				: (queryName ? queryName.trim() : `Mesin Presensi ${cleanDeviceId}`);

			const device = await IotDevice.findOneAndUpdate(
				{ deviceId: cleanDeviceId },
				{
					$set: {
						lastSeen: new Date(),
						status: 'online',
						...(connectedSsid ? { connectedSsid } : {}),
						...(ipAddress ? { ipAddress } : {}),
						...(rssi !== undefined ? { rssi } : {}),
						...(location ? { location } : {}),
					},
					$setOnInsert: {
						name: nameToSet,
						registeredAt: new Date(),
						isActive: true,
					},
				},
				{ upsert: true, new: true },
			);

			currentDeviceName = device.name;
		}

		// 2. Cek apakah database sudah memiliki daftar WiFi. Jika kosong, buat default seed sesuai contoh
		const count = await IotWifi.countDocuments();
		if (count === 0) {
			await IotWifi.insertMany([
				{
					ssid: 'Kantor_Utama',
					password: 'passwordUtama123',
					priority: 1,
					isActive: true,
					description: 'Jaringan Utama Kantor & Poli SIMPRS',
					timeoutMs: 12000,
				},
				{
					ssid: 'Kantor_Cadangan',
					password: 'passwordCadangan456',
					priority: 2,
					isActive: true,
					description: 'Jaringan Cadangan Ruang Dokter & IT',
					timeoutMs: 12000,
				},
				{
					ssid: 'Hotspot_Maintenance',
					password: 'bembietigaduasatu',
					priority: 3,
					isActive: true,
					description: 'Hotspot Darurat Teknisi / Maintenance IoT',
					timeoutMs: 12000,
				},
			]);
		}

		// 3. Ambil seluruh SSID aktif dengan urutan prioritas
		const activeWifis = await IotWifi.find({ isActive: true })
			.sort({ priority: 1, createdAt: 1 })
			.lean();

		const timeout_ms =
			activeWifis.find((w) => w.timeoutMs && w.timeoutMs > 0)?.timeoutMs ||
			12000;

		// 4. Return format yang 100% kompatibel dengan ArduinoJson v7
		return {
			status: 'success',
			data: activeWifis.map((w) => ({
				ssid: w.ssid,
				password: w.password,
			})),
			timeout_ms,
			...(deviceId
				? {
						device_id: deviceId.trim().toUpperCase(),
						device_name: currentDeviceName,
					}
				: {}),
		};
	} catch (error: any) {
		console.error('[IoT WiFi Config Error]:', error);
		// Return format error terstruktur
		return {
			status: 'error',
			message: error.message || 'Gagal mengambil konfigurasi WiFi',
			data: [],
			timeout_ms: 12000,
		};
	}
});

