import { IsString, IsOptional, IsEnum, IsObject, IsUUID } from "class-validator"

export class CreateGradeCurveDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(["linear", "normal", "square_root", "custom"])
  curveType: "linear" | "normal" | "square_root" | "custom"

  @IsObject()
  curveParameters: {
    mean?: number
    standardDeviation?: number
    adjustment?: number
    customFormula?: string
    additionalParams?: Record<string, any>
  }

  @IsUUID()
  @IsOptional()
  courseId?: string

  @IsUUID()
  @IsOptional()
  assessmentId?: string
}
