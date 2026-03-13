import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CreateResourceByContributorDto } from './dto/create-resource-contributor.dto';
import { UpdateResourceByContributorDto } from './dto/update-resource-contributor.dto';
import { Public } from '../auth/decorators/public.decorator';


@Public() //temporary for testing
@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  create(@Body() dto: CreateResourceByContributorDto) {
    return this.resourceService.create(dto);
  }

  @Get()
  findAll() {
    return this.resourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResourceByContributorDto,
  ) {
    return this.resourceService.update(id, dto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourceService.remove(id);
  }
}