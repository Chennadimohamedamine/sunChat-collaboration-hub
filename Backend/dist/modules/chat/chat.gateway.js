"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const jwt_1 = require("@nestjs/jwt");
const cookie = __importStar(require("cookie"));
const users_service_1 = require("../users/users.service");
let ChatGateway = class ChatGateway {
    chatService;
    jwtService;
    usersService;
    server;
    constructor(chatService, jwtService, usersService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    userSockets = new Map();
    onlineUsers = new Set();
    async handleConnection(client) {
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
            client.username = username;
            const existingUser = this.userSockets.get(payload.sub);
            if (existingUser) {
                existingUser.sockets.add(client);
            }
            else {
                this.userSockets.set(payload.sub, {
                    name: username,
                    sockets: new Set([client]),
                });
            }
            client.join(username);
            this.onlineUsers.add(payload.sub);
            const chatParticipants = await this.chatService.getAllChatsParticipants(payload.sub);
            for (const { conversationId } of chatParticipants) {
                client.join(conversationId);
            }
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
        }
        catch {
            client.emit('error', { message: 'Invalid authentication token' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (!client.userId)
            return;
        const user = this.userSockets.get(client.userId);
        if (!user)
            return;
        user.sockets.delete(client);
        if (user.sockets.size === 0) {
            this.userSockets.delete(client.userId);
            this.onlineUsers.delete(client.userId);
            this.notifyOffline(client.userId, client.username || user.name);
        }
    }
    async notifyOffline(userId, username) {
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
        }
        catch {
        }
    }
    handleJoinConversation(client, data) {
        const payload = Array.isArray(data) ? data[0] : data;
        const conversationId = payload?.conversationId;
        const room = conversationId;
        if (!room) {
            client.emit('error', { message: 'join_conversation: missing conversationId' });
            return;
        }
        client.join(room);
    }
    async handleNewChat(client, data) {
        const payload = Array.isArray(data) ? data[0] : data;
        const { targetUserId, targetUsername, conversation } = payload || {};
        if (!targetUsername || !conversation) {
            client.emit('error', { message: 'newChat payload incomplete' });
            return;
        }
        client.join(conversation.id);
        this.server.to(targetUsername).emit('new_chat', conversation);
    }
    handleSendMessage(client, data) {
        const payload = Array.isArray(data) ? data[0] : data;
        const conversationId = payload?.conversationId;
        const message = payload?.message;
        if (!conversationId || !message) {
            console.error('send_message payload incomplete:', data);
            return;
        }
        this.server.to(conversationId).emit('receive_message', {
            ...message,
            conversationId,
            timestamp: message.timestamp || new Date().toISOString(),
        });
    }
    handleTyping(client, data) {
        const payload = Array.isArray(data) ? data[0] : data;
        const { conversationId, userId, isTyping } = payload || {};
        if (!conversationId)
            return;
        this.server.to(conversationId).emit('user_typing', {
            conversationId,
            userId,
            isTyping,
        });
    }
    handleLeaveConversation(client, data) {
        const payload = Array.isArray(data) ? data[0] : data;
        const { conversationId, userId } = payload || {};
        if (conversationId) {
            client.leave(conversationId);
        }
    }
    sendToConversation(conversationId, event, data) {
        this.server.to(conversationId).emit(event, data);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('newChat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleNewChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveConversation", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: 'http://localhost:5173',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService,
        users_service_1.UsersService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map