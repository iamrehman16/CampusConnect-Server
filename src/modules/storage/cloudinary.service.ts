import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinarySDK } from 'cloudinary';

import { CloudinaryUploadResultDto } from './dto/cloudinary-upload-result';
import { CLOUDINARY_CONFIG_KEY } from './config/cloudinary.config';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY_CONFIG_KEY)
    private readonly cloudinary: typeof cloudinarySDK,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<CloudinaryUploadResultDto> {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        resourceType: result.resource_type,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload file to Cloudinary',
      );
    }
  }

  generateDownloadUrl(secureUrl: string): string {
    return secureUrl.replace('/upload/', '/upload/fl_attachment/');
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await this.cloudinary.uploader.destroy(publicId);
    } catch {
      throw new InternalServerErrorException(
        'Failed to delete file from Cloudinary',
      );
    }
  }
}
