import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceByContributorDto } from './create-resource.dto';

export class UpdateResourceByContributorDto extends PartialType(
  CreateResourceByContributorDto,
) {}