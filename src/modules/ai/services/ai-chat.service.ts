import { Injectable } from '@nestjs/common';
import { GroqService } from './groq.service';

@Injectable()
export class AiChatService {
  constructor(private readonly groqService: GroqService) {}

  async getChatResponse(message: string): Promise<string> {
    // For now, this is a simple pass-through to Groq
    return this.groqService.generateResponse(message);
  }
}
