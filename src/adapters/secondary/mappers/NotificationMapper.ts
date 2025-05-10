import { Notification } from '../../../core/domain/models/Notification';
import { EventType } from '../../../core/domain/valueObjects/EventType';
import { DeliveryStatus } from '../../../core/domain/valueObjects/DeliveryStatus';

export class NotificationMapper {
  static toDomain(data: any): Notification {
    if (!data.event_type) {
      throw new Error('Event type is required');
    }

    return new Notification(
      data.event_id,
      data.client_id,
      EventType.create(data.event_type),
      data.content,
      new Date(data.creation_date),
      data.delivery_date ? new Date(data.delivery_date) : null,
      data.delivery_status as DeliveryStatus,
      data.retry_count || 0,
      data.error_message
    );
  }

  static toDto(notification: Notification): any {
    return {
      eventId: notification.eventId,
      clientId: notification.clientId,
      eventType: notification.eventType.getValue(),
      content: notification.content,
      creationDate: notification.creationDate.toISOString(),
      deliveryDate: notification.deliveryDate?.toISOString() || null,
      deliveryStatus: notification.deliveryStatus,
      retryCount: notification.retryCount,
      errorMessage: notification.errorMessage
    };
  }

  static toPersistence(notification: Notification): any {
    return {
      event_id: notification.eventId,
      client_id: notification.clientId,
      event_type: notification.eventType.getValue(),
      content: notification.content,
      creation_date: notification.creationDate.toISOString(),
      delivery_date: notification.deliveryDate?.toISOString() || null,
      delivery_status: notification.deliveryStatus,
      retry_count: notification.retryCount,
      error_message: notification.errorMessage
    };
  }
} 