import { IsUUID, IsEnum, IsOptional, IsBoolean, IsDateString, IsNumber } from "class-validator"
import { EnrollmentStatus } from "../enums/enrollmentStatus.enum"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateEnrollmentDto {
  @ApiProperty({
    description: "Student ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  studentId: string

  @ApiProperty({
    description: "Course ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  courseId: string

  @ApiPropertyOptional({
    description: "Enrollment status",
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ENROLLED,
  })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus

  @ApiPropertyOptional({
    description: "Enrollment deadline",
    example: "2023-12-31T23:59:59Z",
  })
  @IsDateString()
  @IsOptional()
  enrollmentDeadline?: Date

  @ApiPropertyOptional({
    description: "Is enrollment active",
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiPropertyOptional({
    description: "Course capacity",
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  capacity?: number
}
