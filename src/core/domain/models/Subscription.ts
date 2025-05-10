import { EventType } from '../valueObjects/EventType';
import { WebhookUrl } from '../valueObjects/WebhookUrl';

export class Subscription {
  constructor(
    public readonly clientId: string,
    public readonly eventType: EventType,
    public readonly webhookUrl: WebhookUrl,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly isActive: boolean = true
  ) {}
} 