import { Controller, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthguard } from './guards/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthguard)
  @Post("login")
  async login(@Request() req){
    return this.authService.login(req.user.id);
  }

  @UseGuards(RefreshAuthGuard)
  @Post("refresh")
  async refreshToken(@Req() req){
    return this.authService.refreshToken(req.user.id);
  }
}
