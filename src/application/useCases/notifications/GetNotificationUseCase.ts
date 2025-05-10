import { Notification } from '../../../core/domain/models/Notification';
import { NotificationNotFoundException } from '../../../core/domain/exceptions/NotificationNotFoundException';
import { IGetNotificationUseCase } from '../../../core/ports/input/IGetNotificationUseCase';
import { INotificationRepository } from '../../../core/ports/output/INotificationRepository';

export class GetNotificationUseCase implements IGetNotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(id: string, clientId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    
    if (!notification) {
      throw new NotificationNotFoundException(`Notification with id ${id} not found`);
    }
    
    // Verificación de seguridad: el cliente solo puede ver sus propias notificaciones
    if (notification.clientId !== clientId) {
      throw new NotificationNotFoundException(`Notification with id ${id} not found`);
    }
    
    return notification;
  }
}