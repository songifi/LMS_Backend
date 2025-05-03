import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, IsBoolean, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ScoreDescriptorDto {
  @ApiProperty({ description: 'Score value' })
  @IsNumber()
  score: number;

  @ApiProperty({ description: 'Description for this score level' })
  @IsString()
  description: string;
}

class RubricCriterionDto {
  @ApiProperty({ description: 'Criterion name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Criterion description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Maximum possible score for this criterion' })
  @IsNumber()
  maxScore: number;

  @ApiPropertyOptional({ description: 'Score descriptors for different levels' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreDescriptorDto)
  scoreDescriptors?: ScoreDescriptorDto[];

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateRubricDto {
  @ApiProperty({ description: 'Rubric name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Rubric description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Total possible points for this rubric' })
  @IsNumber()
  totalPoints: number;

  @ApiPropertyOptional({ description: 'Whether this is a template rubric' })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiProperty({ description: 'Rubric criteria', type: [RubricCriterionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricCriterionDto)
  criteria: RubricCriterionDto[];

  @ApiPropertyOptional({ description: 'Assignment ID to link this rubric to' })
  @IsOptional()
  @IsUUID()
  assignmentId?: string;
}