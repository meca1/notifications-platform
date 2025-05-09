import { Notification } from '../../domain/models/Notification';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findAll(filters?: any): Promise<Notification[]>;
  save(notification: Notification): Promise<void>;
  update(id: string, notification: Partial<Notification>): Promise<void>;
} 