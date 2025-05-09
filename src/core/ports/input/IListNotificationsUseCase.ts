import { NotificationDto } from '../../domain/models/Notification';

export interface NotificationFilters {
  clientId?: string;
  eventType?: string;
  deliveryStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface IListNotificationsUseCase {
  execute(filters: NotificationFilters): Promise<NotificationDto[]>;
} 