import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsUUID } from "class-validator"

export class CreateRegistrationDto {
  @ApiProperty({ description: "Student ID associated with this registration" })
  @IsNotEmpty()
  @IsString()
  studentId: string

  @ApiProperty({ description: "Course ID associated with this registration" })
  @IsNotEmpty()
  @IsString()
  courseId: string

  @ApiProperty({ description: "Section ID associated with this registration", required: false })
  @IsOptional()
  @IsString()
  sectionId?: string

  @ApiProperty({ description: "Program ID associated with this registration", required: false })
  @IsOptional()
  @IsString()
  programId?: string

  @ApiProperty({ description: "Semester ID associated with this registration" })
  @IsNotEmpty()
  @IsString()
  semesterId: string

  @ApiProperty({ description: "Enrollment period ID associated with this registration" })
  @IsNotEmpty()
  @IsUUID()
  enrollmentPeriodId: string

  @ApiProperty({ description: "Number of credits for this registration", required: false })
  @IsOptional()
  @IsNumber()
  credits?: number

  @ApiProperty({ description: "Notes related to this registration", required: false })
  @IsOptional()
  @IsString()
  notes?: string
}
