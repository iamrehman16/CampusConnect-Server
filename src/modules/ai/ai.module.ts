import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './ai.controller';
import { AiChatService } from './services/ai-chat.service';
import { GroqService } from './services/groq.service';
import { EmbeddingService } from './services/embedding.service';
import { VectorStoreService } from './services/vector-store.service';
import { DocumentParserService } from './services/document-parser.service';
import { ConversationService } from './services/conversation.service';
import aiConfig from './config/ai.config';
import { ConversationSession, ConversationSessionSchema } from './schema/conversation-session.schema';

@Module({
  imports: [
    ConfigModule.forFeature(aiConfig),
    MongooseModule.forFeature([
      { name: ConversationSession.name, schema: ConversationSessionSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [
    AiChatService,
    GroqService,
    EmbeddingService,
    VectorStoreService,
    DocumentParserService,
    ConversationService,
  ],
  exports: [AiChatService],
})
export class AiModule {}
