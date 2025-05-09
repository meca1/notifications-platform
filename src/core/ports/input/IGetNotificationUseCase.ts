import { NotificationDto } from '../../domain/models/Notification';

export interface IGetNotificationUseCase {
  execute(id: string): Promise<NotificationDto>;
} 