import { IsEnum, IsOptional } from "class-validator";
import { ReminderType } from "../enums/reminderType.enum";

export class CreateEventReminderDto {
    @IsEnum(ReminderType)
    type: ReminderType;
  
    @IsOptional()
    minutesBefore: number;
  }
  