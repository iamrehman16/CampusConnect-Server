// import { Injectable, Logger } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';
// import { IngestionService } from '../services/ingestion.service';
// import { Resource } from '../../resource/schemas/resource.schema';

// @Injectable()
// export class ResourceApprovedListener {
//   private readonly logger = new Logger(ResourceApprovedListener.name);

//   constructor(private readonly ingestionService: IngestionService) {}

//   @OnEvent('resource.approved', { async: true })
//   async handle(resource: Resource & { _id: any }): Promise<void> {
//     this.logger.log(`Event received: resource.approved for ${resource._id}`);
//     try {
//       await this.ingestionService.ingest(resource);
//     } catch (err) {
//       this.logger.error(`Ingestion failed for resource: ${resource._id}`, err);
//     }
//   }
// }
