import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateCourseSequenceDto {
  @ApiProperty({ description: 'Course code' })
  @IsString()
  courseCode: string;

  @ApiProperty({ description: 'Course name' })
  @IsString()
  courseName: string;

  @ApiProperty({ description: 'Credits for this course' })
  @IsNumber()
  credits: number;

  @ApiProperty({ description: 'Semester in which this course should be taken' })
  @IsNumber()
  semester: number;

  @ApiProperty({ description: 'Year in which this course should be taken' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'Prerequisites for this course', required: false })
  @IsArray()
  @IsOptional()
  prerequisites?: string[];

  @ApiProperty({ description: 'Corequisites for this course', required: false })
  @IsArray()
  @IsOptional()
  corequisites?: string[];

  @ApiProperty({ description: 'Whether this course is required', default: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ description: 'Curriculum ID this course sequence belongs to' })
  @IsString()
  curriculumId: string;
}
