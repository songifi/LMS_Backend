import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsUUID, IsOptional, IsNumber, Min } from "class-validator"

export class CreateOrderDto {
  @ApiProperty({ description: "User ID who placed the order" })
  @IsString()
  userId: string

  @ApiProperty({ description: "Product ID associated with the order" })
  @IsUUID(4)
  productId: string

  @ApiPropertyOptional({ description: "Discount code to apply to the order" })
  @IsString()
  @IsOptional()
  discountCode?: string

  @ApiPropertyOptional({ description: "Subscription ID associated with the order" })
  @IsUUID(4)
  @IsOptional()
  subscriptionId?: string

  @ApiPropertyOptional({ description: "Tax amount in cents", minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number
}
