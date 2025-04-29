import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsObject, IsDate, IsOptional } from 'class-validator';
import { ChallengeStatus, ChallengeType } from '../interfaces/gamification.interfaces';

export class ChallengeDto {
  @ApiProperty({ description: 'Name of the challenge' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the challenge' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of challenge', enum: ChallengeType })
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiProperty({ description: 'Requirements to complete this challenge' })
  @IsObject()
  requirements: Record<string, any>;

  @ApiProperty({ description: 'Points awarded when completing this challenge' })
  @IsNumber()
  pointsReward: number;

  @ApiProperty({ description: 'Badge ID awarded when completing this challenge', required: false })
  @IsNumber()
  @IsOptional()
  badgeRewardId?: number;

  @ApiProperty({ description: 'Start date for this challenge' })
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'End date for this challenge' })
  @IsDate()
  endDate: Date;
}

export class UserChallengeDto extends ChallengeDto {
  @ApiProperty({ description: 'Challenge ID' })
  id: number;

  @ApiProperty({ description: 'Status of the challenge for this user', enum: ChallengeStatus })
  status: ChallengeStatus;

  @ApiProperty({ description: 'Current progress (percentage)', required: false })
  @IsOptional()
  progress?: number;
}

export class CompleteChallengeDto {
  @ApiProperty({ description: 'Challenge ID to complete' })
  @IsNumber()
  challengeId: number;

  @ApiProperty({ description: 'User ID completing the challenge' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Additional proof or metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
