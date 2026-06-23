import { io, Socket } from 'socket.io-client';

type Listener = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Listener>> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    // If socket exists but disconnected, clean it up first
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      
      this.reattachListeners();
    });

    this.socket.on('disconnect', () => {
      
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('authenticated', () => {
      
    });
  }

  private reattachListeners(): void {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  emit(event: string, data: any, callback?: (response: any) => void): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data, callback);
    } else {
      console.warn('Cannot emit — socket not connected:', event);
    }
  }

  // Safe to call before connect() — queues the listener
  on(event: string, callback: Listener): void {
    // Track it regardless of connection state
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Attach immediately if already connected
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: Listener): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  once(event: string, callback: Listener): void {
    const wrapper: Listener = (data) => {
      callback(data);
      // Clean up from our tracking map too
      this.listeners.get(event)?.delete(wrapper);
    };

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(wrapper);

    if (this.socket) {
      this.socket.once(event, wrapper);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  newChat(targetUserId: string, targetUsername: string, conversation: any): void {
    if (!this.socket?.connected) {
      console.warn('Cannot emit newChat — socket not connected');
      return;
    }
    // Matches the @SubscribeMessage('newChat') on your backend gateway
    this.socket.emit('newChat', { targetUserId, targetUsername, conversation });
  }
  joinConversation(conversationId: string, roomName: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot emit join_conversation — socket not connected');
      return;
    }
    this.socket.emit('join_conversation', { conversationId, roomName });
  }
}

export const socketService = new SocketService();