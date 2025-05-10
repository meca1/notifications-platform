import { Notification } from '../../../core/domain/models/Notification';
import { IWebhookClient } from '../../../core/ports/output/IWebhookClient';
import { INotificationRepository } from '../../../core/ports/output/INotificationRepository';
import { IRetryPolicy } from '../../../core/ports/output/IRetryPolicy';
import { DeliveryFailedException } from '../../../core/domain/exceptions/DeliveryFailedException';
import { logger } from '../../../lib/logger';

export class DeliverNotificationUseCase {
  constructor(
    private webhookClient: IWebhookClient,
    private notificationRepository: INotificationRepository,
    private retryPolicy: IRetryPolicy
  ) {}

  async execute(notification: Notification): Promise<void> {
    try {
      logger.info('Attempting to deliver notification', { eventId: notification.eventId });

      // Enviar al webhook
      await this.webhookClient.send(notification.webhookUrl.toString(), {
        eventId: notification.eventId,
        eventType: notification.eventType.toString(),
        content: notification.content,
        creationDate: notification.creationDate.toISOString(),
      });

      // Marcar como entregado
      notification.markAsDelivered();
      await this.notificationRepository.update(notification);

      logger.info('Notification delivered successfully', { eventId: notification.eventId });
    } catch (error: unknown) {
      logger.error('Failed to deliver notification', { eventId: notification.eventId, error });

      // Incrementar contador de reintentos
      notification.incrementRetryCount();
      notification.markAsFailed(error instanceof Error ? error.message : 'Unknown error');

      // Verificar si se puede reintentar
      if (this.retryPolicy.shouldRetry(notification.retryCount)) {
        logger.info('Scheduling retry', { eventId: notification.eventId, retryCount: notification.retryCount });
        throw new DeliveryFailedException(`Retry ${notification.retryCount} scheduled for notification ${notification.eventId}`);
      } else {
        logger.error('Max retries reached', { eventId: notification.eventId });
        notification.markAsFailed('Max retries reached');
      }

      await this.notificationRepository.update(notification);
      throw new DeliveryFailedException(
        `Failed to deliver notification ${notification.eventId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}