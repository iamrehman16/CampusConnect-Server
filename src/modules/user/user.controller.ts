import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from './enums/user-role.enum';
import { AdminUpdateUserDto } from './dto/update-admin-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { Public } from '../auth/decorators/public.decorator';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Public registration
  @Public()
  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.userService.createUser(dto);
  }

  // Admin creates user
  @Role(Roles.ADMIN)
  @Post()
  createByAdmin(@Body() dto: AdminCreateUserDto) {
    return this.userService.createUserByAdmin(dto);
  }

  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Req() req, @Body() dto: UpdateUserProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Role(Roles.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Role(Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Role(Roles.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.userService.updateUserByAdmin(id, dto);
  }

  @Role(Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}