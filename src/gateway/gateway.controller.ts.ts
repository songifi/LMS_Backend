import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  Query, 
  UseGuards, 
  Version,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody, 
  ApiQuery,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GatewayService } from './gateway.service';
import { 
  CreateGatewayDto, 
  UpdateGatewayDto, 
  GatewayFilterDto,
  WebhookSubscriptionDto
} from './dto/gateway.dto';
import { Gateway } from './entities/gateway.entity';

@ApiTags('gateway')
@Controller({
  path: 'gateway',
  version: ['1', '2'],
})
@ApiBearerAuth()
@ApiHeader({
  name: 'x-api-key',
  description: 'API Key for rate limiting and analytics',
  required: false,
})
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post()
  @Version('1')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new gateway entry' })
  @ApiResponse({ 
    status: 201, 
    description: 'The gateway has been successfully created.',
    type: Gateway
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateGatewayDto })
  create(@Body() createGatewayDto: CreateGatewayDto): Promise<Gateway> {
    return this.gatewayService.create(createGatewayDto);
  }

  @Get()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({ summary: 'Get all gateway entries' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all gateways.',
    type: [Gateway]
  })
  @ApiQuery({ 
    name: 'version', 
    required: false, 
    description: 'Filter by API version' 
  })
  @ApiQuery({ 
    name: 'isActive', 
    required: false, 
    description: 'Filter by active status' 
  })
  findAll(@Query() filters: GatewayFilterDto): Promise<Gateway[]> {
    return this.gatewayService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a gateway by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found gateway.',
    type: Gateway
  })
  @ApiResponse({ status: 404, description: 'Gateway not found.' })
  @ApiParam({ name: 'id', description: 'Gateway ID' })
  findOne(@Param('id') id: string): Promise<Gateway> {
    return this.gatewayService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a gateway' })
  @ApiResponse({ 
    status: 200, 
    description: 'The gateway has been successfully updated.',
    type: Gateway
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Gateway not found.' })
  @ApiParam({ name: 'id', description: 'Gateway ID' })
  @ApiBody({ type: UpdateGatewayDto })
  update(
    @Param('id') id: string, 
    @Body() updateGatewayDto: UpdateGatewayDto
  ): Promise<Gateway> {
    return this.gatewayService.update(id, updateGatewayDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a gateway' })
  @ApiResponse({ status: 204, description: 'The gateway has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Gateway not found.' })
  @ApiParam({ name: 'id', description: 'Gateway ID' })
  remove(@Param('id') id: string): Promise<void> {
    return this.gatewayService.remove(id);
  }

  @Post('webhook/subscribe')
  @UseGuards(RolesGuard)
  @Roles('admin', 'integrator')
  @ApiOperation({ summary: 'Subscribe to webhook events' })
  @ApiResponse({ status: 201, description: 'Successfully subscribed to webhook.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: WebhookSubscriptionDto })
  subscribeToWebhook(@Body() subscription: WebhookSubscriptionDto): Promise<void> {
    return this.gatewayService.subscribeToWebhook(subscription);
  }

  @Delete('webhook/unsubscribe')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('admin', 'integrator')
  @ApiOperation({ summary: 'Unsubscribe from webhook events' })
  @ApiResponse({ status: 204, description: 'Successfully unsubscribed from webhook.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  @ApiQuery({ name: 'eventType', required: true, description: 'Event type' })
  @ApiQuery({ name: 'callbackUrl', required: true, description: 'Callback URL' })
  unsubscribeFromWebhook(
    @Query('eventType') eventType: string,
    @Query('callbackUrl') callbackUrl: string,
  ): Promise<void> {
    return this.gatewayService.unsubscribeFromWebhook(eventType, callbackUrl);
  }

  @Get('webhook/subscriptions')
  @UseGuards(RolesGuard)
  @Roles('admin', 'integrator')
  @ApiOperation({ summary: 'Get webhook subscriptions' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of webhook subscriptions.',
    type: [WebhookSubscriptionDto]
  })
  @ApiQuery({ 
    name: 'eventType', 
    required: false, 
    description: 'Filter by event type' 
  })
  getWebhookSubscriptions(@Query('eventType') eventType?: string): WebhookSubscriptionDto[] {
    return this.gatewayService.getWebhookSubscriptions(eventType);
  }

  @Post(':id/deprecate')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Mark a gateway as deprecated' })
  @ApiResponse({ 
    status: 200, 
    description: 'The gateway has been successfully marked as deprecated.',
    type: Gateway
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Gateway not found.' })
  @ApiParam({ name: 'id', description: 'Gateway ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        deprecationDate: {
          type: 'string',
          format: 'date',
          example: '2025-12-31',
        },
      },
    },
  })
  markAsDeprecated(
    @Param('id') id: string,
    @Body('deprecationDate') deprecationDate: Date,
  ): Promise<Gateway> {
    return this.gatewayService.markAsDeprecated(id, deprecationDate);
  }

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Get gateway usage analytics' })
  @ApiResponse({ status: 200, description: 'Gateway analytics data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getAnalytics(): Promise<any> {
    return this.gatewayService.getAnalytics();
  }

  // Version 2 specific endpoints
  @Get('health')
  @Version('2')
  @ApiOperation({ summary: 'Get gateway health status' })
  @ApiResponse({ status: 200, description: 'Gateway health status.' })
  getHealth(): any {
    return {
      status: 'healthy',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
