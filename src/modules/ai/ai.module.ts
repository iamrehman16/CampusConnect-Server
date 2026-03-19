import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiChatService } from './services/ai-chat.service';
import { GroqService } from './services/groq.service';
import { EmbeddingService } from './services/embedding.service';
import { VectorStoreService } from './services/vector-store.service';
import { DocumentParserService } from './services/document-parser.service';

@Module({
  controllers: [AiController],
  providers: [
    AiChatService,
    GroqService,
    EmbeddingService,
    VectorStoreService,
    DocumentParserService,
  ],
  exports: [AiChatService],
})
export class AiModule {}
