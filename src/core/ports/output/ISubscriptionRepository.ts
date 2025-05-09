import { Subscription } from '../../domain/models/Subscription';

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByClientId(clientId: string): Promise<Subscription[]>;
  save(subscription: Subscription): Promise<void>;
  update(id: string, subscription: Partial<Subscription>): Promise<void>;
} 