import { Injectable, Logger } from '@nestjs/common';
import { DocumentParserService } from './document-parser.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { Resource } from '../../resource/schemas/resource.schema';
import { createHash } from 'crypto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly documentParserService: DocumentParserService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  async ingest(resource: Resource & { _id: any }): Promise<void> {
    const resourceId = resource._id.toString();
    const pointId = this.toUuid(resourceId); // ← convert here

    this.logger.log(`Starting ingestion for resource: ${resourceId}`);

    const text = await this.documentParserService.parse(
      resource.fileUrl,
      resourceId,
    );

    if (!text.trim()) {
      this.logger.warn(
        `Skipping ingestion for resource: ${resourceId} — empty parse result`,
      );
      return;
    }

    const vector = await this.embeddingService.embed(text);

    await this.vectorStoreService.upsert(pointId, vector, {
      resourceId, // ← store original MongoDB id in payload for retrieval later
      title: resource.title,
      subject: resource.subject,
      course: resource.course,
      semester: resource.semester,
      resourceType: resource.resourceType,
      fileType: resource.fileType,
    });

    this.logger.log(`Ingestion complete for resource: ${resourceId}`);
  }
  private toUuid(mongoId: string): string {
    const hash = createHash('md5').update(mongoId).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  }
}
