import { IsString, IsEnum, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortBy {
  SCORE = 'score',
  CAREER_RELEVANCE = 'careerRelevance',
  DIFFICULTY = 'difficulty',
  POPULARITY = 'popularity',
}

export class RecommendationQueryDto {
  @ApiPropertyOptional({ description: 'Student ID to get recommendations for' })
  @IsUUID('4')
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Algorithm ID to use for recommendations' })
  @IsUUID('4')
  @IsOptional()
  algorithmId?: string;

  @ApiPropertyOptional({ description: 'Filter by course department' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Maximum difficulty level (1-5)', default: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  maxDifficulty?: number;

  @ApiPropertyOptional({ description: 'Minimum number of credits', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  minCredits?: number;

  @ApiPropertyOptional({ description: 'Maximum number of credits' })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxCredits?: number;

  @ApiPropertyOptional({ description: 'Sort results by field', enum: SortBy, default: SortBy.SCORE })
  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy;

  @ApiPropertyOptional({ description: 'Maximum number of recommendations to return', default: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}