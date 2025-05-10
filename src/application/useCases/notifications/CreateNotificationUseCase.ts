import { Notification } from '../../../core/domain/models/Notification';
import { EventType } from '../../../core/domain/valueObjects/EventType';
import { DeliveryStatus } from '../../../core/domain/valueObjects/DeliveryStatus';
import { ICreateNotificationUseCase } from '../../../core/ports/input/ICreateNotificationUseCase';
import { INotificationRepository } from '../../../core/ports/output/INotificationRepository';
import { IQueueClient } from '../../../core/ports/output/IQueueClient';
import { logger } from '../../../lib/logger';
import { v4 as uuidv4 } from 'uuid';

export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private queueClient: IQueueClient
  ) {}

  async execute(clientId: string, eventType: string, content: string): Promise<Notification> {
    try {
      // Validate event type
      const validatedEventType = EventType.create(eventType);

      // Create notification with unique ID
      const notification = new Notification(
        uuidv4(),
        clientId,
        validatedEventType,
        content,
        new Date(),
        null,
        DeliveryStatus.PENDING,
        0
      );

      // Save to repository
      await this.notificationRepository.save(notification);

      // Send message to SQS queue
      await this.queueClient.sendMessage({
        eventId: notification.eventId,
        clientId: notification.clientId,
        eventType: eventType
      });

      logger.info('Notification created and queued successfully', { 
        client_id: clientId, 
        event_type: eventType,
        event_id: notification.eventId
      });
      
      return notification;
    } catch (error) {
      logger.error('Error creating notification', { client_id: clientId, event_type: eventType, error });
      throw error;
    }
  }
} 