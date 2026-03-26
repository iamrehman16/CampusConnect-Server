import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { StartConversationDto } from './dto/start-conversation.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { CurrentUser } from '../auth/types/current-user';

@Controller('conversations')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  findOrCreate(
    @Req() req: { user: CurrentUser },
    @Body() dto: StartConversationDto,
  ) {
    return this.chatService.findOrCreateConversation(req.user.id, dto);
  }

  @Get()
  getMyConversations(@Req() req: { user: CurrentUser }) {
    return this.chatService.getUserConversations(req.user.id);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') conversationId: string,
    @Req() req: { user: CurrentUser },
    @Query() dto: BaseQueryDto,
  ) {
    return this.chatService.getMessages(conversationId, req.user.id, dto);
  }
}
