import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CloudinaryService } from '../storage/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { Model } from 'mongoose';
import { CreateResourceByContributorDto } from './dto/create-resource-contributor.dto';
import { UpdateResourceByContributorDto } from './dto/update-resource-contributor.dto';
import { ApprovalStatus } from './enums/approval-status.enum';
import { ResourceQueryDto } from './dto/resource-query.dto';
import { ResourceQueryBuilder } from './dto/queries/build-resource-query'
import { ResourceSortBuilder } from './dto/queries/build-resource-sort';
import {
  PaginationService,
  PaginatedResult,
} from 'src/common/services/pagination.service';
import { inferFileType } from './utils/file.utils';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ResourceService {
  private readonly queryBuilder = new ResourceQueryBuilder();
  private readonly sortBuilder = new ResourceSortBuilder();

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly paginationService: PaginationService,
    private readonly eventEmitter: EventEmitter2,
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
  ) {}

  async create(
    dto: CreateResourceByContributorDto,
    file: Express.Multer.File,
    userId: string,
  ){
    let uploadResult;
    try {
      uploadResult = await this.cloudinaryService.uploadFile(file);
    } catch (err) {
      throw new InternalServerErrorException('Upload to storage failed');
    }

    const fileFormat =
      uploadResult.format ||
      file.originalname.split('.').pop()?.toLowerCase() ||
      'unknown';

    const fileType = inferFileType(fileFormat, file.originalname);

    try {
      const resource = await this.resourceModel.create({
        ...dto,
        fileUrl: uploadResult.url,
        cloudinaryPublicId: uploadResult.publicId,
        fileFormat,
        cloudinaryResourceType: uploadResult.resourceType,
        fileType,
        fileSize: uploadResult.bytes,
        uploadedBy: userId,
      });

      return resource.toObject();
    } catch (err) {
      console.log('The error is', err);

      if (uploadResult?.publicId) {
        await this.cloudinaryService
          .deleteFile(uploadResult.publicId, uploadResult.resourceType)
          .catch(() => null);
      }
      throw new InternalServerErrorException(
        'Database save failed. File rolled back.',
      );
    }
  }

  async findAll(dto: ResourceQueryDto) {
    return this.paginationService.paginate(
      this.resourceModel,
      dto,
      this.queryBuilder,
      this.sortBuilder,
    );
  }

  async findOne(id: string){
    const resource = await this.resourceModel
      .findOne({ _id: id, isDeleted: false })
      .lean()
      .exec();

    if (!resource) throw new NotFoundException('Resource not found');
    return resource as Resource;
  }

  async update(
    id: string,
    dto: UpdateResourceByContributorDto,
  ){
    const resource = await this.resourceModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, dto, { new: true })
      .lean()
      .exec();

    if (!resource) throw new NotFoundException('Resource not found');
    return resource as Resource;
  }

  async updateOwn(
    id: string,
    dto: UpdateResourceByContributorDto,
    userId: string,
  ){
    const resource = await this.resourceModel
      .findOneAndUpdate(
        { _id: id, uploadedBy: userId, isDeleted: false },
        dto,
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    if (!resource) {
      throw new NotFoundException('Resource not found or ownership mismatch');
    }

    return resource as Resource;
  }

  async remove(id: string){
    const resource = await this.resourceModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: false },
      )
      .lean()
      .exec();

    if (!resource) {
      throw new NotFoundException('Resource not found or already deleted');
    }

    if (resource.cloudinaryPublicId) {
      this.cloudinaryService
        .deleteFile(
          resource.cloudinaryPublicId,
          resource.cloudinaryResourceType as 'image' | 'video' | 'raw',
        )
        .catch((err) =>
          console.error(
            `Cleanup failed for ${resource.cloudinaryPublicId}:`,
            err,
          ),
        );
    }

    return { message: 'Resource deleted successfully' };
  }

  async removeOwn(id: string, userId: string){
    const resource = await this.resourceModel
      .findOneAndUpdate(
        { _id: id, uploadedBy: userId, isDeleted: false },
        { isDeleted: true },
        { new: false },
      )
      .lean()
      .exec();

    if (!resource) {
      throw new NotFoundException('Resource not found or ownership mismatch');
    }

    if (resource.cloudinaryPublicId) {
      this.cloudinaryService
        .deleteFile(
          resource.cloudinaryPublicId,
          resource.cloudinaryResourceType as 'image' | 'video' | 'raw',
        )
        .catch((err) =>
          console.error(
            `Cleanup failed for ${resource.cloudinaryPublicId}:`,
            err,
          ),
        );
    }

    return { message: 'Resource deleted successfully' };
  }

  async getDownloadUrl(id: string) {
    const resource = await this.resourceModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $inc: { downloads: 1 } },
        { new: true },
      )
      .lean()
      .exec();

    if (!resource) throw new NotFoundException('Resource not found');
    return this.cloudinaryService.generateDownloadUrl(resource.fileUrl);
  }

  async approve(id: string){
    const resource = await this.resourceModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false, approvalStatus: ApprovalStatus.PENDING },
        { approvalStatus: ApprovalStatus.APPROVED },
        { new: true },
      )
      .lean()
      .exec();

    if (!resource)
      throw new NotFoundException('Resource not found or not pending');

    this.eventEmitter.emit('resource.approved', resource);

    return resource as Resource;
  }

  async reject(id: string, reason: string){
    const resource = await this.resourceModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false, approvalStatus: ApprovalStatus.PENDING },
        { approvalStatus: ApprovalStatus.REJECTED, rejectionReason: reason },
        { new: true },
      )
      .lean()
      .exec();

    if (!resource)
      throw new NotFoundException('Resource not found or not pending');
    return resource as Resource;
  }

  async getStats() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
      const [stats] = await this.resourceModel.aggregate([
        { $match: { isDeleted: false } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            pending: [
              { $match: { approvalStatus: ApprovalStatus.PENDING } },
              { $count: 'count' },
            ],
            uploadedPastWeek: [
              { $match: { createdAt: { $gte: oneWeekAgo } } },
              { $count: 'count' },
            ],
          },
        },
        {
          $project: {
            total: { $arrayElemAt: ['$total.count', 0] },
            pending: { $arrayElemAt: ['$pending.count', 0] },
            uploadedPastWeek: { $arrayElemAt: ['$uploadedPastWeek.count', 0] },
          },
        },
      ]);

      return stats || { total: 0, pending: 0, uploadedPastWeek: 0 };
    } catch {
      throw new InternalServerErrorException('Failed to fetch resource stats');
    }
  }
}
