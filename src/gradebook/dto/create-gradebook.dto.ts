import { IsBoolean, IsNumber, IsOptional, IsUUID } from "class-validator"

export class CreateGradebookDto {
  @IsUUID()
  courseId: string

  @IsUUID()
  gradeScaleId: string

  @IsBoolean()
  @IsOptional()
  allowDropLowest?: boolean

  @IsBoolean()
  @IsOptional()
  showLetterGrades?: boolean

  @IsBoolean()
  @IsOptional()
  showPercentages?: boolean

  @IsBoolean()
  @IsOptional()
  allowExtraCredit?: boolean

  @IsNumber()
  @IsOptional()
  maxExtraCreditPercentage?: number

  @IsBoolean()
  @IsOptional()
  isWeighted?: boolean
}
