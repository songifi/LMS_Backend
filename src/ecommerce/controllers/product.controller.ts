import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from "@nestjs/swagger"
import type { CreateProductDto } from "../dto/create-product.dto"
import { Product } from "../entities/product.entity"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { ProductService } from "../providers/product.service"

@ApiTags("products")
@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all products", type: [Product] })
  @ApiQuery({ name: "type", required: false, description: "Filter by product type" })
  @ApiQuery({ name: "isSubscribable", required: false, description: "Filter by subscribable status" })
  @Get()
  findAll(@Query('type') type?: string, @Query('isSubscribable') isSubscribable?: boolean): Promise<Product[]> {
    return this.productService.findAll({ type, isSubscribable })
  }

  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The product has been successfully created', type: Product })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the product', type: Product })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }
}
