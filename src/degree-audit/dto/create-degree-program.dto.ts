import { IsString, IsInt, IsNotEmpty, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDegreeProgramDto {
  @ApiProperty({ description: 'Name of the degree program', example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Department offering the degree', example: 'Computer Science and Engineering' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department: string;

  @ApiProperty({ description: 'Type of degree (e.g., BS, BA, MS, PhD)', example: 'BS' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  degreeType: string;

  @ApiProperty({ description: 'Total credits required for graduation', example: 120 })
  @IsInt()
  @Min(30)
  totalCreditsRequired: number;

  @ApiProperty({ description: 'Description of the degree program', example: 'Bachelor of Science in Computer Science' })
  @IsString()
  @IsNotEmpty()
  description: string;
}