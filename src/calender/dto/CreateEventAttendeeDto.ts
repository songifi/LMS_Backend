import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { AttendeeRole, AttendeeStatus } from "../entities/event-attendee.entity";

 export class CreateEventAttendeeDto {
    @IsUUID()
    @IsOptional()
    userId?: string;
    
    @IsString()
    @IsOptional()
    email?: string;
  
    @IsEnum(AttendeeStatus)
    @IsOptional()
    status?: AttendeeStatus;
  
    @IsEnum(AttendeeRole)
    role: AttendeeRole;

    calendarId: string; 
  }