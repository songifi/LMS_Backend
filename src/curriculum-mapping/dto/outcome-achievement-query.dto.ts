import { IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum TrackingTimeframe {
  SEMESTER = 'semester',
  YEAR = 'year',
  ALL_TIME = 'all_time',
}

export class OutcomeAchievementQueryDto {
  @IsOptional()
  @IsEnum(TrackingTimeframe)
  timeframe?: TrackingTimeframe = TrackingTimeframe.ALL_TIME;

  @IsOptional()
  @IsBoolean()
  includeStudentData?: boolean = false;
}