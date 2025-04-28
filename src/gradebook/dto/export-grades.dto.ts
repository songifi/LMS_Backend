import { IsEnum, IsOptional, IsUUID, IsArray, IsBoolean } from "class-validator"

export class ExportGradesDto {
  @IsUUID()
  courseId: string

  @IsEnum(["csv", "excel", "pdf", "json"])
  format: "csv" | "excel" | "pdf" | "json"

  @IsArray()
  @IsOptional()
  studentIds?: string[]

  @IsArray()
  @IsOptional()
  categoryIds?: string[]

  @IsBoolean()
  @IsOptional()
  includeComments?: boolean

  @IsBoolean()
  @IsOptional()
  includeHistory?: boolean
}
