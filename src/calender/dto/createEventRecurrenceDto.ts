import { IsArray, IsDate, IsEnum, IsOptional } from "class-validator";
import { RecurrenceFrequency } from "../enums/recurrenceFrequency.enum";
import { Type } from "class-transformer";

 export class CreateEventRecurrenceDto {
    @IsEnum(RecurrenceFrequency)
    frequency: RecurrenceFrequency;
  
    @IsOptional()
    interval?: number;
  
    @IsArray()
    @IsOptional()
    byDay?: string[];
  
    @IsArray()
    @IsOptional()
    byMonthDay?: number[];
  
    @IsArray()
    @IsOptional()
    byMonth?: number[];
  
    @IsOptional()
    count?: number;
  
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    until?: Date;
  
    @IsArray()
    @IsOptional()
    @Type(() => Date)
    exceptionDates?: Date[];
  }
  