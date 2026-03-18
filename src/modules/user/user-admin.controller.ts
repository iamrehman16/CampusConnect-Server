import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from './enums/user-role.enum';
import { AdminUpdateUserDto } from './dto/update-admin-profile.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role(Roles.ADMIN)
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createByAdmin(@Body() dto: AdminCreateUserDto) {
    return this.userService.createUserByAdmin(dto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.userService.updateUserByAdmin(id, dto);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.userService.updateRole(id, dto.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
