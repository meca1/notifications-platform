import { Notification } from '../../domain/models/Notification';

export interface ICreateNotificationUseCase {
  execute(clientId: string, eventType: string, content: any): Promise<Notification>;
} 