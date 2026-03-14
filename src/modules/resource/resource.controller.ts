import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
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
import { RejectResourceDto } from './dto/reject-resource.dto';

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
    console.log(dto);
    return this.resourceService.create(dto, file);
  }

  @Public()
  @Get()
  findAll() {
    return this.resourceService.findAll();
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

  @Role(Roles.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateResourceByContributorDto,
  ) {
    return this.resourceService.update(id, dto);
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

  @Role(Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.resourceService.remove(id);
  }

  @Patch(':id/approve')
  @Role(Roles.ADMIN)
  approve(@Param('id', ParseMongoIdPipe) id: string) {
    return this.resourceService.approve(id);
  }

  @Patch(':id/reject')
  @Role(Roles.ADMIN)
  reject(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: RejectResourceDto,
  ) {
    return this.resourceService.reject(id, dto.reason);
  }
}
