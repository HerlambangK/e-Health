import { getServerSession } from '#auth';
import { getRequestURL } from 'h3';
import {
	hasPermission,
	normalizeRole,
	type Action,
	type Resource,
} from '~/utils/permissions';
import { sendApiError } from '~/server/utils/response';

function mapResource(pathname: string): Resource | null {
	if (pathname.startsWith('/api/pasien')) return 'pasien';
	if (pathname.startsWith('/api/dokter')) return 'dokter';
	if (pathname.startsWith('/api/rekamedis')) return 'rekamedis';
	if (pathname.startsWith('/api/appointment')) return 'appointment';
	if (pathname.startsWith('/api/billing')) return 'billing';
	if (pathname.startsWith('/api/dashboard')) return 'dashboard';
	if (pathname.startsWith('/api/obat')) return 'obat';
	if (pathname.startsWith('/api/penyakit')) return 'penyakit';
	if (pathname.startsWith('/api/routes')) return 'routes';
	if (pathname.startsWith('/api/admin')) return 'admin';
	if (pathname.startsWith('/api/encounter')) return 'encounter';
	if (pathname.startsWith('/api/antrian')) return 'antrian';
	if (pathname.startsWith('/api/resep')) return 'resep';
	if (pathname.startsWith('/api/ranap')) return 'ranap';
	if (pathname.startsWith('/api/rujukan')) return 'rujukan';
	if (pathname.startsWith('/api/tindakan')) return 'tindakan';
	if (pathname.startsWith('/api/icd')) return 'icd';
	if (pathname.startsWith('/api/farmasi')) return 'farmasi';
	if (pathname.startsWith('/api/satusehat')) return 'satusehat';
	if (pathname.startsWith('/api/sinoap')) return 'sinoap';
	if (pathname.startsWith('/api/notifications')) return 'notifications';
	if (pathname.startsWith('/api/settings')) return 'settings';
	if (pathname.startsWith('/api/iot')) return 'iot';
	if (
		pathname.startsWith('/api/profile') ||
		pathname.startsWith('/api/user/profile')
	)
		return 'profile';
	return null;
}

function mapAction(method?: string): Action {
	switch ((method || 'GET').toUpperCase()) {
		case 'POST':
			return 'create';
		case 'PUT':
		case 'PATCH':
			return 'update';
		case 'DELETE':
			return 'delete';
		default:
			return 'read';
	}
}

export default defineEventHandler(async (event) => {
	const pathname = getRequestURL(event).pathname;

	if (!pathname.startsWith('/api')) return;
	if (pathname.startsWith('/api/auth')) return;

	// Bypass auth for IoT devices (ESP32/Arduino polling & status reporting)
	const isIotDeviceEndpoint =
		pathname === '/api/wifi-config' ||
		pathname.startsWith('/api/wifi-config') ||
		pathname === '/api/iot/presensi' ||
		pathname === '/api/iot/heartbeat' ||
		pathname === '/api/iot/device-status' ||
		pathname === '/api/iot/device-name' ||
		pathname === '/api/iot/ping' ||
		pathname === '/api/iot/sensor/telemetry' ||
		pathname === '/api/iot/presensi/spec' ||
		pathname === '/api/iot/sensor/spec';

	if (isIotDeviceEndpoint) {
		return;
	}

	const session = await getServerSession(event);
	if (!session) {
		return sendApiError(event, 401, 'unauthorized', 'Unauthorized');
	}

	const role = normalizeRole(session.user?.role);
	const isActive = session.user?.isActive !== false;

	if (!isActive) {
		return sendApiError(event, 403, 'inactive_account', 'Account is inactive');
	}

	// Populate user in event context for all downstream handlers
	event.context.user = session?.user;

	const resource = mapResource(pathname);
	if (!resource) {
		return;
	}

	const action = mapAction(event.method);

	if (!hasPermission(role, resource, action)) {
		return sendApiError(
			event,
			403,
			'forbidden',
			'You do not have access to this resource',
		);
	}

	event.context.user = session?.user;
});
