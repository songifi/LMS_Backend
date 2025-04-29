import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateProgramDto {
  @ApiProperty({ description: 'Name of the academic program' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Program code (e.g., CS, BIO)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Program description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Credits required for completion' })
  @IsNumber()
  requiredCredits: number;

  @ApiProperty({ description: 'Program active status', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Department that manages the program' })
  @IsString()
  department: string;

  @ApiProperty({ description: 'Degree level (Bachelors, Masters, etc.)' })
  @IsString()
  degreeLevel: string;
}
