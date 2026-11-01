import { User } from '~/server/models/User';
import Dokter from '~/server/models/Dokter';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	try {
		const [users, dokters] = await Promise.all([
			User.find({ isActive: true })
				.select('_id name email role nip rfidCardId department position')
				.sort({ name: 1 })
				.lean(),
			Dokter.find()
				.select('_id namaDokter nip spesialisasi poli')
				.sort({ namaDokter: 1 })
				.lean(),
		]);

		const staffList = [
			...users.map((u) => ({
				id: u._id.toString(),
				name: u.name,
				nip: u.nip || '-',
				role: u.role,
				department: u.department || u.position || 'Staff',
				rfidCardId: u.rfidCardId || '',
				type: 'user',
			})),
			...dokters.map((d) => ({
				id: d._id.toString(),
				name: d.namaDokter,
				nip: d.nip || '-',
				role: 'doctor',
				department: `Poli ${d.poli} (${d.spesialisasi})`,
				rfidCardId: '',
				type: 'dokter',
			})),
		];

		return sendSuccess(event, staffList);
	} catch (error: any) {
		console.error('[IoT Staff List Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal memuat daftar staf',
		);
	}
});

