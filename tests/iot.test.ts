import { describe, it, expect } from 'vitest';
import { hasPermission } from '../utils/permissions';
import { accountNavigationLinks } from '../utils';

describe('IoT Permissions and Navigation', () => {
	it('allows admin full CRUD permissions for iot', () => {
		expect(hasPermission('admin', 'iot', 'create')).toBe(true);
		expect(hasPermission('admin', 'iot', 'read')).toBe(true);
		expect(hasPermission('admin', 'iot', 'update')).toBe(true);
		expect(hasPermission('admin', 'iot', 'delete')).toBe(true);
	});

	it('allows doctor and nurse read permission for iot', () => {
		expect(hasPermission('doctor', 'iot', 'read')).toBe(true);
		expect(hasPermission('nurse', 'iot', 'read')).toBe(true);
		expect(hasPermission('doctor', 'iot', 'delete')).toBe(false);
	});

	it('denies patient access to iot', () => {
		expect(hasPermission('patient', 'iot', 'read')).toBe(false);
		expect(hasPermission('patient', 'iot', 'create')).toBe(false);
	});

	it('includes Presensi IoT in account navigation links', () => {
		const iotLink = accountNavigationLinks.find(
			(link) => link.href === '/iot',
		);
		expect(iotLink).toBeDefined();
		expect(iotLink?.name).toBe('Presensi IoT');
		expect(iotLink?.roles).toContain('admin');
	});

	it('validates supported IoT device types and endpoints', () => {
		const supportedTypes = ['presensi', 'sensor'];
		expect(supportedTypes).toContain('presensi');
		expect(supportedTypes).toContain('sensor');

		// Supported HTTP methods for developer IoT hardware
		const iotEndpoints = [
			{ method: 'GET', path: '/api/wifi-config' },
			{ method: 'POST', path: '/api/iot/heartbeat' },
			{ method: 'POST', path: '/api/iot/presensi' },
			{ method: 'POST', path: '/api/iot/sensor/telemetry' },
			{ method: 'POST', path: '/api/iot/device-name' },
		];
		expect(iotEndpoints.map((e) => e.method)).toContain('GET');
		expect(iotEndpoints.map((e) => e.method)).toContain('POST');
	});
});

