import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class FilterProgressDto {
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsUUID()
  @IsOptional()
  courseId?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
