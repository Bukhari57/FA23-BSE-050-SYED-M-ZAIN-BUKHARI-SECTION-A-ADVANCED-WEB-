import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket: Socket | null = null;

  connect(serverUrl: string, userId?: string): void {
    if (this.socket) {
      return;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      if (userId) {
        this.socket?.emit('join:user', userId);
      }
    });
  }

  on<T>(event: string, listener: (payload: T) => void): void {
    this.socket?.on(event, listener);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
