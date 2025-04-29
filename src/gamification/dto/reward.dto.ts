import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsObject, IsUrl, IsOptional } from 'class-validator';
import { RewardType } from '../interfaces/gamification.interfaces';

export class RewardDto {
  @ApiProperty({ description: 'Name of the reward' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the reward' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of reward', enum: RewardType })
  @IsEnum(RewardType)
  type: RewardType;

  @ApiProperty({ description: 'Points required to redeem this reward' })
  @IsNumber()
  pointsCost: number;

  @ApiProperty({ description: 'Requirements to unlock this reward', required: false })
  @IsObject()
  @IsOptional()
  unlockRequirements?: Record<string, any>;

  @ApiProperty({ description: 'Image URL for the reward', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}

export class UserRewardDto extends RewardDto {
  @ApiProperty({ description: 'Reward ID' })
  id: number;

  @ApiProperty({ description: 'Whether this reward is unlocked for the user' })
  isUnlocked: boolean;

  @ApiProperty({ description: 'Whether the user has enough points to redeem this reward' })
  canAfford: boolean;
}
