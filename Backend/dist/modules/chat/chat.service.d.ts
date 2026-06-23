import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
export declare class ChatService {
    private readonly conversationRepository;
    private readonly messageRepository;
    private readonly usersService;
    constructor(conversationRepository: Repository<Conversation>, messageRepository: Repository<Message>, usersService: UsersService);
    createConversation(userId: string, participantId: string): Promise<Conversation>;
    listConversations(userId: string): Promise<Conversation[]>;
    listMessages(userId: string, conversationId: string): Promise<Message[]>;
    sendMessage(userId: string, conversationId: string, content: string): Promise<Message>;
    getAllChatsParticipants(userId: string): Promise<{
        conversationId: string;
        participant: {
            id: string;
            username: string;
        };
    }[]>;
    private validateConversationAccess;
}
