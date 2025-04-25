import { IsEnum } from 'class-validator';
import { EnrollmentStatus } from '../enums/enrollmentStatus.enum';

export class UpdateEnrollmentStatusDto {
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}
