import { User } from '~/server/models/User';
import NotificationSetting from '~/server/models/NotificationSetting';
import { sendSuccess, sendApiError } from '~/server/utils/response';

export default defineEventHandler(async (event) => {
	const sessionUser = event.context.user;
	if (!sessionUser) {
		return sendApiError(
			event,
			401,
			'unauthorized',
			'Unauthorized: Silakan login terlebih dahulu',
		);
	}

	try {
		const userId = sessionUser._id || sessionUser.id;
		const body = await readBody(event);

		const {
			name,
			email,
			phone,
			position,
			department,
			nip,
			avatar,
			receiveNotifications,
			currentPassword,
			newPassword,
		} = body || {};

		const user = await User.findById(userId).select('+password');
		if (!user) {
			return sendApiError(event, 404, 'user_not_found', 'User tidak ditemukan');
		}

		const oldEmail = user.email;
		const cleanEmail = email ? String(email).trim().toLowerCase() : oldEmail;

		// 1. Check email uniqueness if email changed
		if (cleanEmail !== oldEmail) {
			const existing = await User.findOne({
				email: cleanEmail,
				_id: { $ne: userId },
			});
			if (existing) {
				return sendApiError(
					event,
					400,
					'email_exists',
					'Email sudah digunakan oleh akun lain',
				);
			}
			user.email = cleanEmail;
		}

		// 2. Update basic profile info
		if (name) user.name = String(name).trim();
		if (phone !== undefined) user.phone = String(phone).trim();
		if (position !== undefined) user.position = String(position).trim();
		if (department !== undefined) user.department = String(department).trim();
		if (nip !== undefined) user.nip = String(nip).trim();
		if (avatar !== undefined) user.avatar = String(avatar).trim();
		if (receiveNotifications !== undefined)
			user.receiveNotifications = Boolean(receiveNotifications);

		// 3. Handle password change if requested
		if (newPassword) {
			if (!currentPassword) {
				return sendApiError(
					event,
					400,
					'missing_password',
					'Password saat ini diperlukan untuk mengubah password',
				);
			}
			const isMatch = await user.comparePassword(currentPassword);
			if (!isMatch) {
				return sendApiError(
					event,
					400,
					'invalid_password',
					'Password saat ini tidak cocok',
				);
			}
			if (newPassword.length < 6) {
				return sendApiError(
					event,
					400,
					'weak_password',
					'Password baru minimal 6 karakter',
				);
			}
			user.password = newPassword;
		}

		await user.save();

		// 4. Auto-Sync with NotificationSetting so all system notifications reach this profile email
		try {
			const shouldReceive = user.receiveNotifications !== false;

			// Clean up old email record in NotificationSetting if email changed
			if (cleanEmail !== oldEmail) {
				await NotificationSetting.deleteMany({ email: oldEmail });
			}

			if (shouldReceive) {
				await NotificationSetting.findOneAndUpdate(
					{ email: cleanEmail },
					{
						email: cleanEmail,
						name: `${user.name} (${user.position || user.role || 'Staff'})`,
						isActive: true,
						notificationTypes: ['Semua'],
						createdBy: user._id,
					},
					{ upsert: true, new: true },
				);
			} else {
				// If user disabled receiving notifications, mark inactive
				await NotificationSetting.updateMany(
					{ email: cleanEmail },
					{ isActive: false },
				);
			}
		} catch (syncErr) {
			console.warn('[Profile Save] NotificationSetting sync warning:', syncErr);
		}

		const { password: _pw, ...sanitizedUser } = user.toObject();

		return sendSuccess(event, {
			user: sanitizedUser,
			message:
				'Profil akun berhasil diperbarui dan disinkronkan dengan pengaturan notifikasi sistem.',
		});
	} catch (error: any) {
		console.error('[Profile Update Error]:', error);
		return sendApiError(
			event,
			500,
			'server_error',
			error.message || 'Gagal memperbarui data profil',
		);
	}
});
