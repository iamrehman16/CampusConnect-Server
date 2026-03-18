import { IsOptional, IsEnum, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType } from '../enums/resource-types.enum';
import { ResourceSort } from '../enums/resource-sort.enum';

export class ResourceQueryDto {

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semester?: number;

  @IsOptional()
  @IsEnum(ResourceSort)
  sort?: ResourceSort = ResourceSort.NEWEST;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Max(50)
  @IsNumber()
  limit?: number = 12;
}