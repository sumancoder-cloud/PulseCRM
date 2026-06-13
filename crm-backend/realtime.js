import { Server as SocketServer } from 'socket.io';

let io = null;

export function initRealtime(httpServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Realtime] Client connected: ${socket.id}`);
    socket.emit('system:connected', {
      message: 'PulseCRM real-time stream active',
      time: new Date().toISOString(),
    });

    socket.on('disconnect', () => {
      console.log(`[Realtime] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Realtime] WebSocket server ready');
  return io;
}

export function broadcast(event, data) {
  if (!io) return;
  io.emit(event, { ...data, timestamp: new Date().toISOString() });
}

export function broadcastActivity(type, message, meta = {}) {
  broadcast('activity', { type, message, ...meta });
}
