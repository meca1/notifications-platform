import { Subscription } from '../../domain/models/Subscription';

export interface ISubscriptionRepository {
  findByClientIdAndEventType(clientId: string, eventType: string): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<void>;
} 