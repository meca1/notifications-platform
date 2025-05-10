import { INotificationRepository, NotificationFilters } from '../../../core/ports/output/INotificationRepository';
import { Notification } from '../../../core/domain/models/Notification';

export class GetNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(clientId: string, filters?: Partial<NotificationFilters>): Promise<Notification[]> {
    return this.notificationRepository.findByClientId(clientId, filters);
  }
} 