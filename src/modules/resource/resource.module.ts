import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { StorageModule } from '../storage/storage.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Resource, ResourceSchema } from './schemas/resource.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Resource.name,
        schema: ResourceSchema,
      },
    ]),
    StorageModule,
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule {}
