import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsUUID } from "class-validator"

export class CreateCategoryDto {
  @ApiProperty({ description: "The name of the category" })
  @IsString()
  name: string

  @ApiProperty({ description: "The description of the category", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: "The parent category ID", required: false })
  @IsUUID()
  @IsOptional()
  parentId?: string

  tagIds?: string[]
}
