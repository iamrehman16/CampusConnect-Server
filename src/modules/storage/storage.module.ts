import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CLOUDINARY_CONFIG_KEY, configureCloudinary } from './config/cloudinary.config';

@Module({
  providers: [
    {
      provide:CLOUDINARY_CONFIG_KEY,
      useFactory:configureCloudinary,
    },
    CloudinaryService
  ],
  exports:[CloudinaryService]
})
export class StorageModule {}
