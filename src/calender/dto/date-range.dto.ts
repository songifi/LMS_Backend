import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}