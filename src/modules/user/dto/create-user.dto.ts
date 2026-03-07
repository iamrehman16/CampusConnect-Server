import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class CreateUserDto {

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  academicInfo?: string;

  @IsOptional()
  @IsString()
  expertise?: string;

  @IsOptional()
  contributionScore?: number;

  @IsOptional()
  @IsEnum(UserStatus)
  accountStatus?: UserStatus;
}