import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class CreateMessageDto {
  @ApiProperty({
    description: "The instructor ID to send the message to",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsNotEmpty()
  @IsUUID()
  instructorId: string

  @ApiProperty({ description: "The student ID this message is about", example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsNotEmpty()
  @IsUUID()
  studentId: string

  @ApiProperty({ description: "The message subject", example: "Question about homework" })
  @IsNotEmpty()
  @IsString()
  subject: string

  @ApiProperty({
    description: "The message content",
    example: "I noticed my child is struggling with the recent math assignment...",
  })
  @IsNotEmpty()
  @IsString()
  content: string
}
