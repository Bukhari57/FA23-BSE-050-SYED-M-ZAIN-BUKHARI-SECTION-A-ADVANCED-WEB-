import { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';

let io: Server | null = null;

export const initSocketServer = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      // keep room cleanup default behavior
    });
  });

  return io;
};

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  io?.to(`user:${userId}`).emit(event, payload);
};
