import {
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  department: string;

  @IsNumber()
  @Min(1)
  @Max(8)
  semester: number;

  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @IsArray()
  @IsString({ each: true })
  expertise: string[];

  @IsBoolean()
  isOpenToMentor: boolean;

  @IsString()
  avatar: string;
}
