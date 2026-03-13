import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports:[StorageModule],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule {}
