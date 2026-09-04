import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getLabSocket(): Socket | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!socketInstance) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const socketUrl = isLocal ? 'http://localhost:5000' : window.location.origin;

    socketInstance = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.io] Connected successfully. ID:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[Socket.io] Connect error:', error.message);
    });
  }

  return socketInstance;
}
