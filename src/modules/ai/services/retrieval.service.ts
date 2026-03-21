import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { RetrievedContext } from '../interfaces/retrieved-context.interface';

@Injectable()
export class RetrievalService {
  private readonly SCORE_THRESHOLD = 0.75;
  private readonly TOP_K = 5;

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  async retrieve(query: string): Promise<RetrievedContext[]> {
    const vector = await this.embeddingService.embedQuery(query);

    const results = await this.vectorStoreService.search(
      vector,
      {},
      this.TOP_K,
    );

    return results
      .filter((r) => r.score >= this.SCORE_THRESHOLD)
      .map((r) => ({
        text: r.payload.text,
        pageNumber: r.payload.pageNumber,
        title: r.payload.title,
        resourceId: r.payload.resourceId,
        semester: r.payload.semester,
        course: r.payload.course,
        score: r.score,
      }));
  }
}
