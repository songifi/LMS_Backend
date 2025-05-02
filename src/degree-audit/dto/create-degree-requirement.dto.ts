import { IsString, IsEnum, IsInt, IsNumber, IsOptional, IsArray, IsUUID, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequirementType } from '../entities/degree-requirement.entity';

export class CreateDegreeRequirementDto {
  @ApiProperty({ description: 'Name of the requirement', example: 'Core Computer Science Courses' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Description of the requirement', example: 'Fundamental courses required for all CS majors' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of requirement', enum: RequirementType, example: RequirementType.CORE })
  @IsEnum(RequirementType)
  type: RequirementType;

  @ApiProperty({ description: 'Minimum credits required for this requirement', example: 15 })
  @IsInt()
  @Min(0)
  minCredits: number;

  @ApiPropertyOptional({ description: 'Required GPA for this requirement (if applicable)', example: 3.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  requiredGpa?: number;

  @ApiPropertyOptional({ description: 'Minimum number of courses required (if applicable)', example: 5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  minCourses?: number;

  @ApiProperty({ description: 'IDs of courses that fulfill this requirement', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  courseIds: string[];
}