import { Server } from 'socket.io';
import { env } from '../config/env.js';
let io = null;
export const initSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin: env.clientUrl,
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        socket.on('join:user', (userId) => {
            socket.join(`user:${userId}`);
        });
        socket.on('disconnect', () => {
            // keep room cleanup default behavior
        });
    });
    return io;
};
export const emitToUser = (userId, event, payload) => {
    io?.to(`user:${userId}`).emit(event, payload);
};
