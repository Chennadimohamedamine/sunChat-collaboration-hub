import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly usersService: UsersService,
  ) {}

  async createConversation(userId: string, participantId: string): Promise<Conversation> {
    if (userId === participantId) {
      throw new BadRequestException('Cannot create a conversation with yourself');
    }

    const [currentUser, participant] = await Promise.all([
      this.usersService.findById(userId),
      this.usersService.findById(participantId),
    ]);

    if (!currentUser || !participant) {
      throw new NotFoundException('User not found');
    }

    const existingConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participantOne', 'participantOne')
      .innerJoin('conversation.participantTwo', 'participantTwo')
      .where(
        '(participantOne.id = :userId AND participantTwo.id = :participantId) OR (participantOne.id = :participantId AND participantTwo.id = :userId)',
        { userId, participantId },
      )
      .getOne();

    if (existingConversation) {
      return existingConversation;
    }


    return this.conversationRepository.save({
      participantOne: currentUser,
      participantTwo: participant,
    });
  }

  async listConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoinAndSelect('conversation.participantOne', 'participantOne')
      .innerJoinAndSelect('conversation.participantTwo', 'participantTwo')
      .where('participantOne.id = :userId OR participantTwo.id = :userId', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();
  }

  async listMessages(userId: string, conversationId: string): Promise<Message[]> {
    const conversation = await this.validateConversationAccess(userId, conversationId);

    return this.messageRepository.find({
      where: { conversation: { id: conversation.id } },
      order: { createdAt: 'ASC' },
      relations: { conversation: true, sender: true },
    });
  }

  async sendMessage(userId: string, conversationId: string, content: string): Promise<Message> {
    const conversation = await this.validateConversationAccess(userId, conversationId);
    const sender = await this.usersService.findById(userId);

    if (!sender) {
      throw new NotFoundException('User not found');
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

  async getAllChatsParticipants(userId: string): Promise<{ conversationId: string; participant: { id: string; username: string } }[]> {
    const conversations = await this.listConversations(userId);

    return conversations.map((conversation) => {
      const participant =
        conversation.participantOne.id === userId
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

  private async validateConversationAccess(userId: string, conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: { participantOne: true, participantTwo: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.participantOne.id !== userId && conversation.participantTwo.id !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return conversation;
  }
}
