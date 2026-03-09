import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService:UserService, 
        private readonly jwtService:JwtService,
        @Inject(refreshJwtConfig.KEY) private readonly refreshtTokenConfig: ConfigType<typeof refreshJwtConfig>
    ){}

    async register(registerDto:RegisterDto){
        return await this.userService.create(registerDto);
    }
    async login(userId:number){
        const payload:AuthJwtPayload = {sub:userId};
        const token = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload,this.refreshtTokenConfig);
        return({
            id:userId,
            token,
            refreshToken,
        })
    }
    async validateUser(email:string,password:string){
        const user = await this.userService.findByEmail(email);
        if(!user) throw new UnauthorizedException("User not found!");
        const isPasswordMatch = await compare(password,user.password);
        if(!isPasswordMatch) throw new UnauthorizedException("Invalid Credentials");

        return {id:user._id};
    }
    async refreshToken(userId:number){
        const payload:AuthJwtPayload = {sub:userId};
        const token = this.jwtService.sign(payload);
         return({
            id:userId,
            token,
        })
    }
}
