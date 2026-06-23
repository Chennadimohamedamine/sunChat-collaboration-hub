import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createConversation(
    @Req() req: { user: { id: string } },
    @Body() dto: CreateConversationDto,
  ) {
  
    return this.chatService.createConversation(req.user.id, dto.participantId);
  }

  @Get()
  listConversations(@Req() req: { user: { id: string } }) {
    return this.chatService.listConversations(req.user.id);
  }

  @Get(':id/messages')
  listMessages(
    @Req() req: { user: { id: string } },
    @Param('id') conversationId: string,
  ) {
    return this.chatService.listMessages(req.user.id, conversationId);
  }

  @Post(':id/messages')
  sendMessage(
    @Req() req: { user: { id: string } },
    @Param('id') conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.id, conversationId, dto.content);
  }
}
