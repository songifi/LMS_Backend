import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @IsOptional()
  activitiesCompleted?: number;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
