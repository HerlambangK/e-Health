export const useOffline = () => {
  const isOnline = ref(true);

  function updateOnlineStatus() {
    isOnline.value = navigator.onLine;
  }

  onMounted(() => {
    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
  });

  onUnmounted(() => {
    window.removeEventListener("online", updateOnlineStatus);
    window.removeEventListener("offline", updateOnlineStatus);
  });

  return { isOnline };
};
