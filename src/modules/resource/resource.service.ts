import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CloudinaryService } from '../storage/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { Resource } from './schemas/resource.schema';
import { Model, Types } from 'mongoose';
import { CreateResourceByContributorDto } from './dto/create-resource-contributor.dto';
import { UpdateResourceByContributorDto } from './dto/update-resource-contributor.dto';

@Injectable()
export class ResourceService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Resource.name) private resourceModel: Model<Resource>,
  ) {}

  async create(dto: CreateResourceByContributorDto): Promise<Resource> {
    try {
      const resource = new this.resourceModel(dto);
      console.log("Dto reached here", dto); //prints dto
      return await resource.save();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to create resource');
    }
  }


  async findAll(): Promise<Resource[]> {
    try {
      return await this.resourceModel
        .find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch resources');
    }
  }

  async findOne(id: string): Promise<Resource> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid resource ID');
    }

    const resource = await this.resourceModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async update(id: string, dto: UpdateResourceByContributorDto): Promise<Resource> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid resource ID');
    }

    const resource = await this.resourceModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      dto,
      { new: true },
    );

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }


  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid resource ID');
    }

    const resource = await this.resourceModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );

    // if (!resource) {
    //   throw new NotFoundException('Resource not found');
    // }
    // if (resource.cloudinaryPublicId) {
    //   try {
    //     await this.cloudinaryService.deleteFile(resource.cloudinaryPublicId);
    //   } catch (err) {
    //     // do not block deletion if cloudinary fails
    //   }
    // }

    return { message: 'Resource deleted successfully' };
  }
}