import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsUUID } from "class-validator"

enum RelationshipType {
  PARENT = "parent",
  LEGAL_GUARDIAN = "legal_guardian",
  GRANDPARENT = "grandparent",
  OTHER = "other",
}

export class CreateRelationshipDto {
  @ApiProperty({ description: "The student ID to connect with", example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsNotEmpty()
  @IsUUID()
  studentId: string

  @ApiProperty({
    description: "The relationship type",
    enum: RelationshipType,
    example: RelationshipType.PARENT,
  })
  @IsNotEmpty()
  @IsEnum(RelationshipType)
  relationshipType: RelationshipType
}
