import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Gateway } from './entities/gateway.entity';
import { CreateGatewayDto, UpdateGatewayDto, GatewayFilterDto, WebhookSubscriptionDto } from './dto/gateway.dto';

@Injectable()
export class GatewayService {
  private webhookSubscriptions: Map<string, WebhookSubscriptionDto[]> = new Map();

  constructor(
    @InjectRepository(Gateway)
    private gatewayRepository: Repository<Gateway>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createGatewayDto: CreateGatewayDto): Promise<Gateway> {
    const existingGateway = await this.gatewayRepository.findOne({
      where: { endpoint: createGatewayDto.endpoint, version: createGatewayDto.version || 'v1' },
    });

    if (existingGateway) {
      throw new BadRequestException(`Gateway with endpoint ${createGatewayDto.endpoint} and version ${createGatewayDto.version || 'v1'} already exists`);
    }

    const gateway = this.gatewayRepository.create(createGatewayDto);
    const savedGateway = await this.gatewayRepository.save(gateway);
    
    // Emit event for webhooks
    this.eventEmitter.emit('gateway.created', savedGateway);
    
    return savedGateway;
  }

  async findAll(filters?: GatewayFilterDto): Promise<Gateway[]> {
    const where: any = {};
    
    if (filters) {
      if (filters.version !== undefined) {
        where.version = filters.version;
      }
      
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
    }
    
    return this.gatewayRepository.find({ where });
  }

  async findOne(id: string): Promise<Gateway> {
    const gateway = await this.gatewayRepository.findOne({ where: { id } });
    
    if (!gateway) {
      throw new NotFoundException(`Gateway with ID ${id} not found`);
    }
    
    return gateway;
  }

  async update(id: string, updateGatewayDto: UpdateGatewayDto): Promise<Gateway> {
    const gateway = await this.findOne(id);
    
    // Check if endpoint and version combination would create a duplicate
    if (updateGatewayDto.endpoint && updateGatewayDto.version) {
      const existingGateway = await this.gatewayRepository.findOne({
        where: { 
          endpoint: updateGatewayDto.endpoint, 
          version: updateGatewayDto.version,
          id: { $ne: id } // Exclude current gateway
        },
      });
      
      if (existingGateway) {
        throw new BadRequestException(`Gateway with endpoint ${updateGatewayDto.endpoint} and version ${updateGatewayDto.version} already exists`);
      }
    }
    
    const updatedGateway = { ...gateway, ...updateGatewayDto };
    const result = await this.gatewayRepository.save(updatedGateway);
    
    // Emit event for webhooks
    this.eventEmitter.emit('gateway.updated', result);
    
    return result;
  }

  async remove(id: string): Promise<void> {
    const gateway = await this.findOne(id);
    await this.gatewayRepository.remove(gateway);
    
    // Emit event for webhooks
    this.eventEmitter.emit('gateway.deleted', { id });
  }

  async subscribeToWebhook(subscription: WebhookSubscriptionDto): Promise<void> {
    if (!this.webhookSubscriptions.has(subscription.eventType)) {
      this.webhookSubscriptions.set(subscription.eventType, []);
    }
    
    const subscriptions = this.webhookSubscriptions.get(subscription.eventType);
    
    // Check if subscription already exists
    const exists = subscriptions.some(sub => sub.callbackUrl === subscription.callbackUrl);
    
    if (!exists) {
      subscriptions.push(subscription);
    } else {
      throw new BadRequestException('Webhook subscription already exists');
    }
  }

  async unsubscribeFromWebhook(eventType: string, callbackUrl: string): Promise<void> {
    if (!this.webhookSubscriptions.has(eventType)) {
      throw new NotFoundException(`No subscriptions found for event ${eventType}`);
    }
    
    const subscriptions = this.webhookSubscriptions.get(eventType);
    const index = subscriptions.findIndex(sub => sub.callbackUrl === callbackUrl);
    
    if (index === -1) {
      throw new NotFoundException(`Subscription with callback URL ${callbackUrl} not found`);
    }
    
    subscriptions.splice(index, 1);
    
    // If no more subscriptions for this event, remove the event key
    if (subscriptions.length === 0) {
      this.webhookSubscriptions.delete(eventType);
    }
  }

  getWebhookSubscriptions(eventType?: string): WebhookSubscriptionDto[] {
    if (eventType) {
      return this.webhookSubscriptions.get(eventType) || [];
    }
    
    // Return all subscriptions
    const allSubscriptions: WebhookSubscriptionDto[] = [];
    for (const [_, subscriptions] of this.webhookSubscriptions.entries()) {
      allSubscriptions.push(...subscriptions);
    }
    
    return allSubscriptions;
  }

  async markAsDeprecated(id: string, deprecationDate: Date): Promise<Gateway> {
    const gateway = await this.findOne(id);
    gateway.deprecationDate = deprecationDate;
    
    const result = await this.gatewayRepository.save(gateway);
    
    // Emit event for webhooks
    this.eventEmitter.emit('gateway.deprecated', result);
    
    return result;
  }

  async getAnalytics(): Promise<any> {
    // This would typically connect to an analytics service or database
    // For now, we'll just return some mock data
    return {
      totalGateways: await this.gatewayRepository.count(),
      activeGateways: await this.gatewayRepository.count({ where: { isActive: true } }),
      deprecatedGateways: await this.gatewayRepository.count({ where: { deprecationDate: { $ne: null } } }),
      gatewaysByVersion: await this.gatewayRepository
        .createQueryBuilder('gateway')
        .select('gateway.version, COUNT(*) as count')
        .groupBy('gateway.version')
        .getRawMany(),
    };
  }
}
