import { Body, Controller, Post } from '@nestjs/common';
import { AiChatService } from './services/ai-chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { Public } from '../auth/decorators/public.decorator';


@Public()
@Controller('ai')
export class AiController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  async chat(@Body() chatMessageDto: ChatMessageDto) {
    const answer = await this.aiChatService.getChatResponse(chatMessageDto.message);
    return { answer };
  }
}
