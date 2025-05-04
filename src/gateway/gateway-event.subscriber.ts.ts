import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Gateway } from '../entities/gateway.entity';
import { GatewayService } from '../gateway.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class GatewayEventSubscriber {
  private readonly logger = new Logger(GatewayEventSubscriber.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private gatewayService: GatewayService,
  ) {}

  @OnEvent('gateway.created')
  async handleGatewayCreatedEvent(gateway: Gateway) {
    await this.dispatchWebhook('gateway.created', gateway);
    this.logger.log(`Gateway created: ${gateway.id}`);
  }

  @OnEvent('gateway.updated')
  async handleGatewayUpdatedEvent(gateway: Gateway) {
    await this.dispatchWebhook('gateway.updated', gateway);
    this.logger.log(`Gateway updated: ${gateway.id}`);
  }

  @OnEvent('gateway.deleted')
  async handleGatewayDeletedEvent(payload: { id: string }) {
    await this.dispatchWebhook('gateway.deleted', payload);
    this.logger.log(`Gateway deleted: ${payload.id}`);
  }

  @OnEvent('gateway.deprecated')
  async handleGatewayDeprecatedEvent(gateway: Gateway) {
    await this.dispatchWebhook('gateway.deprecated', gateway);
    this.logger.log(`Gateway deprecated: ${gateway.id} - Deprecation date: ${gateway.deprecationDate}`);
  }

  private async dispatchWebhook(eventType: string, payload: any): Promise<void> {
    const webhookSubscriptions = this.gatewayService.getWebhookSubscriptions(eventType);
    
    if (!webhookSubscriptions.length) {
      return;
    }

    const webhookEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      payload,
    };

    for (const subscription of webhookSubscriptions) {
      try {
        let headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // If a secret is provided, create a signature
        if (subscription.secret) {
          const signature = this.createWebhookSignature(JSON.stringify(webhookEvent), subscription.secret);
          headers['X-Webhook-Signature'] = signature;
        }

        // Send the webhook
        await firstValueFrom(
          this.httpService.post(subscription.callbackUrl, webhookEvent, { headers })
        );
        
        this.logger.log(`Webhook dispatched: ${eventType} to ${subscription.callbackUrl}`);
      } catch (error) {
        this.logger.error(`Failed to send webhook ${eventType} to ${subscription.callbackUrl}: ${error.message}`);
      }
    }
  }

  private createWebhookSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }
}
