export const dashboardRoutes = [
	{
		label: 'Dashboard',
		icon: 'lucide:layout-dashboard',
		link: '/dashboard',
		color: 'text-sky-500',
	},

	{
		label: 'Pasien',
		icon: 'lucide:users',
		color: 'text-pink-700',
		link: '/pasien',
	},
	{
		label: 'Doctor',
		icon: 'lucide:accessibility',
		color: 'text-orange-700',
		link: '/doctor',
	},
	{
		label: 'Obat',
		icon: 'lucide:orbit',
		color: 'text-emerald-500',
		link: '/obat',
	},
	{
		label: 'Rekam Medis',
		icon: 'lucide:clipboard',
		color: 'text-amber-700',
		link: '/rekam-medis',
	},
	{
		label: 'Message',
		icon: 'lucide:message-square',
		link: '/conversation',
		color: 'text-violet-500',
	},
	{
		label: 'Settings',
		icon: 'lucide:settings',
		link: '/settings',
	},
];

export const accountNavigationLinks = [
	{
		name: 'Dashboard',
		href: '/dashboard',
		icon: 'lucide:layout-dashboard',
		roles: ['patient'],
	},
	{
		name: 'Dashboard Admin',
		href: '/admin',
		icon: 'lucide:layout-dashboard',
		roles: ['admin'],
	},
	{
		name: 'Rekam Medis',
		href: '/patient-record',
		icon: 'heroicons:clipboard-document-list',
		// icon: "heroicons:folder",
		roles: ['admin', 'doctor', 'nurse', 'receptionist', 'billing'],
	},

	{
		name: 'Doctor',
		href: '/doctor',
		icon: 'heroicons:users',
		roles: ['admin', 'doctor', 'nurse', 'receptionist', 'billing'],
	},

	{
		name: 'Pasien',
		href: '/patient-record/list-patient',
		icon: 'heroicons:user-group',
		roles: ['admin', 'doctor', 'nurse', 'receptionist', 'billing'],
	},
	{
		name: 'Grafik Pasien',
		href: '/patient-record/medical-chart',
		icon: 'heroicons:chart-pie',
		roles: ['admin', 'doctor', 'nurse', 'receptionist', 'billing'],
	},
	{
		name: 'Billing',
		href: '/patient-record/billing',
		icon: 'heroicons:credit-card',
		roles: ['admin', 'billing', 'receptionist', 'patient'],
	},
	{
		name: 'Appointment',
		href: '/patient-record/appointment',
		icon: 'heroicons:calendar',
		roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'],
	},
	{
		name: 'Export Data',
		href: '/patient-record/exportData',
		icon: 'heroicons:archive-box-solid',
		roles: ['admin'],
	},
	{
		name: 'Map',
		href: '/map',
		icon: 'heroicons:calendar',
		roles: ['admin', 'doctor', 'nurse', 'receptionist'],
	},
	{
		name: 'Map 3D IHC',
		href: '/admin/map-3d',
		icon: 'heroicons:map',
		roles: ['admin'],
	},
	{
		name: 'Email Blast',
		href: '/admin/email-blast',
		icon: 'heroicons:paper-airplane',
		roles: ['admin'],
	},
	// {
	//   name: "Account",
	//   href: "/patient-record/account/[id]",
	//   icon: "heroicons:cog-6-tooth",
	// },
];

export function formatTanggal(tanggal: string) {
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	const formatter = new Intl.DateTimeFormat('id-ID', options); // Sesuaikan dengan kode bahasa atau zona waktu yang diinginkan
	return formatter.format(new Date(tanggal));
}
