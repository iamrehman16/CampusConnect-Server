import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinarySDK } from 'cloudinary';

import { CloudinaryUploadResultDto } from './dto/cloudinary-upload-result';
import { CLOUDINARY_CONFIG_KEY } from './config/cloudinary.config';
import { inferCloudinaryResourceType } from '../resource/utils/file.utils';

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
      const resourceType = inferCloudinaryResourceType(file.mimetype);

      const originalName = file.originalname;
      const ext = originalName.split('.').pop()?.toLowerCase();
      const baseName = originalName.replace(/\.[^/.]+$/, '');

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
            filename_override: originalName,
            ...(resourceType === 'raw' && {
              public_id: `${baseName}_${Date.now()}.${ext}`,
            }),
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });

      const resolvedResourceType = (
        ['image', 'video', 'raw'].includes(result.resource_type)
          ? result.resource_type
          : 'raw'
      ) as 'image' | 'video' | 'raw';

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        resourceType: resolvedResourceType,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload file to Cloudinary',
      );
    }
  }
  generateDownloadUrl(secureUrl: string): string {
    if (!secureUrl?.includes('/upload/')) {
      throw new InternalServerErrorException('Invalid Cloudinary URL format');
    }
    return secureUrl.replace('/upload/', '/upload/fl_attachment/');
  }
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'raw',
  ): Promise<void> {
    try {
      await this.cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to delete file from Cloudinary',
      );
    }
  }
}
