import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsEnum, IsUUID, IsOptional, IsNumber, Min } from "class-validator"
import { PaymentMethod } from "../entities/payment.entity"

export class CreatePaymentDto {
  @ApiProperty({ description: "Order ID associated with the payment" })
  @IsUUID(4)
  orderId: string

  @ApiProperty({ description: "Amount of the payment in cents", minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number

  @ApiProperty({ description: "Payment method used", enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod

  @ApiPropertyOptional({ description: "External payment provider transaction ID" })
  @IsString()
  @IsOptional()
  transactionId?: string
}
