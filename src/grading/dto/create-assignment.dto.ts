import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDate, IsNumber, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Assignment title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Assignment description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Course ID' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiPropertyOptional({ description: 'Rubric ID' })
  @IsOptional()
  @IsUUID()
  rubricId?: string;

  @ApiPropertyOptional({ description: 'Maximum possible score' })
  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Passing threshold score' })
  @IsOptional()
  @IsNumber()
  passingThreshold?: number;

  @ApiPropertyOptional({ description: 'Whether the assignment is published' })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: 'Assignment due date' })
  @IsOptional()
  @IsDate()
  dueDate?: Date;
}