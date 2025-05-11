import { Notification } from '../../domain/models/Notification';

export interface ICreateNotificationUseCase {
  execute(clientId: string, eventId: string, eventType: string, content: string): Promise<Notification>;
} 