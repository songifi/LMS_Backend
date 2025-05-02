import { IsString, IsObject, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlgorithmStatus } from '../entities/algorithm.entity';

export class CreateAlgorithmDto {
  @ApiProperty({ description: 'Name of the algorithm', example: 'Career Path Recommender' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the algorithm', example: 'Recommends courses based on career goals and academic history' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of the algorithm', example: 'content-based' })
  @IsString()
  type: string;

  @ApiProperty({ 
    description: 'Configuration parameters',
    example: {
      similarityThreshold: 0.7,
      maxRecommendations: 10,
      considerPrerequisites: true
    }
  })
  @IsObject()
  parameters: Record<string, any>;

  @ApiProperty({ 
    description: 'Weight factors for different recommendation criteria',
    example: {
      careerRelevance: 0.4,
      prerequisiteCompletion: 0.3,
      studentPreference: 0.2,
      peerPopularity: 0.1
    }
  })
  @IsObject()
  weights: Record<string, number>;

  @ApiProperty({ description: 'Version number', example: '1.0.0' })
  @IsString()
  version: string;

  @ApiPropertyOptional({ description: 'Current status of the algorithm', enum: AlgorithmStatus, default: AlgorithmStatus.TESTING })
  @IsEnum(AlgorithmStatus)
  status?: AlgorithmStatus;

  @ApiPropertyOptional({ 
    description: 'Performance metrics',
    example: {
      precision: 0.82,
      recall: 0.78,
      f1Score: 0.80
    }
  })
  @IsObject()
  metrics?: Record<string, any>;
}