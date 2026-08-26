import { ref, readonly, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

const socket = ref<Socket | null>(null);
const isConnected = ref(false);

export function useSocket() {
  function connect(auth: { userId: string; role: string; token?: string }, query?: Record<string, string>) {
    if (socket.value?.connected) return;

    socket.value = io({
      auth,
      query,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
      console.log('[Socket.IO] Connected');
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
      console.log('[Socket.IO] Disconnected');
    });
  }

  function disconnect() {
    socket.value?.disconnect();
    socket.value = null;
    isConnected.value = false;
  }

  function on(event: string, handler: (...args: any[]) => void) {
    socket.value?.on(event, handler);
  }

  function off(event: string, handler?: (...args: any[]) => void) {
    socket.value?.off(event, handler);
  }

  function emit(event: string, ...args: any[]) {
    socket.value?.emit(event, ...args);
  }

  function joinPoli(poliId: string) {
    socket.value?.emit('join-poli', poliId);
  }

  function leavePoli(poliId: string) {
    socket.value?.emit('leave-poli', poliId);
  }

  return { 
    socket: readonly(socket), 
    isConnected: readonly(isConnected), 
    connect, 
    disconnect, 
    on, 
    off, 
    emit, 
    joinPoli, 
    leavePoli 
  };
}
