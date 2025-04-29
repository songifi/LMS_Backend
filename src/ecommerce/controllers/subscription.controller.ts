import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from "@nestjs/swagger"
import type { CreateSubscriptionDto } from "../dto/create-subscription.dto"
import { Subscription } from "../entities/subscription.entity"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { SubscriptionService } from "../providers/subscription.service"

@ApiTags("subscriptions")
@Controller("subscriptions")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiOperation({ summary: "Get all subscriptions for a user" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all subscriptions for the user", type: [Subscription] })
  @ApiQuery({ name: "userId", required: true, description: "User ID" })
  @ApiQuery({ name: "status", required: false, description: "Filter by subscription status" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('userId') userId: string, @Query('status') status?: string): Promise<Subscription[]> {
    return this.subscriptionService.findAllByUser(userId, status)
  }

  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The subscription has been successfully created', type: Subscription })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @ApiOperation({ summary: 'Get a subscription by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the subscription', type: Subscription })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subscription not found' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionService.findOne(id);
  }
}
