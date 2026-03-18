import {
  Controller,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AdminUpdatePostDto } from './dto/admin-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from '../user/enums/user-role.enum';

@Controller('admin/posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role(Roles.ADMIN)
export class PostAdminController {
  constructor(private readonly postService: PostService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: AdminUpdatePostDto) {
    return this.postService.adminUpdate(id, dto);
  }
}
