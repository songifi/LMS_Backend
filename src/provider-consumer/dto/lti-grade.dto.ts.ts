import { IsNotEmpty, IsString, IsOptional, IsNumber, IsObject, IsDateString, IsUUID } from 'class-validator';

export class LineItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  scoreMaximum: number;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsDateString()
  startDateTime?: string;

  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @IsOptional()
  @IsString()
  resourceLinkId?: string;
}

export class ScoreDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  scoreGiven: number;

  @IsNotEmpty()
  @IsNumber()
  scoreMaximum: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  activityProgress?: string; // Initialized, Started, InProgress, Submitted, Completed

  @IsOptional()
  @IsString()
  gradingProgress?: string; // NotReady, Failed, Pending, PendingManual, FullyGraded

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

export class SubmitScoreDto {
  @IsNotEmpty()
  @IsUUID()
  resourceLinkId: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  activityProgress?: string;

  @IsOptional()
  @IsString()
  gradingProgress?: string;
}