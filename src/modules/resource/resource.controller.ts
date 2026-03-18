import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import * as express from 'express';
import { ResourceService } from './resource.service';
import { CreateResourceByContributorDto } from './dto/create-resource-contributor.dto';
import { UpdateResourceByContributorDto } from './dto/update-resource-contributor.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ParseMongoIdPipe } from 'src/common/pipes/is-mongo-id.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from '../storage/common/file-validation.pipe';
import { memoryStorage } from 'multer';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from '../user/enums/user-role.enum';
import { ResourceQueryDto } from './dto/resource-query.dto';

@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Role(Roles.ADMIN, Roles.CONTRIBUTOR)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  create(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body() dto: CreateResourceByContributorDto,
  ) {
    return this.resourceService.create(dto, file);
  }

  @Public()
  @Get()
  async findAll(@Query() query: ResourceQueryDto) {
    return this.resourceService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.resourceService.findOne(id);
  }

  @Public()
  @Get(':id/download')
  async download(
    @Param('id', ParseMongoIdPipe) id: string,
    @Res() res: express.Response,
  ) {
    const url = await this.resourceService.getDownloadUrl(id);
    return res.redirect(url);
  }

  @Patch(':id/my')
  @Role(Roles.CONTRIBUTOR)
  updateOwn(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateResourceByContributorDto,
    @Req() req,
  ) {
    return this.resourceService.updateOwn(id, dto, req.user.id);
  }
}
