import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { ResourceAdminController } from './resource-admin.controller';
import { StorageModule } from '../storage/storage.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Resource, ResourceSchema } from './schemas/resource.schema';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    StorageModule,
    CommonModule,
    MongooseModule.forFeature([{ name: Resource.name, schema: ResourceSchema }]),
  ],
  controllers: [ResourceController, ResourceAdminController],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
