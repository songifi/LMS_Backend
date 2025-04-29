import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsObject, IsUrl, IsOptional } from 'class-validator';
import { BadgeType } from '../interfaces/gamification.interfaces';

export class BadgeDto {
  @ApiProperty({ description: 'Name of the badge' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of how to earn the badge' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'URL to the badge image' })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({ description: 'Type of badge', enum: BadgeType })
  @IsEnum(BadgeType)
  type: BadgeType;

  @ApiProperty({ description: 'Requirements to earn this badge' })
  @IsObject()
  requirements: Record<string, any>;

  @ApiProperty({ description: 'Points awarded when earning this badge' })
  @IsNumber()
  pointsValue: number;
}

export class UserBadgeDto {
  @ApiProperty({ description: 'Badge information' })
  badge: BadgeDto;

  @ApiProperty({ description: 'Date when the badge was earned' })
  earnedAt: Date;
}

export class UserBadgesResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Badges earned by the user', type: [UserBadgeDto] })
  badges: UserBadgeDto[];

  @ApiProperty({ description: 'Total number of badges earned' })
  totalBadges: number;
}
