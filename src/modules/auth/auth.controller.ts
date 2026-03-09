import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthguard } from './guards/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthguard)
  @Post("login")
  async login(@Req() req){
    return this.authService.login(req.user.id);
  }

  @UseGuards(RefreshAuthGuard)
  @Post("refresh")
  async refreshToken(@Req() req){
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("signout")
  async signout(@Req() req){
    this.authService.signout(req.user.id);
  }
}
