import { Notification } from '../../domain/models/Notification';
import { DeliveryStatus } from '../../domain/valueObjects/DeliveryStatus';

export interface NotificationFilters {
  clientId: string;
  fromDate?: Date;
  toDate?: Date;
  status?: DeliveryStatus;
}

export interface INotificationRepository {
  findByEventId(eventId: string): Promise<Notification>;
  findByClientId(clientId: string, filters?: Partial<NotificationFilters>): Promise<Notification[]>;
  save(notification: Notification): Promise<void>;
  update(notification: Notification): Promise<void>;
}