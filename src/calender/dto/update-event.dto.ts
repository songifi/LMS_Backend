import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}

import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  isRecurring?: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}
