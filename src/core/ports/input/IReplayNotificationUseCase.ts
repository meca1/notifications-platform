import { Notification } from '../../domain/models/Notification';

export interface IReplayNotificationUseCase {
  execute(eventId: string, clientId: string): Promise<Notification>;
} 