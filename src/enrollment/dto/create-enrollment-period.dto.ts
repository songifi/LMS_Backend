import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsDateString, IsBoolean, IsOptional, IsNumber, IsArray } from "class-validator"

export class CreateEnrollmentPeriodDto {
  @ApiProperty({ description: "Name of the enrollment period" })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({ description: "Description of the enrollment period", required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: "Start date of the enrollment period" })
  @IsNotEmpty()
  @IsDateString()
  startDate: string

  @ApiProperty({ description: "End date of the enrollment period" })
  @IsNotEmpty()
  @IsDateString()
  endDate: string

  @ApiProperty({ description: "Academic term associated with this enrollment period" })
  @IsNotEmpty()
  @IsString()
  academicTerm: string

  @ApiProperty({ description: "Academic year associated with this enrollment period" })
  @IsNotEmpty()
  @IsString()
  academicYear: string

  @ApiProperty({ description: "Whether the enrollment period is active", required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({
    description: "Priority level for this enrollment period (lower numbers have higher priority)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  priorityLevel?: number

  @ApiProperty({
    description: 'Student types eligible for this enrollment period (e.g., "undergraduate", "graduate")',
    required: false,
  })
  @IsOptional()
  @IsArray()
  eligibleStudentTypes?: string[]

  @ApiProperty({ description: "Maximum credits allowed for registration during this period", required: false })
  @IsOptional()
  @IsNumber()
  maxCredits?: number
}
