import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsEnum, IsOptional, IsNumber, IsDate, Min, Max, IsBoolean } from "class-validator"
import { Type } from "class-transformer"
import { DiscountType } from "../entities/discount.entity"

export class CreateDiscountDto {
  @ApiProperty({ description: "Code for the discount" })
  @IsString()
  code: string

  @ApiPropertyOptional({ description: "Description of the discount" })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: "Type of discount (percentage or fixed amount)", enum: DiscountType })
  @IsEnum(DiscountType)
  type: DiscountType

  @ApiProperty({ description: "Value of the discount (percentage or amount in cents)" })
  @IsNumber()
  @Min(0)
  @Max(100, { message: "Percentage discount cannot exceed 100%" })
  value: number

  @ApiProperty({ description: "Start date of the discount validity" })
  @IsDate()
  @Type(() => Date)
  startDate: Date

  @ApiPropertyOptional({ description: "End date of the discount validity" })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date

  @ApiPropertyOptional({ description: "Maximum number of times the discount can be used" })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxUses?: number

  @ApiPropertyOptional({ description: "Whether the discount is active" })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
