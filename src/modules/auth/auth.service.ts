import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import argon2 from "argon2"

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
        const {accessToken,refreshToken} = await this.generateTokens(userId);
        const hashedRefreshToken = await argon2.hash(refreshToken);
        await this.userService.updateRefreshToken(userId,hashedRefreshToken);

        return({
            id:userId,
            accessToken,
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
        const {accessToken,refreshToken} = await this.generateTokens(userId);
        const hashedRefreshToken = await argon2.hash(refreshToken);
        await this.userService.updateRefreshToken(userId,hashedRefreshToken);

        return({
            id:userId,
            accessToken,
            refreshToken,
        })
    }


    async generateTokens(userId:number){
        const payload:AuthJwtPayload = {sub:userId};
        const [accessToken,refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload,this.refreshtTokenConfig)
        ]);

        return {accessToken,refreshToken};
    }

    async validateRefreshToken(userId:number,refreshToken:string){
        const user = await this.userService.findOneWithHashedRefreshToken(userId);
        if(!user||!user.hashedRefreshToken) throw new UnauthorizedException("Invalid Refresh Token!");

        const isMatch = await argon2.verify(user.hashedRefreshToken,refreshToken);
        if(!isMatch) throw new UnauthorizedException("Expired or Invalid RefreshToken!");

        return {id:userId};
    }

    async signout(userId:number){
        await this.userService.updateRefreshToken(userId,null);
    }
}
