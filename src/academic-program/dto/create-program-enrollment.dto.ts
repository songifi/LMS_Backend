import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional, IsDateString } from 'class-validator';

export class CreateProgramEnrollmentDto {
  @ApiProperty({ description: 'Student ID' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Enrollment status (Active, Graduated, Withdrawn)' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'When the student enrolled in the program' })
  @IsDateString()
  enrollmentDate: Date;

  @ApiProperty({ description: 'When the student completed the program', required: false })
  @IsDateString()
  @IsOptional()
  completionDate?: Date;

  @ApiProperty({ description: 'Progress tracking for degree requirements', required: false })
  @IsObject()
  @IsOptional()
  progressTracking?: Record<string, any>;

  @ApiProperty({ description: 'Catalog year for this enrollment' })
  @IsString()
  catalogYear: string;

  @ApiProperty({ description: 'Completed courses and grades', required: false })
  @IsObject()
  @IsOptional()
  completedCourses?: Record<string, any>;

  @ApiProperty({ description: 'Program ID the student is enrolled in' })
  @IsString()
  programId: string;
}
