import { IsEmail, IsString, IsOptional, IsArray, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ description: 'Student first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Student last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Student email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Student major' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({ description: 'Student minor' })
  @IsOptional()
  @IsString()
  minor?: string;

  @ApiProperty({ description: 'Student year (1-6)', default: 1 })
  @IsInt()
  @Min(1)
  @Max(6)
  year: number;

  @ApiPropertyOptional({ description: 'Student career goal' })
  @IsOptional()
  @IsString()
  careerGoal?: string;

  @ApiPropertyOptional({ description: 'Student interests' })
  @IsOptional()
  @IsArray()
  interests?: string[];
}