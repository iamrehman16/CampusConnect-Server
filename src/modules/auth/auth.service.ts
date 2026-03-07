import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPayload';

@Injectable()
export class AuthService {
    constructor(private readonly userService:UserService, private jwtService:JwtService){}

    async register(registerDto:RegisterDto){
        return await this.userService.create(registerDto);
    }
    async login(userId:number){
        const payload:AuthJwtPayload = {sub:userId};
        return this.jwtService.sign(payload);
    }
    async validateUser(email:string,password:string){
        const user = await this.userService.findByEmail(email);
        if(!user) throw new UnauthorizedException("User not found!");
        const isPasswordMatch = await compare(password,user.password);
        if(!isPasswordMatch) throw new UnauthorizedException("Invalid Credentials");

        return {id:user._id};
    }
}
