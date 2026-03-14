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

import { Transform, Type } from 'class-transformer';
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

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  semester: number;

  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
    return value;
  })
  tags?: string[];
}