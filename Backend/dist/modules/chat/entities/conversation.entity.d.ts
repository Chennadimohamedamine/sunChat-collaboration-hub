import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';
export declare class Conversation {
    id: string;
    participantOne: User;
    participantTwo: User;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
