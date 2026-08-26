import { NuxtAuthHandler } from '#auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '~/server/models/User';
import { notify } from '~/server/utils/notify';

async function getUser(id: string) {
	const user = await User.findById(id);

	return user?.toJSON();
}

import { extractClientInfo } from '~/server/utils/client-info';

export default NuxtAuthHandler({
	secret: useRuntimeConfig().auth.secret,
	pages: {
		signIn: '/auth/signin',
	},
	providers: [
		// @ts-expect-error
		CredentialsProvider.default({
			name: 'credentials',
			origin: useRuntimeConfig().auth.origin,
			async authorize(
				credential: { email: string; password: string },
				req: any,
			) {
				// Authorize the user
				const email = credential.email?.trim().toLowerCase();
				const password = credential.password;
				const client = extractClientInfo(req);

				if (!email || !password) {
					return null;
				}

				const user = await User.findOne({ email }).select('+password');

				if (!user) {
					await notify({
						recipientRole: 'admin',
						type: 'login_failed',
						title: `Failed Sign-in Attempt for ${email}`,
						message: `Percobaan login gagal untuk akun ${email} (Akun tidak terdaftar) dari ${client.device}, ${client.browser} (${client.location})`,
						data: {
							email,
							ip: client.ip,
							browser: client.browser,
							os: client.os,
							device: client.device,
							location: client.location,
							status: 'FAILED',
							reason: 'Akun tidak terdaftar dalam sistem',
							timestamp: new Date().toISOString(),
						},
						channel: 'role',
						sendEmail: true,
					});
					return null;
				}

				if (user.isActive === false) {
					await notify({
						recipientRole: 'admin',
						type: 'login_failed',
						title: `Failed Sign-in Attempt for ${email}`,
						message: `Percobaan login gagal untuk akun ${user.email} (Akun nonaktif) dari ${client.device}, ${client.browser} (${client.location})`,
						data: {
							email: user.email,
							name: user.name,
							ip: client.ip,
							browser: client.browser,
							os: client.os,
							device: client.device,
							location: client.location,
							status: 'FAILED',
							reason: 'Akun pengguna dinonaktifkan',
							timestamp: new Date().toISOString(),
						},
						channel: 'role',
						sendEmail: true,
					});
					return null;
				}

				const isValid = await user.comparePassword(password);

				if (!isValid) {
					await notify({
						recipientRole: 'admin',
						type: 'login_failed',
						title: `Failed Sign-in Attempt for ${email}`,
						message: `Percobaan login gagal untuk akun ${user.email} (Kata sandi salah) dari ${client.device}, ${client.browser} (${client.location})`,
						data: {
							email: user.email,
							name: user.name,
							ip: client.ip,
							browser: client.browser,
							os: client.os,
							device: client.device,
							location: client.location,
							status: 'FAILED',
							reason: 'Kata sandi tidak valid',
							timestamp: new Date().toISOString(),
						},
						channel: 'role',
						sendEmail: true,
					});
					return null;
				}

				user.lastLogin = new Date();
				await user.save({ validateBeforeSave: false });

				const { password: _password, ...sanitizedUser } = user.toObject();

				await notify({
					recipientRole: 'admin',
					type: 'login_success',
					title: `Recent Sign-in Verification for ${user.email}`,
					message: `User ${user.name} (${user.email}) berhasil login ke sistem dari ${client.device}, ${client.browser} (${client.location})`,
					data: {
						userId: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
						ip: client.ip,
						browser: client.browser,
						os: client.os,
						device: client.device,
						location: client.location,
						status: 'SUCCESS',
						timestamp: new Date().toISOString(),
					},
					channel: 'role',
					sendEmail: true, // Always email admin for login events
				});

				return sanitizedUser;
			},
		}),
	],

	session: {
		strategy: 'jwt',
	},

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token = {
					...token,
					...user,
				};
			}

			return token;
		},

		async session({ session, token }) {
			// @ts-expect-error
			const refreshedUser = await getUser(token._id);

			session.user = {
				...token,
				...session.user,
				...refreshedUser,
			};

			return session;
		},
	},
});
