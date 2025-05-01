import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"

enum PermissionType {
  VIEW_GRADES = "view_grades",
  VIEW_ATTENDANCE = "view_attendance",
  VIEW_ASSIGNMENTS = "view_assignments",
  CONTACT_INSTRUCTORS = "contact_instructors",
  RECEIVE_NOTIFICATIONS = "receive_notifications",
}

export class UpdatePermissionDto {
  @ApiProperty({ description: "The relationship ID", example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsNotEmpty()
  @IsUUID()
  relationshipId: string

  @ApiProperty({
    description: "The permission type",
    enum: PermissionType,
    example: PermissionType.VIEW_GRADES,
  })
  @IsNotEmpty()
  @IsEnum(PermissionType)
  permissionType: PermissionType

  @ApiProperty({ description: "Whether the permission is granted", example: true })
  @IsNotEmpty()
  @IsBoolean()
  isGranted: boolean

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
