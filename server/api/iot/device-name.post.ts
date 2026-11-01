import IotDevice from '~/server/models/IotDevice';

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
		const newName = body?.name || body?.deviceName;
		const location = body?.location || body?.lokasi;

		let device = await IotDevice.findOne({ deviceId });

		if (!device) {
			device = await IotDevice.create({
				deviceId,
				name: newName ? String(newName).trim() : `Mesin Presensi ${deviceId}`,
				location: location ? String(location).trim() : 'Pintu Masuk Utama',
				status: 'online',
				lastSeen: new Date(),
				registeredAt: new Date(),
				isActive: true,
			});
		} else if (newName || location) {
			if (newName) device.name = String(newName).trim();
			if (location) device.location = String(location).trim();
			device.lastSeen = new Date();
			device.status = 'online';
			await device.save();
		}

		return {
			status: 'success',
			message: 'Data perangkat berhasil disinkronkan',
			device: {
				deviceId: device.deviceId,
				name: device.name,
				location: device.location || '-',
				status: device.status,
				connectedSsid: device.connectedSsid || null,
				lastSeen: device.lastSeen,
			},
		};
	} catch (error: any) {
		console.error('[IoT Device Name Sync Error]:', error);
		return {
			status: 'error',
			message: error.message || 'Gagal menyinkronkan nama perangkat',
		};
	}
});

