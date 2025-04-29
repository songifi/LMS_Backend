import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID } from "class-validator"

export class JoinSessionDto {
  @ApiProperty({
    description: "ID of the participant joining the session",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  participantId: string

  @ApiProperty({
    description: "Name of the participant",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  participantName: string
}
