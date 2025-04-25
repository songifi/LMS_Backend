import { IsUUID, IsDateString, IsOptional } from 'class-validator';

export class FilterSessionsDto {
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
