import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createConversation(req: {
        user: {
            id: string;
        };
    }, dto: CreateConversationDto): Promise<import("./entities/conversation.entity").Conversation>;
    listConversations(req: {
        user: {
            id: string;
        };
    }): Promise<import("./entities/conversation.entity").Conversation[]>;
    listMessages(req: {
        user: {
            id: string;
        };
    }, conversationId: string): Promise<import("./entities/message.entity").Message[]>;
    sendMessage(req: {
        user: {
            id: string;
        };
    }, conversationId: string, dto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
}
