"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../users/users.service");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
let ChatService = class ChatService {
    conversationRepository;
    messageRepository;
    usersService;
    constructor(conversationRepository, messageRepository, usersService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.usersService = usersService;
    }
    async createConversation(userId, participantId) {
        if (userId === participantId) {
            throw new common_1.BadRequestException('Cannot create a conversation with yourself');
        }
        const [currentUser, participant] = await Promise.all([
            this.usersService.findById(userId),
            this.usersService.findById(participantId),
        ]);
        if (!currentUser || !participant) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingConversation = await this.conversationRepository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participantOne', 'participantOne')
            .innerJoin('conversation.participantTwo', 'participantTwo')
            .where('(participantOne.id = :userId AND participantTwo.id = :participantId) OR (participantOne.id = :participantId AND participantTwo.id = :userId)', { userId, participantId })
            .getOne();
        if (existingConversation) {
            return existingConversation;
        }
        return this.conversationRepository.save({
            participantOne: currentUser,
            participantTwo: participant,
        });
    }
    async listConversations(userId) {
        return this.conversationRepository
            .createQueryBuilder('conversation')
            .innerJoinAndSelect('conversation.participantOne', 'participantOne')
            .innerJoinAndSelect('conversation.participantTwo', 'participantTwo')
            .where('participantOne.id = :userId OR participantTwo.id = :userId', { userId })
            .orderBy('conversation.updatedAt', 'DESC')
            .getMany();
    }
    async listMessages(userId, conversationId) {
        const conversation = await this.validateConversationAccess(userId, conversationId);
        return this.messageRepository.find({
            where: { conversation: { id: conversation.id } },
            order: { createdAt: 'ASC' },
            relations: { conversation: true, sender: true },
        });
    }
    async sendMessage(userId, conversationId, content) {
        const conversation = await this.validateConversationAccess(userId, conversationId);
        const sender = await this.usersService.findById(userId);
        if (!sender) {
            throw new common_1.NotFoundException('User not found');
        }
        const message = await this.messageRepository.save({
            conversation,
            sender,
            content: content.trim(),
        });
        conversation.updatedAt = new Date();
        await this.conversationRepository.save(conversation);
        return message;
    }
    async getAllChatsParticipants(userId) {
        const conversations = await this.listConversations(userId);
        return conversations.map((conversation) => {
            const participant = conversation.participantOne.id === userId
                ? conversation.participantTwo
                : conversation.participantOne;
            return {
                conversationId: conversation.id,
                participant: {
                    id: participant.id,
                    username: participant.username,
                },
            };
        });
    }
    async validateConversationAccess(userId, conversationId) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: { participantOne: true, participantTwo: true },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.participantOne.id !== userId && conversation.participantTwo.id !== userId) {
            throw new common_1.ForbiddenException('You are not part of this conversation');
        }
        return conversation;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], ChatService);
//# sourceMappingURL=chat.service.js.map