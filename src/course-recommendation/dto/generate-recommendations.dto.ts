import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateRecommendationsDto {
  @ApiProperty({ description: 'Student ID to generate recommendations for' })
  @IsUUID('4')
  studentId: string;

  @ApiPropertyOptional({ description: 'Specific algorithm ID to use (otherwise uses active algorithm)' })
  @IsUUID('4')
  @IsOptional()
  algorithmId?: string;
}