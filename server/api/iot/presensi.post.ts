import IotAttendance from '~/server/models/IotAttendance';
import IotDevice from '~/server/models/IotDevice';
import { User } from '~/server/models/User';
import Dokter from '~/server/models/Dokter';
import { notify } from '~/server/utils/notify';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const rawDeviceId = body?.deviceId || body?.device_id || body?.id;
		const rawUid = body?.uid || body?.cardUid || body?.rfid || body?.nip;

		if (!rawDeviceId) {
			return {
				status: 'error',
				message: 'Parameter deviceId wajib disertakan',
			};
		}

		if (!rawUid) {
			return {
				status: 'error',
				message: 'Parameter uid (kartu RFID/NIP) wajib disertakan',
			};
		}

		const deviceId = String(rawDeviceId).trim().toUpperCase();
		const uid = String(rawUid).trim();
		const requestedType = body?.type ? String(body.type).toLowerCase() : 'auto';
		const connectedSsid = body?.connectedSsid || body?.ssid;

		// 1. Cari atau update device heartbeat
		const device = await IotDevice.findOneAndUpdate(
			{ deviceId },
			{
				$set: {
					lastSeen: new Date(),
					status: 'online',
					...(connectedSsid ? { connectedSsid } : {}),
				},
				$setOnInsert: {
					name: `Device ${deviceId}`,
					registeredAt: new Date(),
					isActive: true,
				},
			},
			{ upsert: true, new: true },
		);

		// 2. Cari identitas pemilik kartu di User atau Dokter
		let userObj: any = null;
		let userName = '';
		let userNip = '';
		let userRole = 'pegawai';

		const foundUser = await User.findOne({
			$or: [{ rfidCardId: uid }, { nip: uid }, { email: uid }],
		}).lean();

		if (foundUser) {
			userObj = foundUser;
			userName = foundUser.name;
			userNip = foundUser.nip || uid;
			userRole = foundUser.role || 'pegawai';
		} else {
			// Cek apakah terdaftar sebagai dokter
			const foundDokter = await Dokter.findOne({
				$or: [{ nip: uid }, { licenseNumber: uid }],
			}).lean();

			if (foundDokter) {
				userName = foundDokter.namaDokter;
				userNip = foundDokter.nip;
				userRole = 'doctor';
			} else {
				// Kartu belum terdaftar di sistem
				userName = `Kartu Tamu / Baru (${uid})`;
				userNip = uid;
				userRole = 'guest';
			}
		}

		// 3. Tentukan tipe presensi (Masuk vs Pulang)
		const now = new Date();
		const startOfDay = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0,
		);
		const endOfDay = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			23,
			59,
			59,
		);

		let finalType: 'masuk' | 'pulang' = 'masuk';

		if (requestedType === 'masuk' || requestedType === 'in') {
			finalType = 'masuk';
		} else if (requestedType === 'pulang' || requestedType === 'out') {
			finalType = 'pulang';
		} else {
			// Mode otomatis (auto-detect berdasarkan riwayat hari ini)
			const lastRecordToday = await IotAttendance.findOne({
				$or: [
					{ uid },
					...(userObj?._id ? [{ user: userObj._id }] : []),
				],
				timestamp: { $gte: startOfDay, $lte: endOfDay },
			})
				.sort({ timestamp: -1 })
				.lean();

			if (!lastRecordToday) {
				finalType = 'masuk';
			} else if (lastRecordToday.type === 'masuk') {
				finalType = 'pulang';
			} else {
				finalType = 'masuk';
			}
		}

		// 4. Hitung status ketepatan waktu
		// Jam standar: Masuk maksimal 08:00, Pulang minimal 17:00
		const hours = now.getHours();
		const minutes = now.getMinutes();
		let punctualityStatus:
			| 'tepat_waktu'
			| 'terlambat'
			| 'pulang_cepat'
			| 'lembur' = 'tepat_waktu';

		if (finalType === 'masuk') {
			if (hours > 8 || (hours === 8 && minutes > 0)) {
				punctualityStatus = 'terlambat';
			} else {
				punctualityStatus = 'tepat_waktu';
			}
		} else {
			if (hours < 17) {
				punctualityStatus = 'pulang_cepat';
			} else if (hours >= 19) {
				punctualityStatus = 'lembur';
			} else {
				punctualityStatus = 'tepat_waktu';
			}
		}

		// 5. Simpan record presensi ke Database
		const attendance = await IotAttendance.create({
			deviceId: device.deviceId,
			deviceName: device.name,
			uid,
			user: userObj?._id || undefined,
			userName,
			userNip,
			userRole,
			type: finalType,
			timestamp: now,
			status: punctualityStatus,
			connectedSsid: connectedSsid || device.connectedSsid || undefined,
			notes: userObj ? 'Otentikasi berhasil' : 'Kartu belum dipetakan',
		});

		// 6. Format tanggal & jam untuk display Arduino
		const timeStr = now.toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		});
		const dateStr = now.toISOString().split('T')[0];

		// 7. Kirim in-app notification non-blocking
		notify({
			type: 'general',
			title: `Presensi ${finalType.toUpperCase()}: ${userName}`,
			message: `${userName} (${userRole}) tercatat presensi ${finalType} pada ${timeStr} WIB via ${device.name}`,
			recipientRole: 'admin',
			sendEmail: false,
		}).catch((err) =>
			console.warn('[IoT Notify Silent Warning]:', err?.message),
		);

		// 8. Return response ideal untuk ArduinoJson v7
		return {
			status: 'success',
			message: `Presensi ${finalType} berhasil dicatat`,
			data: {
				id: attendance._id,
				uid,
				name: userName,
				nip: userNip,
				role: userRole,
				type: finalType,
				status: punctualityStatus,
				time: timeStr,
				date: dateStr,
				deviceId: device.deviceId,
				deviceName: device.name,
				connectedSsid: device.connectedSsid || connectedSsid || null,
			},
		};
	} catch (error: any) {
		console.error('[IoT Presensi Error]:', error);
		return {
			status: 'error',
			message: error.message || 'Gagal mencatat presensi',
		};
	}
});

