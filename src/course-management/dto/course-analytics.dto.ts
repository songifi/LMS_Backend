import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CourseAnalyticsDto {
  @IsUUID()
  courseId: string;

  @IsString()
  @IsOptional()
  period?: string;
}