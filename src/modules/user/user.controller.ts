import { Controller, Get, Post, Body, Patch, Req, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/types/current-user';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.userService.createUser(dto);
  }

  @Get('profile')
  getProfile(@Req() req: { user: CurrentUser }) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('profile')
  updateProfile(
    @Req() req: { user: CurrentUser },
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Get('profile:id')
  getUserProfile(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
