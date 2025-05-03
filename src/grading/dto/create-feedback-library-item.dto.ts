import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackLibraryItemDto {
  @ApiProperty({ description: 'Feedback content' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'Category or rubric criterion name' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: 'Course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Initial usage count' })
  @IsOptional()
  @IsNumber()
  usageCount?: number;

  @ApiPropertyOptional({ description: 'Sentiment score (-1 to 1)' })
  @IsOptional()
  @IsNumber()
  sentiment?: number;

  @ApiPropertyOptional({ description: 'Whether this feedback is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}