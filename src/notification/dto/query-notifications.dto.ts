import { IsOptional, IsBoolean, IsEnum, IsUUID, IsDateString } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { NotificationPriority } from "../enums/notificationPriority.enum"

export class QueryNotificationsDto {
  @ApiPropertyOptional({ description: "Filter by read status" })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isRead?: boolean

  @ApiPropertyOptional({ description: "Filter by notification type" })
  @IsOptional()
  @IsUUID()
  typeId?: string

  @ApiPropertyOptional({
    description: "Filter by priority",
    enum: NotificationPriority,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority

  @ApiPropertyOptional({ description: "Filter by created after date" })
  @IsOptional()
  @IsDateString()
  createdAfter?: string

  @ApiPropertyOptional({ description: "Filter by created before date" })
  @IsOptional()
  @IsDateString()
  createdBefore?: string

  @ApiPropertyOptional({ description: "Limit number of results", default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  limit?: number = 20

  @ApiPropertyOptional({ description: "Offset for pagination", default: 0 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  offset?: number = 0
}
