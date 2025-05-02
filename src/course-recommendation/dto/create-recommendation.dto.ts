import { IsUUID, IsString, IsNumber, IsObject, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRecommendationDto {
  @ApiProperty({ description: 'Student ID to receive the recommendation' })
  @IsUUID('4')
  studentId: string;

  @ApiProperty({ description: 'Course ID being recommended' })
  @IsUUID('4')
  courseId: string;

  @ApiProperty({ description: 'Score or confidence of the recommendation (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ description: 'Explanation for why this course was recommended' })
  @IsString()
  explanation: string;

  @ApiProperty({ description: 'Algorithm ID used to generate this recommendation' })
  @IsUUID('4')
  algorithmId: string;

  @ApiProperty({ description: 'Algorithm version used' })
  @IsString()
  algorithmVersion: string;

  @ApiProperty({ description: 'Factors that influenced this recommendation' })
  @IsObject()
  factors: Record<string, any>;

  @ApiPropertyOptional({ description: 'Whether the student selected this recommendation', default: false })
  @IsBoolean()
  selected?: boolean;
}