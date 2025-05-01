import { IsUUID, IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewDecision } from '../entities/application-review.entity';

export class CreateApplicationReviewDto {
  @ApiProperty({ description: 'The application ID to review' })
  @IsUUID()
  applicationId: string;

  @ApiProperty({ description: 'ID of the reviewer' })
  @IsString()
  @IsNotEmpty()
  reviewerId: string;

  @ApiProperty({ description: 'Name of the reviewer' })
  @IsString()
  @IsNotEmpty()
  reviewerName: string;

  @ApiPropertyOptional({ description: 'Comments on the application' })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({ description: 'Scores for different criteria' })
  @IsObject()
  @IsOptional()
  scores?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Review decision', enum: ReviewDecision })
  @IsEnum(ReviewDecision)
  @IsOptional()
  decision?: ReviewDecision;

  @ApiPropertyOptional({ description: 'Is the review completed?' })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class UpdateApplicationReviewDto {
  @ApiPropertyOptional({ description: 'Comments on the application' })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({ description: 'Scores for different criteria' })
  @IsObject()
  @IsOptional()
  scores?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Review decision', enum: ReviewDecision })
  @IsEnum(ReviewDecision)
  @IsOptional()
  decision?: ReviewDecision;

  @ApiPropertyOptional({ description: 'Is the review completed?' })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class ApplicationReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  applicationId: string;

  @ApiProperty()
  reviewerId: string;

  @ApiProperty()
  reviewerName: string;

  @ApiPropertyOptional()
  comments?: string;

  @ApiPropertyOptional()
  scores?: Record<string, number>;

  @ApiProperty({ enum: ReviewDecision })
  decision: ReviewDecision;

  @ApiProperty()
  isCompleted: boolean;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}