import { IGetNotificationUseCase } from '../../core/ports/input/IGetNotificationUseCase';
import { INotificationRepository } from '../../core/ports/output/INotificationRepository';
import { NotificationDto } from '../../core/domain/models/Notification';
import { NotificationMapper } from '../../core/domain/models/Notification';

export class GetNotificationUseCase implements IGetNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: string): Promise<NotificationDto> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }
    return NotificationMapper.toDto(notification);
  }
} 