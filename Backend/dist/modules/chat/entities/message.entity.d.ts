import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';
export declare class Message {
    id: string;
    conversation: Conversation;
    sender: User;
    content: string;
    createdAt: Date;
}
