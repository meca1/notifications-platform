import { Subscription } from '../../domain/models/Subscription';

export interface ISubscriptionRepository {
  findByClientIdAndEventType(clientId: string, eventType: string): Promise<Subscription | null>;
  findByClientId(clientId: string): Promise<Subscription[]>;
  save(subscription: Subscription): Promise<void>;
  update(clientId: string, eventType: string, subscription: Partial<Subscription>): Promise<void>;
} 