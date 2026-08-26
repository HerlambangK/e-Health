import Notification from '~/server/models/Notification';
import type { INotification } from '~/server/models/Notification';

interface NotifyOptions {
	recipientId?: string;
	recipientRole?: string;
	poliId?: string;
	type: INotification['type'];
	title: string;
	message: string;
	data?: Record<string, any>;
	channel?: INotification['channel'];
	sendEmail?: boolean; // default true for important notifications
}

export async function notify(
	opts: NotifyOptions,
): Promise<{ notification: any; recipients: string[] }> {
	const {
		recipientId,
		recipientRole,
		poliId,
		type,
		title,
		message,
		data,
		channel = 'personal',
		sendEmail = true,
	} = opts;

	// 1. Persist to DB
	const notification = await Notification.create({
		recipientId,
		recipientRole,
		type,
		title,
		message,
		data,
		channel,
	});

	// 2. Emit via Socket.IO
	const io = (globalThis as any).__io;
	if (io) {
		const payload =
			typeof (notification as any).toJSON === 'function'
				? (notification as any).toJSON()
				: notification;
		if (recipientId) io.to(`user:${recipientId}`).emit('notification', payload);
		if (recipientRole)
			io.to(`role:${recipientRole}`).emit('notification', payload);
		if (poliId) io.to(`poli:${poliId}`).emit('queue_update', payload);
		// Always emit broadcast/global for listening navbar/clients
		io.emit('notification', payload);
	}

	// 3. Forward to admin email
	let deliveredRecipients: string[] = [];
	if (sendEmail) {
		try {
			deliveredRecipients = await sendAdminEmail(title, message, type, data);
		} catch (e) {
			console.error('[Notify] Failed to send admin email:', e);
		}
	}

	return {
		notification,
		recipients: deliveredRecipients,
	};
}

