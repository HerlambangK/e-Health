export function useSidebar() {
	// Persist sidebar collapsed state in cookie across page navigations & refreshes
	const isCollapsed = useCookie<boolean>('ehealth_sidebar_collapsed', {
		default: () => false,
		sameSite: 'lax',
		path: '/',
	});

	function toggleSidebar() {
		isCollapsed.value = !isCollapsed.value;
	}

	function setSidebar(value: boolean) {
		isCollapsed.value = value;
	}

	return {
		isCollapsed,
		toggleSidebar,
		setSidebar,
	};
}
