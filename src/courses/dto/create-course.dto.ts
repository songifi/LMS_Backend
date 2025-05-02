import { IsString, IsNumber, IsOptional, IsArray, Min, Max, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Course code (e.g., CS101)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Course title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Course description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Number of credits' })
  @IsNumber()
  @Min(1)
  @Max(6)
  credits: number;

  @ApiPropertyOptional({ description: 'Department offering the course' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Course prerequisites' })
  @IsOptional()
  @IsArray()
  prerequisites?: string[];

  @ApiPropertyOptional({ description: 'Course corequisites' })
  @IsOptional()
  @IsArray()
  corequisites?: string[];

  @ApiPropertyOptional({ description: 'Degree requirements this course fulfills' })
  @IsOptional()
  @IsObject()
  degreeRequirements?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Topics covered in the course' })
  @IsOptional()
  @IsArray()
  topics?: string[];

  @ApiPropertyOptional({ description: 'Course difficulty (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @ApiPropertyOptional({ description: 'Semesters when the course is offered' })
  @IsOptional()
  @IsArray()
  semestersOffered?: string[];
}