import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Groq from 'groq-sdk';
import aiConfig from '../config/ai.config';
import { ChatMessage } from '../interfaces/conversation.interface';

const SYSTEM_PROMPT = `You are CampusConnect AI, a helpful academic assistant for university students. 
Answer clearly and concisely. If you don't know something, say so honestly.`;

@Injectable()
export class GroqService {
  private readonly groq: Groq;

  constructor(
    @Inject(aiConfig.KEY) private aiCfg: ConfigType<typeof aiConfig>,
  ) {
    this.groq = new Groq({ apiKey: this.aiCfg.groqApiKey });
  }

  buildMessages(
    summaryBuffer: string,
    recentMessages: ChatMessage[],
    userQuery: string,
  ): Groq.Chat.ChatCompletionMessageParam[] {
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [];

    messages.push({ role: 'system', content: SYSTEM_PROMPT });

    if (summaryBuffer) {
      messages.push({
        role: 'system',
        content: `Previous conversation summary:\n${summaryBuffer}`,
      });
    }

    messages.push(
      ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
    );

    messages.push({ role: 'user', content: userQuery });

    return messages;
  }

  async generateResponse(
    messages: Groq.Chat.ChatCompletionMessageParam[],
  ): Promise<string> {
    const response = await this.groq.chat.completions.create({
      messages,
      model: this.aiCfg.models.reasoning,
    });
    return response.choices[0]?.message?.content || '';
  }

  async summarize(content: string): Promise<string> {
    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a concise summarizer.' },
        { role: 'user', content },
      ],
      model: this.aiCfg.models.fast,
    });
    return completion.choices[0]?.message?.content || '';
  }
}
