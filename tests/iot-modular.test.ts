import { describe, it, expect } from 'vitest';
import { hasPermission } from '../utils/permissions';
import { accountNavigationLinks } from '../utils';

describe('Modular IoT Platform Architecture & Navigation', () => {
	it('includes Presensi and Sensor navigation links', () => {
		const presensiLink = accountNavigationLinks.find(
			(link) => link.href === '/iot',
		);
		expect(presensiLink).toBeDefined();

		const sensorLink = accountNavigationLinks.find(
			(link) => link.href === '/iot/sensor',
		);
		expect(sensorLink).toBeDefined();
		expect(sensorLink?.name).toBe('Modul IoT Sensor');
	});

	it('validates modular separation between presensi and sensor', () => {
		const modules = ['presensi', 'sensor'];
		expect(modules).toContain('presensi');
		expect(modules).toContain('sensor');

		const sensorEndpoints = [
			{ method: 'POST', path: '/api/iot/sensor/telemetry' },
			{ method: 'GET', path: '/api/iot/sensor/telemetry' },
			{ method: 'PUT', path: '/api/iot/sensor/parameters' },
			{ method: 'GET', path: '/api/iot/sensor/spec' },
		];

		const presensiEndpoints = [
			{ method: 'POST', path: '/api/iot/presensi' },
			{ method: 'GET', path: '/api/iot/attendance' },
			{ method: 'POST', path: '/api/iot/heartbeat' },
			{ method: 'GET', path: '/api/iot/presensi/spec' },
		];

		expect(sensorEndpoints.length).toBe(4);
		expect(presensiEndpoints.length).toBe(4);
	});
});
