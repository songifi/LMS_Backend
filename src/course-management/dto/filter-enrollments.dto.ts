import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { EnrollmentStatus } from '../enums/enrollmentStatus.enum';

export class FilterEnrollmentsDto {
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsUUID()
  @IsOptional()
  courseId?: string;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;
}