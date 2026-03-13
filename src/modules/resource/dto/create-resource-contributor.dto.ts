import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ResourceType } from '../enums/resource-types.enum';

export class CreateResourceByContributorDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  course: string;

  @IsInt()
  @Min(1)
  @Max(8)
  semester: number;

  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}