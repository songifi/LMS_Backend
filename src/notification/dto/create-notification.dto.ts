import { IsString, IsUUID, IsEnum, IsOptional, IsObject, IsDateString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { NotificationPriority } from "../enums/notificationPriority.enum"

export class CreateNotificationDto {
  @ApiProperty({ description: "User ID to send notification to" })
  @IsUUID()
  userId: string

  @ApiProperty({ description: "Notification type ID" })
  @IsUUID()
  typeId: string

  @ApiProperty({ description: "Notification title" })
  @IsString()
  title: string

  @ApiProperty({ description: "Notification message" })
  @IsString()
  message: string

  @ApiPropertyOptional({ description: "Additional data for the notification" })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>

  @ApiPropertyOptional({
    description: "Notification priority",
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority

  @ApiPropertyOptional({ description: "Expiration date for the notification" })
  @IsOptional()
  @IsDateString()
  expiresAt?: string
}
