import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsObject, IsOptional } from 'class-validator';

export class CreateProgramOutcomeDto {
  @ApiProperty({ description: 'Description of the program outcome' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Code for this outcome (e.g., PLO1)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Assessment methods for this outcome', required: false })
  @IsObject()
  @IsOptional()
  assessmentMethods?: Record<string, any>;

  @ApiProperty({ description: 'Courses that contribute to this outcome', required: false })
  @IsArray()
  @IsOptional()
  relatedCourses?: string[];

  @ApiProperty({ description: 'Program ID this outcome belongs to' })
  @IsString()
  programId: string;
}
