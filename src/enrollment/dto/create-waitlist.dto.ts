import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsOptional } from "class-validator"

export class CreateWaitlistDto {
  @ApiProperty({ description: "Student ID associated with this waitlist position" })
  @IsNotEmpty()
  @IsString()
  studentId: string

  @ApiProperty({ description: "Course ID associated with this waitlist" })
  @IsNotEmpty()
  @IsString()
  courseId: string

  @ApiProperty({ description: "Section ID associated with this waitlist", required: false })
  @IsOptional()
  @IsString()
  sectionId?: string

  @ApiProperty({ description: "Semester ID associated with this waitlist" })
  @IsNotEmpty()
  @IsString()
  semesterId: string

  @ApiProperty({ description: "Notes related to this waitlist position", required: false })
  @IsOptional()
  @IsString()
  notes?: string
}
