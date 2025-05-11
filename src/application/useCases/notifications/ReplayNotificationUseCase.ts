import { Notification } from '../../../core/domain/models/Notification';
import { NotificationNotFoundException } from '../../../core/domain/exceptions/NotificationNotFoundException';
import { IReplayNotificationUseCase } from '../../../core/ports/input/IReplayNotificationUseCase';
import { INotificationRepository } from '../../../core/ports/output/INotificationRepository';
import { IQueueClient } from '../../../core/ports/output/IQueueClient';
import { logger } from '../../../lib/logger';
import { DeliveryStatus } from '../../../core/domain/valueObjects/DeliveryStatus';

export class ReplayNotificationUseCase implements IReplayNotificationUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private queueClient: IQueueClient
  ) {}

  async execute(eventId: string, clientId: string): Promise<Notification> {
    logger.info('Starting notification replay', { eventId, clientId });

    // Obtener la notificación
    const notification = await this.notificationRepository.findByEventId(eventId);
    
    if (!notification) {
      throw new NotificationNotFoundException(`Notification with event ID ${eventId} not found`);
    }
    
    // Verificar que el cliente tenga permiso para reenviar esta notificación
    if (notification.clientId !== clientId) {
      throw new NotificationNotFoundException(`Notification with event ID ${eventId} not found`);
    }

    // Resetear el contador de reintentos y el estado
    notification.retryCount = 0;
    notification.deliveryStatus = DeliveryStatus.PENDING;
    notification.deliveryDate = null;
    notification.errorMessage = undefined;

    // Guardar los cambios
    await this.notificationRepository.update(notification);

    // Enviar a la cola SQS para procesamiento asíncrono
    await this.queueClient.sendMessage({
      eventId: notification.eventId,
      clientId: notification.clientId,
      eventType: notification.eventType.getValue()
    });

    logger.info('Notification queued for replay', { 
      eventId, 
      clientId,
      deliveryStatus: notification.deliveryStatus,
      retryCount: notification.retryCount
    });

    return notification;
  }
} 