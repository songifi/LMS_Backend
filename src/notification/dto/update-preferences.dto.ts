import { IsArray, ValidateNested, ArrayMinSize } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { NotificationPreferenceDto } from "./notification-preference.dto"

export class UpdatePreferencesDto {
  @ApiProperty({
    description: "Array of notification preferences",
    type: [NotificationPreferenceDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => NotificationPreferenceDto)
  preferences: NotificationPreferenceDto[]
}
