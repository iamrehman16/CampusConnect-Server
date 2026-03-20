import { Injectable } from '@nestjs/common';
import { GroqService } from './groq.service';
import { ConversationService } from './conversation.service';

@Injectable()
export class AiChatService {
  constructor(
    private readonly groqService: GroqService,
    private readonly conversationService: ConversationService,
  ) {}

  async getChatResponse(userId: string, message: string): Promise<string> {
    const session = await this.conversationService.getOrCreateSession(userId);

    const messages = this.groqService.buildMessages(
      session.summaryBuffer,
      session.recentMessages,
      message,
    );

    const answer = await this.groqService.generateResponse(messages);

    await this.conversationService.appendMessages(
      userId,
      message,
      answer,
      this.groqService.summarize.bind(this.groqService),
    );

    return answer;
  }

  async clearSession(userId: string): Promise<void> {
    await this.conversationService.clearSession(userId);
  }
}
