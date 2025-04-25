import { IsUUID, IsEnum, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { EnrollmentStatus } from '../enums/enrollmentStatus.enum';

export class CreateEnrollmentDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  courseId: string;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @IsDateString()
  @IsOptional()
  enrollmentDeadline?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  capacity?: number;

}
