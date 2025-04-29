import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';

export class PointDto {
  @ApiProperty({ description: 'User ID who earned the points' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Amount of points earned' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Activity that generated these points' })
  @IsString()
  activityType: string;

  @ApiProperty({ description: 'Reference to the specific activity', required: false })
  @IsNumber()
  @IsOptional()
  activityId?: number;

  @ApiProperty({ description: 'Additional metadata about the points', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UserPointsDto {
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Total points earned' })
  totalPoints: number;

  @ApiProperty({ description: 'Points earned today' })
  dailyPoints: number;

  @ApiProperty({ description: 'Points earned this week' })
  weeklyPoints: number;

  @ApiProperty({ description: 'Points earned this month' })
  monthlyPoints: number;

  @ApiProperty({ description: 'History of point transactions', type: [PointDto] })
  history: PointDto[];
}
