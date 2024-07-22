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
		name: 'Dashboard Admin',
		href: '/admin',
		icon: 'lucide:layout-dashboard',
		isAdmin: false,
	},
	{
		name: 'Rekam Medis',
		href: '/patient-record',
		icon: 'heroicons:clipboard-document-list',
		// icon: "heroicons:folder",
		isAdmin: false,
	},

	{
		name: 'Doctor',
		href: '/doctor',
		icon: 'heroicons:users',
	},

	{
		name: 'Pasien',
		href: '/patient-record/list-patient',
		icon: 'heroicons:user-group',
	},
	{
		name: 'Grafik Pasien',
		href: '/patient-record/medical-chart',
		icon: 'heroicons:chart-pie',
	},
	{
		name: 'Billing',
		href: '/patient-record/billing',
		icon: 'heroicons:credit-card',
	},
	{
		name: 'Appoitment',
		href: '/patient-record/appoitment',
		icon: 'heroicons:calendar',
	},
	{
		name: 'Export Data',
		href: '/patient-record/exportData',
		icon: 'heroicons:archive-box-solid',
	},
	{
		name: 'Map',
		href: '/map',
		icon: 'heroicons:calendar',
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
