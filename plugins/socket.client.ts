export default defineNuxtPlugin(() => {
  const { status, data: session } = useAuth();
  const { connect, disconnect } = useSocket();

  watch(() => status.value, (newStatus) => {
    if (newStatus === 'authenticated' && session.value?.user) {
      const user = session.value.user as any;
      connect(
        { userId: user._id || user.id, role: user.role, token: session.value?.accessToken as string },
        {}
      );
    } else {
      disconnect();
    }
  }, { immediate: true });
});
