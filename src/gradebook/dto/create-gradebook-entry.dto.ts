import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID } from "class-validator"

export class CreateGradebookEntryDto {
  @IsUUID()
  studentId: string

  @IsUUID()
  courseId: string

  @IsUUID()
  @IsOptional()
  assessmentId?: string

  @IsUUID()
  categoryId: string

  @IsNumber()
  rawScore: number

  @IsNumber()
  possiblePoints: number

  @IsUUID()
  @IsOptional()
  appliedCurveId?: string

  @IsBoolean()
  @IsOptional()
  isExcused?: boolean

  @IsBoolean()
  @IsOptional()
  isExtraCredit?: boolean

  @IsString()
  @IsOptional()
  comments?: string

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean
}
