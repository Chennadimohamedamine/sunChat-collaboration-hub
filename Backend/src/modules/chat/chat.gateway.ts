import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';
import { UsersService } from '../users/users.service';

interface AuthSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private userSockets = new Map<string, {
    name: string;
    sockets: Set<Socket>;
  }>();
  private onlineUsers = new Set<string>();

  async handleConnection(client: AuthSocket) {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie || '');
      const token = cookies['accessToken'] || client.handshake.auth?.token;

      if (!token) {
        client.emit('error', { message: 'Authentication token missing' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.userId = payload.sub;

      const username = await this.usersService.getUserNameById(payload.sub);
      if (!username) {
        client.emit('error', { message: 'User not found' });
        client.disconnect();
        return;
      }

      // Store username on socket so handleDisconnect can use it
      client.username = username;

      const existingUser = this.userSockets.get(payload.sub);
      if (existingUser) {
        existingUser.sockets.add(client);
      } else {
        this.userSockets.set(payload.sub, {
          name: username,
          sockets: new Set([client]),
        });
      }

      // Join own username room (for direct user targeting)
      client.join(username);
      this.onlineUsers.add(payload.sub);

      const chatParticipants = await this.chatService.getAllChatsParticipants(payload.sub);

      // FIX: also join all conversation rooms on connect
      // so the user receives messages even before they click into a conversation
      for (const { conversationId } of chatParticipants) {
        client.join(conversationId);
      }

      // Notify online participants that this user came online
      for (const { participant } of chatParticipants) {
        const participantSockets = this.userSockets.get(participant.id)?.sockets;
        if (participantSockets) {
          participantSockets.forEach(socket => {
            socket.emit('user_online', {
              userId: payload.sub,
              username,
            });
          });
        }
      }

      const onlineParticipants = chatParticipants
        .filter(({ participant }) => this.onlineUsers.has(participant.id))
        .map(({ participant }) => participant.id);

      client.emit('authenticated', {
        userId: payload.sub,
        username,
        onlineUsers: onlineParticipants,
        chatParticipants,
      });
    } catch {
      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (!client.userId) return;

    const user = this.userSockets.get(client.userId);
    if (!user) return;

    user.sockets.delete(client);

    // Only mark offline when ALL sockets for this user are gone
    if (user.sockets.size === 0) {
      this.userSockets.delete(client.userId);
      this.onlineUsers.delete(client.userId);

      // FIX: emit user_offline to all participants so frontend updates presence
      this.notifyOffline(client.userId, client.username || user.name);
    }
  }

  private async notifyOffline(userId: string, username: string) {
    try {
      const chatParticipants = await this.chatService.getAllChatsParticipants(userId);
      for (const { participant } of chatParticipants) {
        const participantSockets = this.userSockets.get(participant.id)?.sockets;
        if (participantSockets) {
          participantSockets.forEach(socket => {
            socket.emit('user_offline', { userId, username });
          });
        }
      }
    } catch {
      // user already disconnected, best effort
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; roomName: string } | any,
  ) {
    const payload = Array.isArray(data) ? data[0] : data;
    const conversationId = payload?.conversationId;
    // FIX: always join conversationId as the room name
    // (roomName was previously username which is wrong for message routing)
    const room = conversationId;

    if (!room) {
      client.emit('error', { message: 'join_conversation: missing conversationId' });
      return;
    }

    client.join(room);

  }

  @SubscribeMessage('newChat')
  async handleNewChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string; targetUsername: string; conversation: any } | any,
  ) {
    const payload = Array.isArray(data) ? data[0] : data;
    const { targetUserId, targetUsername, conversation } = payload || {};

    if (!targetUsername || !conversation) {
      client.emit('error', { message: 'newChat payload incomplete' });
      return;
    }

    // 1. Automatically make the creator's socket join this new conversation room
    client.join(conversation.id);
  

    // 2. Send the entire conversation payload directly to the recipient's personal room
    this.server.to(targetUsername).emit('new_chat', conversation);
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; message: any } | any,
  ) {
    const payload = Array.isArray(data) ? data[0] : data;
    const conversationId = payload?.conversationId;
    const message = payload?.message;

    if (!conversationId || !message) {
      console.error('send_message payload incomplete:', data);
      return;
    }

    // Broadcast to conversationId room — all clients who joined it receive this
    this.server.to(conversationId).emit('receive_message', {
      ...message,
      conversationId,
      timestamp: message.timestamp || new Date().toISOString(),
    });

  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string; isTyping: boolean } | any,
  ) {
    const payload = Array.isArray(data) ? data[0] : data;
    const { conversationId, userId, isTyping } = payload || {};

    if (!conversationId) return;

    this.server.to(conversationId).emit('user_typing', {
      conversationId,
      userId,
      isTyping,
    });
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string } | any,
  ) {
    const payload = Array.isArray(data) ? data[0] : data;
    const { conversationId, userId } = payload || {};

    if (conversationId) {
      client.leave(conversationId);

    }
  }

  sendToConversation(conversationId: string, event: string, data: any) {
    this.server.to(conversationId).emit(event, data);
  }
}