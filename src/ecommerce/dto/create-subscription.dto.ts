import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsEnum, IsUUID, IsOptional, IsDate, IsNumber, Min } from "class-validator"
import { BillingPeriod } from "../entities/subscription.entity"
import { Type } from "class-transformer"

export class CreateSubscriptionDto {
  @ApiProperty({ description: "User ID who owns the subscription" })
  @IsString()
  userId: string

  @ApiProperty({ description: "Product ID associated with the subscription" })
  @IsUUID(4)
  productId: string

  @ApiProperty({ description: "Billing period for the subscription", enum: BillingPeriod })
  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod

  @ApiPropertyOptional({ description: "Price of the subscription in cents", minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number

  @ApiPropertyOptional({ description: "Start date of the subscription" })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date

  @ApiPropertyOptional({ description: "External payment provider subscription ID" })
  @IsString()
  @IsOptional()
  externalSubscriptionId?: string
}
