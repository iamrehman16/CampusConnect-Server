import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthguard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthguard)
  @Post("login")
  async login(@Request() req){
    const token  = await this.authService.login(req.user.id);
    console.log(token)
    return {id:req.user.id,token};
  }
}
