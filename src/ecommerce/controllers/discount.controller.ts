import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger"
import { Discount } from "../entities/discount.entity"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { DiscountService } from "../providers/discount.service"
import { CreateDiscountDto } from "../dto/create-ecommerce.dto"

@ApiTags("discounts")
@Controller("discounts")
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @ApiOperation({ summary: "Get all discounts" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all discounts", type: [Discount] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Discount[]> {
    return this.discountService.findAll()
  }

  @ApiOperation({ summary: 'Create a new discount' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The discount has been successfully created', type: Discount })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(@Body() createDiscountDto: CreateDiscountDto): Promise<Discount> {
    return this.discountService.create(createDiscountDto);
  }

  @ApiOperation({ summary: 'Get a discount by code' })
  @Get('code/:code')
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the discount', type: Discount })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Discount not found' })
  @ApiParam({ name: 'code', description: 'Discount code' })
  async findByCode(@Param('code') code: string): Promise<Discount> {
    return this.discountService.findByCode(code);
  }
}
