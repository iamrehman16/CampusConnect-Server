import { Controller, Post, Req, UseGuards, Body, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthguard } from './guards/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() registerDto: RegisterDto){
    return this.authService.register(registerDto);
  }

  @Public()
  @Post("test")
  async test(@Body() body: any){
    console.log("Test endpoint called with body:", body);
    return { message: "Test endpoint working", body };
  }

  @Public()
  @Post("pre-login")
  async preLogin(@Body() body: any, @Req() req: any){
    console.log("Pre-login endpoint called");
    console.log("Body:", body);
    console.log("Headers:", req.headers);
    return { message: "Pre-login working", body, headers: req.headers };
  }

  @Public()
  @UseGuards(LocalAuthguard)
  @Post("login")
  async login(@Req() req){
    return await this.authService.login(req.user.id);
  }

  @UseGuards(RefreshAuthGuard)
  @Post("refresh")
  async refreshToken(@Req() req){
    return this.authService.refreshToken(req.user.id);
  }

  @Post("signout")
  async signout(@Req() req){
    this.authService.signout(req.user.id);
  }
}
