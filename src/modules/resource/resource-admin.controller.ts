import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { UpdateResourceByContributorDto } from './dto/update-resource-contributor.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/is-mongo-id.pipe';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from '../user/enums/user-role.enum';
import { RejectResourceDto } from './dto/reject-resource.dto';


@Controller('admin/resources')
@Role(Roles.ADMIN)
export class ResourceAdminController {
  constructor(private readonly resourceService: ResourceService) {}

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateResourceByContributorDto,
  ) {
    return this.resourceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.resourceService.remove(id);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseMongoIdPipe) id: string) {
    return this.resourceService.approve(id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: RejectResourceDto,
  ) {
    return this.resourceService.reject(id, dto.reason);
  }
}
