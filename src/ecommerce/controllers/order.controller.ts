import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from "@nestjs/swagger"
import type { CreateOrderDto } from "../dto/create-order.dto"
import { Order } from "../entities/order.entity"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { OrderService } from "../providers/order.service"

@ApiTags("orders")
@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: "Get all orders for a user" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all orders for the user", type: [Order] })
  @ApiQuery({ name: "userId", required: true, description: "User ID" })
  @ApiQuery({ name: "status", required: false, description: "Filter by order status" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('userId') userId: string, @Query('status') status?: string): Promise<Order[]> {
    return this.orderService.findAllByUser(userId, status)
  }

  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The order has been successfully created', type: Order })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the order', type: Order })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }
}
