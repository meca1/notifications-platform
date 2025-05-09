export type DeliveryStatus = 'completed' | 'failed' | 'pending';

export interface Notification {
  client_id: string;
  event_id: string;
  event_type: string;
  content: string;
  creation_date: string;
  delivery_date: string;
  delivery_status: DeliveryStatus;
  webhook_url: string;
  retry_count: number;
  error_message?: string;
}

export interface NotificationDto {
  id: string;
  clientId: string;
  eventType: string;
  content: string;
  createdAt: string;
  deliveredAt: string;
  status: DeliveryStatus;
  webhookUrl: string;
  retryCount: number;
  errorMessage?: string;
}

export class NotificationMapper {
  static toDto(notification: Notification): NotificationDto {
    return {
      id: notification.event_id,
      clientId: notification.client_id,
      eventType: notification.event_type,
      content: notification.content,
      createdAt: notification.creation_date,
      deliveredAt: notification.delivery_date,
      status: notification.delivery_status,
      webhookUrl: notification.webhook_url,
      retryCount: notification.retry_count,
      errorMessage: notification.error_message
    };
  }

  static toDomain(dto: NotificationDto): Notification {
    return {
      event_id: dto.id,
      client_id: dto.clientId,
      event_type: dto.eventType,
      content: dto.content,
      creation_date: dto.createdAt,
      delivery_date: dto.deliveredAt,
      delivery_status: dto.status,
      webhook_url: dto.webhookUrl,
      retry_count: dto.retryCount,
      error_message: dto.errorMessage
    };
  }
} 