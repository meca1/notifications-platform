import { SQSEvent } from 'aws-lambda';
import { SubscriptionRepository } from '../../../secondary/repositories/SubscriptionRepository';
import { NotificationRepository } from '../../../secondary/repositories/NotificationRepository';
import { HttpWebhookClient } from '../../../secondary/clients/httpWebhookClient'
import { ExponentialBackoffRetryPolicy } from '../../../secondary/policies/ExponentialBackoffRetryPolicy';
import { DeliverNotificationUseCase } from '../../../../application/useCases/notifications/DeliverNotificationUseCase';
import { logger } from '../../../../lib/logger';
import { errorHandler } from '../../../../lib/errorHandler';
import { StorageConfig } from '../../../../core/ports/output/IStorageConfig';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';

const storageConfig: StorageConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: undefined // Dejar que AWS SDK use las credenciales del rol IAM
};

const storageClient = new CloudStorageClient(storageConfig);
const subscriptionStorageClient = new CloudStorageClient(storageConfig);
const subscriptionRepository = new SubscriptionRepository(subscriptionStorageClient)
const notificationRepository = new NotificationRepository(storageClient);
const webhookClient = new HttpWebhookClient();
const retryPolicy = new ExponentialBackoffRetryPolicy();
const deliverNotificationUseCase = new DeliverNotificationUseCase(
  webhookClient,
  notificationRepository,
  subscriptionRepository,
  retryPolicy
);

export const handler = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const { eventId, clientId, eventType } = message;

      // Obtener la notificación
      const notification = await notificationRepository.findById(eventId);
      if (!notification) {
        logger.error('Notification not found', { eventId });
        continue;
      }

      // Intentar entregar la notificación
      await deliverNotificationUseCase.execute(notification);
    }
  } catch (error) {
    logger.error('Error processing webhook', { error });
    throw errorHandler(error as Error);
  }
};