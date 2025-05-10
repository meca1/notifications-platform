import { Subscription } from '../../../core/domain/models/Subscription';
import { EventType } from '../../../core/domain/valueObjects/EventType';
import { WebhookUrl } from '../../../core/domain/valueObjects/WebhookUrl';

export interface SubscriptionDto {
  clientId: string;
  eventType: string;
  webhookUrl: string;
  createdAt: string;
  isActive: boolean;
}

export class SubscriptionMapper {
  static toDomain(item: any): Subscription {
    return new Subscription(
      item.client_id,
      EventType.create(item.event_type),
      WebhookUrl.create(item.webhook_url),
      new Date(item.created_at),
      item.is_active
    );
  }

  static toPersistence(subscription: Subscription): any {
    return {
      client_id: subscription.clientId,
      event_type: subscription.eventType.getValue(),
      webhook_url: subscription.webhookUrl.getValue(),
      created_at: subscription.createdAt.toISOString(),
      is_active: subscription.isActive,
    };
  }

  static toDto(subscription: Subscription): SubscriptionDto {
    return {
      clientId: subscription.clientId,
      eventType: subscription.eventType.getValue(),
      webhookUrl: subscription.webhookUrl.getValue(),
      createdAt: subscription.createdAt.toISOString(),
      isActive: subscription.isActive,
    };
  }
}