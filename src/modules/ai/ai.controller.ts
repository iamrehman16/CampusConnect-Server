import { Body, Controller, Delete, Post, Req } from '@nestjs/common';
import { ChatMessageDto } from './dto/chat-message.dto';
import { AiChatService } from './services/ai-chat.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  async chat(@Req() req, @Body() chatMessageDto: ChatMessageDto) {
    const answer = await this.aiChatService.getChatResponse(
      req.user.id,
      chatMessageDto.message,
    );
    return answer;
  }

  @Delete('chat/session')
  async clearSession(@Req() req) {
    await this.aiChatService.clearSession(req.user.id);
    return { message: 'Session cleared' };
  }
}
