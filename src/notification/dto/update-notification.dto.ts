import { IsBoolean, IsOptional, IsDateString } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: "Mark notification as read" })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean

  @ApiPropertyOptional({ description: "Time when notification was read" })
  @IsOptional()
  @IsDateString()
  readAt?: string
}
