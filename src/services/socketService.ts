import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.origins,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected');

    socket.on('join:room', (room: string) => {
      socket.join(room);
      logger.info({ socketId: socket.id, room }, 'Client joined room');
    });

    socket.on('leave:room', (room: string) => {
      socket.leave(room);
      logger.info({ socketId: socket.id, room }, 'Client left room');
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Client disconnected');
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export { io };
