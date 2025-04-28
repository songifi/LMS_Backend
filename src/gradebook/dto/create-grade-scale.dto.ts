import { IsString, IsOptional, IsBoolean, IsUUID, IsArray, ValidateNested, IsNumber } from "class-validator"
import { Type } from "class-transformer"

class ScaleEntryDto {
  @IsString()
  letter: string

  @IsNumber()
  lowerBound: number

  @IsNumber()
  upperBound: number

  @IsNumber()
  @IsOptional()
  gpaValue?: number
}

export class CreateGradeScaleDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScaleEntryDto)
  scaleData: ScaleEntryDto[]

  @IsUUID()
  @IsOptional()
  courseId?: string

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}
