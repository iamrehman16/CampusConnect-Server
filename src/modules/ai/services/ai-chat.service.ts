import { Injectable } from '@nestjs/common';
import { GroqService } from './groq.service';
import { ConversationService } from './conversation.service';
import { RetrievalService } from './retrieval.service';
import { Citation,ChatResponse } from '../interfaces/retrieved-context.interface';

@Injectable()
export class AiChatService {
  constructor(
    private readonly groqService: GroqService,
    private readonly conversationService: ConversationService,
    private readonly retrievalService: RetrievalService,
  ) {}

  async getChatResponse(
    userId: string,
    message: string,
  ): Promise<ChatResponse> {
    const [session, context] = await Promise.all([
      this.conversationService.getOrCreateSession(userId),
      this.retrievalService.retrieve(message),
    ]);

    const messages = this.groqService.buildMessages(
      session.summaryBuffer,
      session.recentMessages,
      message,
      context,
    );

    const answer = await this.groqService.generateResponse(messages);

    await this.conversationService.appendMessages(
      userId,
      message,
      answer,
      this.groqService.summarize.bind(this.groqService),
    );

    const citations: Citation[] = context.map((c) => ({
      title: c.title,
      pageNumber: c.pageNumber,
      semester: c.semester,
      course: c.course,
      resourceId: c.resourceId,
    }));

    return {answer, citations };
  }
  async clearSession(userId: string): Promise<void> {
    await this.conversationService.clearSession(userId);
  }
}
