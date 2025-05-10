import { Notification } from '../../../core/domain/models/Notification';
import { IWebhookClient } from '../../../core/ports/output/IWebhookClient';
import { INotificationRepository } from '../../../core/ports/output/INotificationRepository';
import { ISubscriptionRepository } from '../../../core/ports/output/ISubscriptionRepository';
import { IRetryPolicy } from '../../../core/ports/output/IRetryPolicy';
import { DeliveryFailedException } from '../../../core/domain/exceptions/DeliveryFailedException';
import { logger } from '../../../lib/logger';

export class DeliverNotificationUseCase {
  constructor(
    private webhookClient: IWebhookClient,
    private notificationRepository: INotificationRepository,
    private subscriptionRepository: ISubscriptionRepository,
    private retryPolicy: IRetryPolicy
  ) {}

  async execute(notification: Notification): Promise<void> {
    try {
      logger.info('Attempting to deliver notification', { 
        eventId: notification.eventId,
        clientId: notification.clientId,
        eventType: notification.eventType.getValue(),
        currentStatus: notification.deliveryStatus,
        retryCount: notification.retryCount
      });

      // Buscar la suscripción para obtener el webhookUrl
      const subscription = await this.subscriptionRepository.findByClientIdAndEventType(
        notification.clientId,
        notification.eventType.getValue()
      );

      if (!subscription) {
        logger.warn('No subscription found for notification', { 
          eventId: notification.eventId,
          clientId: notification.clientId,
          eventType: notification.eventType.getValue()
        });
        
        // Marcar como fallida cuando no hay suscripción
        notification.markAsFailed('No active subscription found for this event type');
        await this.notificationRepository.update(notification);
        logger.info('Notification marked as failed due to missing subscription', {
          eventId: notification.eventId,
          status: notification.deliveryStatus
        });
        return;
      }

      logger.info('Found subscription for notification', {
        eventId: notification.eventId,
        webhookUrl: subscription.webhookUrl.getValue(),
        subscriptionActive: subscription.isActive
      });

      // Enviar al webhook
      await this.webhookClient.send(subscription.webhookUrl.getValue(), {
        eventId: notification.eventId,
        eventType: notification.eventType.getValue(),
        content: notification.content,
        creationDate: notification.creationDate.toISOString(),
      });

      // Marcar como entregado
      notification.markAsDelivered();
      await this.notificationRepository.update(notification);

      logger.info('Notification delivered successfully', { 
        eventId: notification.eventId,
        status: notification.deliveryStatus,
        deliveryDate: notification.deliveryDate
      });
    } catch (error) {
      logger.error('Failed to deliver notification', { 
        eventId: notification.eventId,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error
      });

      // Incrementar contador de reintentos
      notification.incrementRetryCount();
      notification.markAsFailed(error instanceof Error ? error.message : 'Unknown error');
      await this.notificationRepository.update(notification);

      // Lanzar excepción para que SQS maneje el reintento
      throw new DeliveryFailedException(
        `Failed to deliver notification ${notification.eventId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}