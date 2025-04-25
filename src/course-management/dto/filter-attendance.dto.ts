import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { AttendanceStatus } from '../enums/attendanceStatus.enum';

export class FilterAttendanceDto {
  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;
}