function renderSecurityAlertEmailHtml(opts: {
	title: string;
	message: string;
	type: string;
	data?: any;
	appName: string;
	resetUrl: string;
}): string {
	const { title, type, data, appName, resetUrl } = opts;
	const isSuccess =
		type === 'login_success' || type === 'login' || data?.status === 'SUCCESS';
	const targetEmail = data?.email || 'Pengguna Sistem';
	const ipAddress = data?.ip || '127.0.0.1';
	const browser = data?.browser || 'Web Browser';
	const device = data?.device || 'Desktop / Mobile Device';
	const location = data?.location || 'Indonesia';
	const reason = data?.reason;

	const now = data?.timestamp ? new Date(data.timestamp) : new Date();
	const gmtStr = now
		.toISOString()
		.replace('T', ' ')
		.replace(/\.\d+Z$/, ' GMT');
	const wibStr =
		now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';

	const statusBadgeBg = isSuccess ? '#ecfdf5' : '#fef2f2';
	const statusBadgeColor = isSuccess ? '#059669' : '#dc2626';
	const statusBadgeBorder = isSuccess ? '#a7f3d0' : '#fecaca';
	const statusText = isSuccess
		? 'Sign-in Berhasil (Verified)'
		: `Percobaan Sign-in Gagal (${reason || 'Autentikasi Ditolak'})`;

	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">SISTEM KEAMANAN & NOTIFIKASI</span>
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 6px 0 0 0;">${appName}</h1>
                  </td>
                  <td align="right">
                    <span style="font-size: 28px;">${isSuccess ? '🔐' : '⚠️'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #334155;">
                We're verifying a recent sign-in for <strong style="color: #0f172a;"><a href="mailto:${targetEmail}" style="color: #2563eb; text-decoration: none;">${targetEmail}</a></strong>:
              </p>

              <!-- Details Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 32%;">Status</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600;">
                    <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; background-color: ${statusBadgeBg}; color: ${statusBadgeColor}; border: 1px solid ${statusBadgeBorder};">
                      ${statusText}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Timestamp</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">
                    ${gmtStr} <br><span style="font-size: 11px; color: #64748b; font-weight: normal;">(${wibStr})</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">IP Address</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; font-family: monospace; color: #0f172a;">
                    ${ipAddress}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Lokasi Login</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">
                    📍 ${location}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Device / Perangkat</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 500; color: #334155;">
                    💻 ${device}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #64748b;">Browser</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 500; color: #334155;">
                    🌐 ${browser}
                  </td>
                </tr>
              </table>

              <!-- Explanation Text -->
              <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
                ${
									isSuccess
										? 'You\'re receiving this message because of a successful sign-in from a device or session. If you believe that this sign-in is suspicious, <a href="' +
											resetUrl +
											'" style="color: #dc2626; font-weight: 600; text-decoration: underline;">please reset your password immediately.</a>'
										: 'You\'re receiving this message because of an unauthorized or failed sign-in attempt. If you did not initiate this attempt, your credentials may be at risk. <a href="' +
											resetUrl +
											'" style="color: #dc2626; font-weight: 600; text-decoration: underline;">Please reset your password immediately.</a>'
								}
              </p>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 11px 24px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                  Periksa Keamanan Akun / Reset Password
                </a>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 20px 0 0 0;">
                If you're aware of this sign-in, please disregard this notice. This can happen when you use your browser's incognito or private browsing mode or clear your cookies.
              </p>

              <p style="font-size: 13px; color: #334155; margin: 24px 0 0 0;">
                Thanks,<br>
                <strong>${appName} Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 32px; text-align: center; font-size: 11px; color: #94a3b8;">
              Email notifikasi keamanan otomatis dari server e-Health SIMPRS &bull; PT Sejahtera Sehat Karyautama<br>
              Pengirim: Configured SMTP (.env) &bull; Penerima: Terdaftar di Pengaturan Notifikasi
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function renderGeneralNotificationEmailHtml(opts: {
	title: string;
	message: string;
	type: string;
	data?: any;
	appName: string;
}): string {
	const { title, message, type, data, appName } = opts;
	const timestampStr =
		new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';

	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #0284c7; padding: 22px 32px;">
              <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.8); font-weight: 600;">NOTIFIKASI SISTEM</span>
              <h1 style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 4px 0 0 0;">🔔 ${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px;">
              <p style="font-size: 14px; line-height: 1.7; color: #334155; margin: 0 0 16px 0;">
                ${message}
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 12px;">
                <div style="margin-bottom: 6px;"><strong style="color: #64748b;">Tipe Notifikasi:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${type}</span></div>
                <div><strong style="color: #64748b;">Waktu:</strong> ${timestampStr}</div>
              </div>

              ${
								data
									? `
              <div style="margin-top: 16px;">
                <p style="font-size: 12px; font-weight: 600; color: #64748b; margin: 0 0 6px 0;">Detail Data:</p>
                <pre style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 11px; color: #334155; overflow-x: auto; border: 1px solid #e2e8f0; margin: 0;">${JSON.stringify(data, null, 2)}</pre>
              </div>`
									: ''
							}

              <p style="font-size: 13px; color: #334155; margin: 24px 0 0 0;">
                Salam hangat,<br>
                <strong>Tim ${appName}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center; font-size: 11px; color: #94a3b8;">
              Pemberitahuan otomatis dari sistem e-Health SIMPRS &bull; PT Sejahtera Sehat Karyautama
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function extractCleanEmail(raw?: string): string {
	if (!raw) return '';
	const match = String(raw).match(/<([^>]+)>/);
	if (match) return match[1].trim();
	return String(raw)
		.replace(/^["']|["']$/g, '')
		.trim();
}

async function sendAdminEmail(
	title: string,
	message: string,
	type: string,
	data?: any,
): Promise<string[]> {
	const { createTransporter } = await import('~/server/utils/mailer');
	const config = useRuntimeConfig();

	const recipientList: string[] = [];

	// 1. If explicit targetEmail is passed (e.g. from test-notification modal input), include it
	if (
		data?.targetEmail &&
		typeof data.targetEmail === 'string' &&
		data.targetEmail.includes('@')
	) {
		recipientList.push(extractCleanEmail(data.targetEmail));
	}

	// 2. Query configured NotificationSetting in database (STRICT: only active registered recipients)
	try {
		const NotificationSetting = (
			await import('~/server/models/NotificationSetting')
		).default;
		const settings = await NotificationSetting.find({ isActive: true });

		for (const s of settings) {
			const acceptsAll =
				s.notificationTypes.includes('Semua') ||
				s.notificationTypes.includes('all');
			const acceptsType = s.notificationTypes.includes(type);
			const acceptsLogin =
				type.startsWith('login') && s.notificationTypes.includes('login');
			const acceptsSystem =
				(type === 'system' || data?.isTest) &&
				(acceptsAll || s.notificationTypes.includes('system'));

			if (acceptsAll || acceptsType || acceptsLogin || acceptsSystem) {
				recipientList.push(extractCleanEmail(s.email));
			}
		}
	} catch (err) {
		console.error('[Notify] Failed to query NotificationSetting:', err);
	}

	// 3. Query active admin user emails from User profile (guarantees profile email receives notifications)
	try {
		const { User } = await import('~/server/models/User');
		const adminUsers = await User.find({
			role: 'admin',
			isActive: true,
			receiveNotifications: { $ne: false },
		}).select('email');

		for (const admin of adminUsers) {
			if (admin.email) {
				recipientList.push(extractCleanEmail(admin.email));
			}
		}
	} catch (userErr) {
		console.error('[Notify] Failed to query admin User profiles:', userErr);
	}

	const activeRecipients = Array.from(
		new Set(recipientList.filter((e) => e && e.includes('@'))),
	);

	if (activeRecipients.length === 0) {
		console.log(
			`[Notify] No recipient email configured in Notification Settings for event '${type}'. Skipping email dispatch (no self-send).`,
		);
		return [];
	}

	const transporter = await createTransporter();
	const appName = (config.public as any)?.appName || 'e-Health SIMPRS';
	const authOrigin =
		(config.public as any)?.authOrigin ||
		(config.runtimeConfig as any)?.auth?.origin ||
		process.env.AUTH_ORIGIN ||
		'http://localhost:3000';
	const resetUrl = `${authOrigin}/auth/signin`;

	// Determine if this is a login or security event
	const isLoginEvent = type.startsWith('login') || type === 'security_alert';

	const htmlContent = isLoginEvent
		? renderSecurityAlertEmailHtml({
				title,
				message,
				type,
				data,
				appName,
				resetUrl,
			})
		: renderGeneralNotificationEmailHtml({
				title,
				message,
				type,
				data,
				appName,
			});

	const sender =
		(config.smtp as any).from ||
		process.env.SMTP_FROM ||
		(config.smtp as any).user ||
		process.env.SMTP_USER;

	const successfulDeliveries: string[] = [];

	for (const toEmail of activeRecipients) {
		try {
			await transporter.sendMail({
				from: sender,
				to: toEmail,
				subject: isLoginEvent
					? `[e-Health Security] ${title}`
					: `[e-Health] ${title}`,
				html: htmlContent,
			});
			successfulDeliveries.push(toEmail);
			console.log(
				`[Notify] Email notification successfully sent to ${toEmail} for event '${type}'`,
			);
		} catch (err) {
			console.error(`[Notify] Failed to send email to ${toEmail}:`, err);
		}
	}

	return successfulDeliveries;
}
