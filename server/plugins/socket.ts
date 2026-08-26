import { Server as SocketIO } from 'socket.io';

export default defineNitroPlugin((nitroApp) => {
  const io = new SocketIO();

  // Store io instance globally for access from API handlers
  (globalThis as any).__io = io;

  // Attach to the underlying HTTP server
  nitroApp.hooks.hook('request', (event) => {
    if (!(globalThis as any).__ioAttached && event.node.req.socket?.server) {
      io.attach(event.node.req.socket.server as any);
      (globalThis as any).__ioAttached = true;
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    const role = socket.handshake.auth?.role;
    const poliId = socket.handshake.query?.poliId;

    // Join personal room
    if (userId) socket.join(`user:${userId}`);
    // Join role room
    if (role) socket.join(`role:${role}`);
    // Join poli room (for queue displays)
    if (poliId) socket.join(`poli:${poliId}`);

    socket.on('join-poli', (id: string) => socket.join(`poli:${id}`));
    socket.on('leave-poli', (id: string) => socket.leave(`poli:${id}`));

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User ${userId || 'unknown'} disconnected`);
    });
  });

  console.log('[Socket.IO] Server initialized');
});
