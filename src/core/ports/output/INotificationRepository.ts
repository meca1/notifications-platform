import { Notification } from '../../domain/models/Notification';
import { NotificationFilters } from '../input/IListNotificationsUseCase';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findAll(filters: NotificationFilters): Promise<Notification[]>;
  save(notification: Notification): Promise<void>;
  update(id: string, notification: Partial<Notification>): Promise<void>;
} 