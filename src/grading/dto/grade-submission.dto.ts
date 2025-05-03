import { IsNotEmpty, IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeSubmissionDto {
  @ApiProperty({ 
    description: 'Scores for each criterion (key: criterionId, value: score)',
    example: { 'criterion-id-1': 8, 'criterion-id-2': 7 }
  })
  @IsNotEmpty()
  @IsObject()
  criteriaScores: Record<string, number>;

  @ApiPropertyOptional({ 
    description: 'Comments for each criterion (key: criterionId, value: comment)',
    example: { 'criterion-id-1': 'Good work on this section', 'criterion-id-2': 'Needs improvement' }
  })
  @IsOptional()
  @IsObject()
  comments?: Record<string, string>;

  @ApiProperty({ description: 'Overall feedback for the submission' })
  @IsString()
  overallFeedback: string;
}