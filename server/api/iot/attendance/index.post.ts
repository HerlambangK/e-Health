import IotAttendance from '~/server/models/IotAttendance';
import { User } from '~/server/models/User';
import Dokter from '~/server/models/Dokter';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const {
			userId,
			type,
			timestamp,
			status,
			deviceId = 'MANUAL_WEB',
			notes,
		} = body;

		if (!userId) {
			return sendApiError(
				event,
				400,
				'bad_request',
				'Pegawai / Dokter wajib dipilih',
			);
		}

		if (!type || !['masuk', 'pulang'].includes(type)) {
			return sendApiError(
				event,
				400,
				'bad_request',
				'Tipe presensi (masuk/pulang) wajib diisi',
			);
		}

		// Cari user atau dokter
		let userName = 'Pegawai';
		let userNip = '-';
		let userRole = 'pegawai';
		let userObjId: any = null;

		const user = await User.findById(userId).lean();
		if (user) {
			userName = user.name;
			userNip = user.nip || '-';
			userRole = user.role || 'pegawai';
			userObjId = user._id;
		} else {
			const dokter = await Dokter.findById(userId).lean();
			if (dokter) {
				userName = dokter.namaDokter;
				userNip = dokter.nip || '-';
				userRole = 'doctor';
			}
		}

		const recordDate = timestamp ? new Date(timestamp) : new Date();

		const created = await IotAttendance.create({
			deviceId,
			deviceName: 'Input Manual Web',
			uid: userNip || 'MANUAL',
			user: userObjId,
			userName,
			userNip,
			userRole,
			type,
			timestamp: recordDate,
			status: status || 'tepat_waktu',
			notes: notes?.trim() || 'Presensi dicatat manual oleh admin',
		});

		return sendSuccess(event, created, 201);
	} catch (error: any) {
		console.error('[IoT Manual Attendance Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal menyimpan presensi manual',
		);
	}
});

