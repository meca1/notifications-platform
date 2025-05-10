import { Subscription } from '../../domain/models/Subscription';

export interface ICreateSubscriptionUseCase {
  execute(clientId: string, eventType: string, webhookUrl: string): Promise<Subscription>;
}