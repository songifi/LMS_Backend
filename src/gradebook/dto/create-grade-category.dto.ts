import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID } from "class-validator"

export class CreateGradeCategoryDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  weight: number

  @IsUUID()
  courseId: string

  @IsUUID()
  @IsOptional()
  parentId?: string

  @IsNumber()
  @IsOptional()
  displayOrder?: number

  @IsBoolean()
  @IsOptional()
  dropLowest?: boolean

  @IsNumber()
  @IsOptional()
  numberOfLowestToDrops?: number
}
