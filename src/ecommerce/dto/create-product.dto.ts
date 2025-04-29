import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, IsArray, IsUUID, Min } from "class-validator"
import { ProductType } from "../entities/product.entity"

export class CreateProductDto {
  @ApiProperty({ description: "Name of the product" })
  @IsString()
  name: string

  @ApiProperty({ description: "Description of the product" })
  @IsString()
  description: string

  @ApiProperty({ description: "Price of the product in cents", minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number

  @ApiProperty({ description: "Type of product (course or bundle)", enum: ProductType })
  @IsEnum(ProductType)
  type: ProductType

  @ApiPropertyOptional({ description: "Whether the product is available for subscription" })
  @IsBoolean()
  @IsOptional()
  isSubscribable?: boolean

  @ApiPropertyOptional({ description: "Whether the product is active" })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiPropertyOptional({ description: "IDs of products to include in the bundle", type: [String] })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  bundledProductIds?: string[]
}
