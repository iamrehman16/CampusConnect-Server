import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinarySDK } from 'cloudinary';

import { CloudinaryUploadResultDto } from './dto/cloudinary-upload-result';
import { CLOUDINARY_CONFIG_KEY } from './config/cloudinary.config';
import { inferCloudinaryResourceType } from '../resource/utils/file.utils';
import {ConfigType } from '@nestjs/config';
import resourceConfig from './config/cloudinary.config'

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY_CONFIG_KEY)
    private readonly cloudinary: typeof cloudinarySDK,
    @Inject(resourceConfig.KEY)
    private resourceCfg: ConfigType<typeof resourceConfig>,
  ) {}


  generateSignature(paramsToSign: Record<string, string | number>): string {
    return this.cloudinary.utils.api_sign_request(
      paramsToSign,
      this.resourceCfg.apiSecret,
    );
  }
  generateDownloadUrl(secureUrl: string): string {
    if (!secureUrl?.includes('/upload/')) {
      throw new InternalServerErrorException('Invalid Cloudinary URL format');
    }
    return secureUrl.replace('/upload/', '/upload/fl_attachment/');
  }
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' = 'raw',
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
