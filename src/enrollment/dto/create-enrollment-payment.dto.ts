import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsUUID } from "class-validator"
import { PaymentMethod } from "../entities/enrollment-payment.entity"

export class CreateEnrollmentPaymentDto {
  @ApiProperty({ description: "Registration ID associated with this payment" })
  @IsNotEmpty()
  @IsUUID()
  registrationId: string

  @ApiProperty({ description: "Amount of the payment" })
  @IsNotEmpty()
  @IsNumber()
  amount: number

  @ApiProperty({ description: "Currency of the payment", required: false })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiProperty({ description: "Method used for payment", enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiProperty({ description: "Transaction ID from the payment processor", required: false })
  @IsOptional()
  @IsString()
  transactionId?: string

  @ApiProperty({ description: "Notes related to this payment", required: false })
  @IsOptional()
  @IsString()
  notes?: string
}
