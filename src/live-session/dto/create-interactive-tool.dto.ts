import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEnum, IsObject, IsBoolean, IsOptional } from "class-validator"
import { ToolType } from "../entities/interactive-tool.entity"

export class CreateInteractiveToolDto {
  @ApiProperty({
    description: "Type of interactive tool",
    enum: ToolType,
    example: ToolType.POLL,
  })
  @IsEnum(ToolType)
  type: ToolType

  @ApiProperty({
    description: "Title of the tool",
    example: "Understanding NestJS Poll",
  })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({
    description: "Configuration for the tool",
    example: {
      questions: [
        {
          text: "How familiar are you with NestJS?",
          options: ["Not at all", "Beginner", "Intermediate", "Advanced"],
        },
      ],
    },
  })
  @IsObject()
  configuration: Record<string, any>

  @ApiProperty({
    description: "Whether the tool should be active immediately",
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
