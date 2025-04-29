import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsBoolean, IsUUID, IsArray } from "class-validator"

export class CreateResourceDto {
  @ApiProperty({ description: "The title of the resource" })
  @IsString()
  title: string

  @ApiProperty({ description: "The description of the resource", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: "The file path or URL of the resource" })
  @IsString()
  location: string

  @ApiProperty({ description: "The MIME type of the resource" })
  @IsString()
  mimeType: string

  @ApiProperty({ description: "The author of the resource" })
  @IsString()
  author: string

  @ApiProperty({ description: "Whether the resource is published", required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean

  @ApiProperty({ description: "The category ID of the resource" })
  @IsUUID()
  categoryId: string

  @ApiProperty({ description: "The tag IDs to associate with the resource", required: false, type: [String] })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  tagIds?: string[]
}
