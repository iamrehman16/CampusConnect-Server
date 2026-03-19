import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Groq } from 'groq-sdk';
import aiConfig from '../config/ai.config';

@Injectable()
export class GroqService {
  private readonly groq: Groq;

  constructor(
    @Inject(aiConfig.KEY) private aiCfg: ConfigType<typeof aiConfig>,
  ) {
    this.groq = new Groq({
      apiKey: this.aiCfg.groqApiKey,
    });
  }

  async generateResponse(query: string): Promise<string> {
    const response = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are CampusConnect AI, a helpful academic assistant for university students. Answer clearly and concisely.',
        },
        { role: 'user', content: query },
      ],
      model: this.aiCfg.models.reasoning,
    });
    return response.choices[0]?.message?.content || '';
  }
  async summarize(content: string): Promise<string> {
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Summarize the following content briefly.',
        },
        {
          role: 'user',
          content,
        },
      ],
      model: this.aiCfg.models.fast,
    });

    return completion.choices[0]?.message?.content || '';
  }
}
