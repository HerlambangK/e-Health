export interface ClientInfo {
	ip: string;
	browser: string;
	os: string;
	device: string;
	location: string;
	userAgent: string;
}

export function parseUserAgent(ua: string): {
	browser: string;
	os: string;
	device: string;
} {
	if (!ua || typeof ua !== 'string') {
		return {
			browser: 'Unknown Browser',
			os: 'Unknown OS',
			device: 'Unknown Device',
		};
	}

	// Detect OS
	let os = 'Unknown OS';
	if (/windows nt 10\.0/i.test(ua)) os = 'Windows 10 / 11';
	else if (/windows nt 6\.3/i.test(ua)) os = 'Windows 8.1';
	else if (/windows nt 6\.2/i.test(ua)) os = 'Windows 8';
	else if (/windows nt 6\.1/i.test(ua)) os = 'Windows 7';
	else if (/windows/i.test(ua)) os = 'Windows';
	else if (/macintosh|mac os x/i.test(ua)) {
		const match = ua.match(/mac os x (\d+[._]\d+[._]?\d*)/i);
		os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS (Apple)';
	} else if (/iphone/i.test(ua)) {
		const match = ua.match(/os (\d+[._]\d+)/i);
		os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS (iPhone)';
	} else if (/ipad/i.test(ua)) {
		os = 'iPadOS (iPad)';
	} else if (/android/i.test(ua)) {
		const match = ua.match(/android (\d+(\.\d+)?)/i);
		os = match ? `Android ${match[1]}` : 'Android';
	} else if (/linux/i.test(ua)) {
		os = 'Linux';
	}

	// Detect Device Type
	let device = 'Desktop PC / Laptop';
	if (
		/mobile/i.test(ua) ||
		/iphone/i.test(ua) ||
		(/android/i.test(ua) && !/tablet/i.test(ua))
	) {
		device = /iphone/i.test(ua)
			? 'Apple iPhone (Smartphone)'
			: 'Android Smartphone';
	} else if (/ipad|tablet/i.test(ua)) {
		device = 'Tablet Device';
	} else if (/macintosh/i.test(ua)) {
		device = 'Apple Mac (Desktop/MacBook)';
	} else if (/windows/i.test(ua)) {
		device = 'Windows PC (Desktop/Laptop)';
	}

	// Detect Browser
	let browser = 'Unknown Browser';
	if (/edg\//i.test(ua)) {
		const match = ua.match(/edg\/(\d+(\.\d+)?)/i);
		browser = `Microsoft Edge ${match ? match[1] : ''}`.trim();
	} else if (/opr\/|opera/i.test(ua)) {
		const match = ua.match(/(opr|opera)\/(\d+(\.\d+)?)/i);
		browser = `Opera ${match ? match[2] : ''}`.trim();
	} else if (
		/chrome|crios/i.test(ua) &&
		!/edg\//i.test(ua) &&
		!/opr\//i.test(ua)
	) {
		const match = ua.match(/(chrome|crios)\/(\d+(\.\d+)?)/i);
		browser = `Google Chrome ${match ? match[2] : ''}`.trim();
	} else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
		const match = ua.match(/version\/(\d+(\.\d+)?)/i);
		browser = `Apple Safari ${match ? match[1] : ''}`.trim();
	} else if (/firefox|fxios/i.test(ua)) {
		const match = ua.match(/(firefox|fxios)\/(\d+(\.\d+)?)/i);
		browser = `Mozilla Firefox ${match ? match[2] : ''}`.trim();
	} else if (/msie|trident/i.test(ua)) {
		browser = 'Internet Explorer';
	}

	return { browser, os, device };
}

export function detectLocationFromIp(
	ip: string,
	headers?: Record<string, any>,
): string {
	// If behind reverse proxy with geo headers (Cloudflare / Nginx GeoIP)
	if (headers) {
		const city =
			headers['cf-ipcity'] ||
			headers['x-vercel-ip-city'] ||
			headers['x-geo-city'];
		const country =
			headers['cf-ipcountry'] ||
			headers['x-vercel-ip-country'] ||
			headers['x-geo-country'];
		if (city && country) return `${city}, ${country}`;
		if (country) return `${country}`;
	}

	// Check for private / loopback IP ranges
	const cleanIp = ip.trim();
	if (
		cleanIp === '127.0.0.1' ||
		cleanIp === '::1' ||
		cleanIp === 'localhost' ||
		cleanIp.startsWith('192.168.') ||
		cleanIp.startsWith('10.') ||
		cleanIp.startsWith('172.16.') ||
		cleanIp.startsWith('172.17.') ||
		cleanIp.startsWith('172.18.') ||
		cleanIp.startsWith('172.19.') ||
		cleanIp.startsWith('172.20.') ||
		cleanIp.startsWith('172.21.') ||
		cleanIp.startsWith('172.22.') ||
		cleanIp.startsWith('172.23.') ||
		cleanIp.startsWith('172.24.') ||
		cleanIp.startsWith('172.25.') ||
		cleanIp.startsWith('172.26.') ||
		cleanIp.startsWith('172.27.') ||
		cleanIp.startsWith('172.28.') ||
		cleanIp.startsWith('172.29.') ||
		cleanIp.startsWith('172.30.') ||
		cleanIp.startsWith('172.31.')
	) {
		return 'Jakarta, Indonesia (Jaringan Lokal / Intranet SIMPRS)';
	}

	return `Indonesia (IP Publik: ${cleanIp})`;
}

export function extractClientInfo(req?: any): ClientInfo {
	let ip = '127.0.0.1';
	let ua = '';
	let headers: Record<string, any> = {};

	if (req?.headers) {
		headers = req.headers;
		const rawIp =
			req.headers['x-forwarded-for'] ||
			req.headers['x-real-ip'] ||
			req.headers['cf-connecting-ip'] ||
			req.headers['true-client-ip'];

		if (rawIp) {
			ip = String(rawIp).split(',')[0].trim();
		} else if (req.socket?.remoteAddress) {
			ip = req.socket.remoteAddress;
		}

		ua = req.headers['user-agent'] || '';
	}

	const { browser, os, device } = parseUserAgent(ua);
	const location = detectLocationFromIp(ip, headers);

	return {
		ip,
		browser,
		os,
		device: `${device} (${os})`,
		location,
		userAgent: ua || 'Unknown User Agent',
	};
}
