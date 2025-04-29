import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional } from "class-validator"

export class CreateVersionDto {
  @ApiProperty({ description: "The file path or URL of this version" })
  @IsString()
  location: string

  @ApiProperty({ description: "The change notes for this version", required: false })
  @IsString()
  @IsOptional()
  changeNotes?: string
}
