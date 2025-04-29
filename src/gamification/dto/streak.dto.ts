import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDate, IsArray, IsOptional, IsObject } from 'class-validator';

export class StreakDto {
  @ApiProperty({ description: 'User ID who owns this streak' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Current consecutive days of activity' })
  @IsNumber()
  currentStreak: number;

  @ApiProperty({ description: 'Longest streak achieved' })
  @IsNumber()
  longestStreak: number;

  @ApiProperty({ description: 'Date of last activity' })
  @IsDate()
  lastActivityDate: Date;

  @ApiProperty({ description: 'Activity types contributing to this streak' })
  @IsArray()
  activityTypes: string[];

  @ApiProperty({ description: 'Additional streak data', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}