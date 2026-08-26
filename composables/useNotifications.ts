import { ref, readonly, onMounted, onUnmounted } from 'vue';
import { useSocket } from './useSocket';

export interface Notification {
	_id: string;
	type: string;
	title: string;
	message: string;
	data?: Record<string, any>;
	channel: string;
	isRead: boolean;
	createdAt: string;
}

export function useNotifications() {
	const notifications = ref<Notification[]>([]);
	const unreadCount = ref(0);
	const isLoading = ref(false);
	const { on, off } = useSocket();

	async function fetchUnreadCount() {
		try {
			const res = await $fetch<any>('/api/notifications/unread-count');
			if (res?.data !== undefined) {
				unreadCount.value =
					typeof res.data === 'number' ? res.data : (res.data?.count ?? 0);
			}
		} catch (e) {
			console.error('[Notifications] Failed to fetch unread count:', e);
		}
	}

	async function fetchNotifications(page = 1, pageSize = 20) {
		isLoading.value = true;
		try {
			const res = await $fetch<any>(
				`/api/notifications?page=${page}&pageSize=${pageSize}`,
			);
			if (Array.isArray(res?.data)) {
				notifications.value = res.data;
			} else if (Array.isArray(res?.data?.items)) {
				notifications.value = res.data.items;
			}
		} catch (e) {
			console.error('[Notifications] Failed to fetch:', e);
		} finally {
			isLoading.value = false;
		}
	}

	async function markAsRead(id: string) {
		try {
			await $fetch(`/api/notifications/${id}`, {
				method: 'PUT',
				body: { isRead: true },
			});
			const notif = notifications.value.find((n) => n._id === id);
			if (notif) notif.isRead = true;
			unreadCount.value = Math.max(0, unreadCount.value - 1);
		} catch (e) {
			console.error('[Notifications] Failed to mark as read:', e);
		}
	}

	async function markAllAsRead() {
		try {
			await $fetch('/api/notifications/read-all', { method: 'POST' });
			notifications.value.forEach((n) => (n.isRead = true));
			unreadCount.value = 0;
		} catch (e) {
			console.error('[Notifications] Failed to mark all as read:', e);
		}
	}

	function handleNewNotification(notif: Notification) {
		notifications.value.unshift(notif);
		unreadCount.value++;
		// Keep max 50 in memory
		if (notifications.value.length > 50) notifications.value.pop();
	}

	onMounted(() => {
		fetchUnreadCount();
		fetchNotifications();
		on('notification', handleNewNotification);
	});

	onUnmounted(() => {
		off('notification', handleNewNotification);
	});

	return {
		notifications: readonly(notifications),
		unreadCount: readonly(unreadCount),
		isLoading: readonly(isLoading),
		fetchNotifications,
		fetchUnreadCount,
		markAsRead,
		markAllAsRead,
	};
}
