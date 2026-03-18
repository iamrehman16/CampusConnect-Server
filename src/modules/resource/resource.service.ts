import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CloudinaryService } from '../storage/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { Model } from 'mongoose';
import { CreateResourceByContributorDto } from './dto/create-resource-contributor.dto';
import { UpdateResourceByContributorDto } from './dto/update-resource-contributor.dto';
import { FileType } from './enums/file-type.enum';
import { ApprovalStatus } from './enums/approval-status.enum';
import { ResourceQueryDto } from './dto/resource-query.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { buildResourceQuery } from './dto/queries/resource-query.builder';
import { buildResourceSort } from './dto/queries/build-resource-sort';

@Injectable()
export class ResourceService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
  ) {}

  async create(
    dto: CreateResourceByContributorDto,
    file: Express.Multer.File,
  ): Promise<ResourceDocument> {
    let uploadResult;
    try {
      uploadResult = await this.cloudinaryService.uploadFile(file);
      console.log(uploadResult);

    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to upload file to Cloudinary',
      );
    }

    const fileType = this.inferFileType(uploadResult.format, file.originalname);

    try {
      return await this.resourceModel.create({
        ...dto,
        fileUrl: uploadResult.url,
        cloudinaryPublicId: uploadResult.publicId,
        fileFormat: uploadResult.format,
        fileType,
        fileSize: uploadResult.bytes,
      });
    } catch (err) {
      if (uploadResult?.publicId) {
        await this.cloudinaryService
          .deleteFile(uploadResult.publicId)
          .catch(() => null);
      }
      throw new InternalServerErrorException(
        'Failed to save resource to database',
      );
    }
  }

  async findAll(
    queryDto: ResourceQueryDto,
  ): Promise<PaginatedResponse<ResourceDocument>> {
    const mongoQuery = buildResourceQuery(queryDto);
    const mongoSort = buildResourceSort(queryDto.sort);

    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 12;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.resourceModel
        .find(mongoQuery)
        .sort(mongoSort as any)
        .skip(skip)
        .limit(limit)
        .lean(),

      this.resourceModel.countDocuments(mongoQuery),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ResourceDocument> {
    const resource = await this.resourceModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  async update(
    id: string,
    dto: UpdateResourceByContributorDto,
  ): Promise<ResourceDocument> {
    const resource = await this.resourceModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      dto,
      { new: true },
    );
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  async updateOwn(
    id: string,
    dto: UpdateResourceByContributorDto,
    userId: string,
  ): Promise<ResourceDocument> {
    const resource = await this.resourceModel.findOneAndUpdate(
      {
        _id: id,
        uploadedBy: userId,
        isDeleted: false,
      },
      dto,
      { new: true, runValidators: true },
    );

    if (!resource) {
      throw new NotFoundException('Resource not found or you do not own it');
    }

    return resource;
  }

  async remove(id: string): Promise<{ message: string }> {
    const resource = await this.findOne(id);

    if (resource.cloudinaryPublicId) {
      await this.cloudinaryService
        .deleteFile(resource.cloudinaryPublicId)
        .catch(() => null);
    }

    await this.resourceModel.findByIdAndUpdate(id, { isDeleted: true });

    return { message: 'Resource deleted successfully' };
  }

  async getDownloadUrl(id: string): Promise<string> {
    const resource = await this.resourceModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { downloads: 1 } },
      { new: true },
    );
    if (!resource) throw new NotFoundException('Resource not found');

    return this.cloudinaryService.generateDownloadUrl(resource.fileUrl);
  }

  async approve(id: string): Promise<ResourceDocument> {
    const resource = await this.resourceModel.findOneAndUpdate(
      { _id: id, isDeleted: false, approvalStatus: ApprovalStatus.PENDING },
      { approvalStatus: ApprovalStatus.APPROVED },
      { new: true },
    );
    if (!resource)
      throw new NotFoundException('Resource not found or not pending approval');
    return resource;
  }

  async reject(id: string, reason: string): Promise<ResourceDocument> {
    const resource = await this.resourceModel.findOneAndUpdate(
      { _id: id, isDeleted: false, approvalStatus: ApprovalStatus.PENDING },
      { approvalStatus: ApprovalStatus.REJECTED, rejectionReason: reason },
      { new: true },
    );
    if (!resource)
      throw new NotFoundException('Resource not found or not pending approval');
    return resource;
  }

  async getStats() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [total, pending, pastWeek] = await Promise.all([
      this.resourceModel.countDocuments({ isDeleted: false }),
      this.resourceModel.countDocuments({
        approvalStatus: ApprovalStatus.PENDING,
        isDeleted: false,
      }),
      this.resourceModel.countDocuments({
        createdAt: { $gte: oneWeekAgo },
        isDeleted: false,
      }),
    ]);
    return { total, pending, uploadedPastWeek: pastWeek };
  }

  private inferFileType(format?: string, originalName?: string): FileType {
    const ext = originalName?.split('.').pop()?.toLowerCase() || '';
    const normalized = format?.toLowerCase() || ext;

    if (['pdf'].includes(normalized)) return FileType.PDF;
    if (['doc', 'docx'].includes(normalized)) return FileType.DOC;
    if (['ppt', 'pptx'].includes(normalized)) return FileType.PPT;
    if (['zip'].includes(normalized)) return FileType.ZIP;
    if (
      ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'].includes(normalized)
    )
      return FileType.IMAGE;

    return FileType.OTHER;
  }
}
