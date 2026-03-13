import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { ResourceType } from '../enums/resource-types.enum';
import { ApprovalStatus } from '../enums/approval-status.enum';
import { FileType } from '../enums/file-type.enum';

export class CreateResourceDto {

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  subject: string;

  @IsString()
  course: string;

  @IsInt()
  semester: number;

  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @IsEnum(FileType)
  fileType: FileType;

  @IsInt()
  fileSize: number;

  @IsString()
  filePath: string;

  @IsOptional()
  @IsString()
  cloudinaryPublicId?: string;

  @IsMongoId()
  @IsString()
  uploadedBy: string;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @IsOptional()
  @IsArray()
  tags?: string[];
}