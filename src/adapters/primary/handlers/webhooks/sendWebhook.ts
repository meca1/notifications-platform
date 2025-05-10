import { SQSEvent } from 'aws-lambda';
import { SubscriptionRepository } from '../../../secondary/repositories/SubscriptionRepository';
import { NotificationRepository } from '../../../secondary/repositories/NotificationRepository';
import { HttpWebhookClient } from '../../../secondary/clients/httpWebhookClient'
import { ExponentialBackoffRetryPolicy } from '../../../secondary/policies/ExponentialBackoffRetryPolicy';
import { DeliverNotificationUseCase } from '../../../../application/useCases/notifications/DeliverNotificationUseCase';
import { Notification } from '../../../../core/domain/models/Notification';
import { logger } from '../../../../lib/logger';
import { errorHandler } from '../../../../lib/errorHandler';
import { StorageConfig } from '../../../../core/ports/output/IStorageConfig';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';

const notificationConfig: StorageConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
};

const subscriptionConfig: StorageConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
};

const storageClient = new CloudStorageClient(notificationConfig);
const subscriptionStorageClient = new CloudStorageClient(subscriptionConfig);
const subscriptionRepository = new SubscriptionRepository(subscriptionStorageClient)
const notificationRepository = new NotificationRepository(storageClient);
const webhookClient = new HttpWebhookClient();
const retryPolicy = new ExponentialBackoffRetryPolicy();
const deliverNotificationUseCase = new DeliverNotificationUseCase(webhookClient, notificationRepository, retryPolicy);

export const handler = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const { eventId, clientId, eventType } = message;

      logger.info('Processing webhook message', { eventId, clientId, eventType });

      // Verificar suscripción
      const subscription = await subscriptionRepository.findByClientIdAndEventType(clientId, eventType);
      if (!subscription || !subscription.isActive) {
        logger.warn('No active subscription found', { clientId, eventType });
        continue;
      }

      // Obtener notificación
      let notification = await notificationRepository.findById(eventId);
      if (!notification) {
        logger.error('Notification not found', { eventId });
        continue;
      }

      // Asegurar que la notificación tenga la URL del webhook de la suscripción
      notification = new Notification(
        notification.eventId,
        notification.clientId,
        notification.eventType,
        notification.content,
        notification.creationDate,
        notification.deliveryDate,
        notification.deliveryStatus,
        subscription.webhookUrl, // Usar la URL de la suscripción
        notification.retryCount,
        notification.errorMessage
      );

      // Ejecutar caso de uso para entrega
      await deliverNotificationUseCase.execute(notification);
    }
  } catch (error) {
    logger.error('Error processing webhook', { error });
    throw errorHandler(error as Error);
  }
};