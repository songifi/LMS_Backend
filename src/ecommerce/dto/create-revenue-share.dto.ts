import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsUUID, IsNumber, IsBoolean, IsOptional, Min, Max } from "class-validator"

export class CreateRevenueShareDto {
  @ApiProperty({ description: "Product ID associated with the revenue share" })
  @IsUUID(4)
  productId: string

  @ApiProperty({ description: "Instructor ID who receives the revenue share" })
  @IsString()
  instructorId: string

  @ApiProperty({ description: "Percentage of revenue shared with the instructor", minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number

  @ApiPropertyOptional({ description: "Whether the revenue share is active" })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
