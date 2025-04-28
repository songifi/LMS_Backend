import { IsUUID, IsEnum, IsBoolean } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { DeliveryChannel } from "../entities/notification-template.entity"

export class NotificationPreferenceDto {
  @ApiProperty({ description: "Notification type ID" })
  @IsUUID()
  typeId: string

  @ApiProperty({ description: "Delivery channel", enum: DeliveryChannel })
  @IsEnum(DeliveryChannel)
  channel: DeliveryChannel

  @ApiProperty({ description: "Whether notifications of this type are enabled" })
  @IsBoolean()
  enabled: boolean
}
