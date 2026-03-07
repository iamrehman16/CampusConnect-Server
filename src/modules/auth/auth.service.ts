import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly userService:UserService){}

    async register(registerDto:RegisterDto){
        return await this.userService.create(registerDto);
    }
    async login(loginDto:LoginDto){
        const thisUser = this.userService.findByEmail(loginDto.email)

    }
    async validateUser(email:string,password:string){
        const user = await this.userService.findByEmail(email);
        if(!user) throw new UnauthorizedException("User not found!");
        const isPasswordMatch = await compare(password,user.password);
        if(!isPasswordMatch) throw new UnauthorizedException("Invalid Credentials");

        return {id:user._id};
    }
}
