import { IsArray, IsBoolean, IsDate, IsEnum, IsHexColor, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { EventType } from "../enums/eventType.enum";
import { Type } from "class-transformer";
import { CreateEventRecurrenceDto } from "./createEventRecurrenceDto";
import { CreateEventAttendeeDto } from "./CreateEventAttendeeDto";
import { CreateEventReminderDto } from "./CreateEventReminderDto";

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @IsString()
  @IsOptional()
  location?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsUUID()
  calendarId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEventRecurrenceDto)
  recurrence?: CreateEventRecurrenceDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEventAttendeeDto)
  attendees?: CreateEventAttendeeDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEventReminderDto)
  reminders?: CreateEventReminderDto[];

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  checkConflicts?: boolean;

  isRecurring?: boolean;
}