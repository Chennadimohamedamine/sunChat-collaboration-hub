import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
interface AuthSocket extends Socket {
    userId?: string;
    username?: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly jwtService;
    private readonly usersService;
    server: Server;
    constructor(chatService: ChatService, jwtService: JwtService, usersService: UsersService);
    private userSockets;
    private onlineUsers;
    handleConnection(client: AuthSocket): Promise<void>;
    handleDisconnect(client: AuthSocket): void;
    private notifyOffline;
    handleJoinConversation(client: Socket, data: {
        conversationId: string;
        roomName: string;
    } | any): void;
    handleNewChat(client: Socket, data: {
        targetUserId: string;
        targetUsername: string;
        conversation: any;
    } | any): Promise<void>;
    handleSendMessage(client: Socket, data: {
        conversationId: string;
        message: any;
    } | any): void;
    handleTyping(client: Socket, data: {
        conversationId: string;
        userId: string;
        isTyping: boolean;
    } | any): void;
    handleLeaveConversation(client: Socket, data: {
        conversationId: string;
        userId: string;
    } | any): void;
    sendToConversation(conversationId: string, event: string, data: any): void;
}
export {};
