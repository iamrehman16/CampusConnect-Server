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
  Delete,
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
import { CurrentUser } from '../auth/types/current-user';
import { ApprovalStatus } from './enums/approval-status.enum';

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
    @Req() req: { user: CurrentUser }
  ) {
    return this.resourceService.create(dto, file, req.user.id);
  }

  @Public()
  @Get()
  async findAll(@Query() query: ResourceQueryDto) {
    // Force APPROVED status for the public endpoint to prevent access leaking
    query.status = ApprovalStatus.APPROVED;
    return this.resourceService.findAll(query);
  }

  @Get('my')
  @Role(Roles.CONTRIBUTOR, Roles.ADMIN)
  getMyResources(
    @Query() query: ResourceQueryDto,
    @Req() req: { user: CurrentUser },
  ) {
    query.uploadedBy = req.user.id;
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
  @Role(Roles.CONTRIBUTOR, Roles.ADMIN)
  updateOwn(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateResourceByContributorDto,
    @Req() req: { user: CurrentUser },
  ) {
    return this.resourceService.updateOwn(id, dto, req.user.id);
  }

  @Delete(':id/my')
  @Role(Roles.CONTRIBUTOR, Roles.ADMIN)
  deleteOwn(
    @Param('id', ParseMongoIdPipe) id: string,
    @Req() req: { user: CurrentUser },
  ) {
    return this.resourceService.removeOwn(id, req.user.id);
  }
}
