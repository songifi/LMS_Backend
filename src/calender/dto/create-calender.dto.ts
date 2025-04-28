import { IsString, IsOptional, IsEnum, IsBoolean, IsHexColor } from 'class-validator';
import { CalendarType } from '../enums/calendarType';

export class CreateCalendarDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CalendarType)
  @IsOptional()
  type?: CalendarType;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
