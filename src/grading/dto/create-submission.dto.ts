import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'Assignment ID' })
  @IsNotEmpty()
  @IsUUID()
  assignmentId: string;

  @ApiProperty({ description: 'Student ID' })
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Student name' })
  @IsNotEmpty()
  @IsString()
  studentName: string;

  @ApiProperty({ description: 'Submission content' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'URL to submission file' })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}