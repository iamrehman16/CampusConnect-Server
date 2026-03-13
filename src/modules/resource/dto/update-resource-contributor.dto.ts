import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceByContributorDto } from './create-resource-contributor.dto';

export class UpdateResourceByContributorDto extends PartialType(
  CreateResourceByContributorDto,
) {}