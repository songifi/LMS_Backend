import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsUUID, IsArray, IsInt, Min, Max } from "class-validator"
import { Type } from "class-transformer"

export class SearchResourceDto {
  @ApiProperty({ description: "Search query for title and description", required: false })
  @IsString()
  @IsOptional()
  query?: string

  @ApiProperty({ description: "Filter by category IDs", required: false, type: [String] })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  categoryIds?: string[]

  @ApiProperty({ description: "Filter by tag IDs", required: false, type: [String] })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  tagIds?: string[]

  @ApiProperty({ description: "Filter by author", required: false })
  @IsString()
  @IsOptional()
  author?: string

  @ApiProperty({ description: "Page number for pagination", required: false, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1

  @ApiProperty({ description: "Items per page for pagination", required: false, default: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10
}
