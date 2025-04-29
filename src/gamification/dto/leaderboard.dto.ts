import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsArray } from 'class-validator';

export class LeaderboardEntryDto {
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'User display name' })
  username: string;

  @ApiProperty({ description: 'Total points' })
  points: number;

  @ApiProperty({ description: 'User rank on leaderboard' })
  rank: number;

  @ApiProperty({ description: 'User profile image URL', required: false })
  @IsOptional()
  profileImageUrl?: string;
}

export class LeaderboardDto {
  @ApiProperty({ description: 'Name of the leaderboard' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Period for this leaderboard (daily, weekly, monthly, all-time)' })
  @IsString()
  period: string;

  @ApiProperty({ description: 'Start date for this leaderboard period', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: 'End date for this leaderboard period', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Leaderboard entries', type: [LeaderboardEntryDto] })
  @IsArray()
  entries: LeaderboardEntryDto[];
}
