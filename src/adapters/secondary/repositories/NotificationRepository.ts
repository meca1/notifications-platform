// src/adapters/secondary/repositories/DynamoDbNotificationRepository.ts
import { Notification } from '../../../core/domain/models/Notification';
import { INotificationRepository, NotificationFilters } from '../../../core/ports/output/INotificationRepository';
import { NotificationNotFoundException } from '../../../core/domain/exceptions/NotificationNotFoundException';
import { NotificationMapper } from '../mappers/NotificationMapper';
import { logger } from '../../../lib/logger';
import { CloudStorageClient } from '../clients/storageClient';

export class NotificationRepository implements INotificationRepository {
  private readonly storageClient: CloudStorageClient;
  private readonly tableName: string;

  constructor(storageClient: CloudStorageClient) {
    this.storageClient = storageClient;
    this.tableName = process.env.NOTIFICATIONS_TABLE || 'notification_events';
  }

  async findById(id: string): Promise<Notification> {
    try {
      const result = await this.storageClient.query<Notification>({
        tableName: this.tableName,
        indexName: 'EventIdIndex',
        keyCondition: 'event_id = :event_id',
        attributes: { ':event_id': id }
      });

      if (!result.items || result.items.length === 0) {
        throw new NotificationNotFoundException(`Notification with id ${id} not found`);
      }

      return NotificationMapper.toDomain(result.items[0]);
    } catch (error) {
      logger.error('Error finding notification by ID', { id, error });
      throw error;
    }
  }

  async findByClientId(clientId: string, filters?: Partial<NotificationFilters>): Promise<Notification[]> {
    try {
      const attributes: Record<string, any> = { ':client_id': clientId };
      let filterCondition: string | undefined;

      if (filters?.status) {
        filterCondition = 'delivery_status = :status';
        attributes[':status'] = filters.status;
      }

      if (filters?.fromDate) {
        filterCondition = filterCondition 
          ? `${filterCondition} AND creation_date >= :fromDate`
          : 'creation_date >= :fromDate';
        attributes[':fromDate'] = filters.fromDate.toISOString();
      }

      if (filters?.toDate) {
        filterCondition = filterCondition 
          ? `${filterCondition} AND creation_date <= :toDate`
          : 'creation_date <= :toDate';
        attributes[':toDate'] = filters.toDate.toISOString();
      }

      logger.info('Querying notifications', {
        tableName: this.tableName,
        clientId,
        filters,
        attributes,
        filterCondition
      });

      const result = await this.storageClient.query<Notification>({
        tableName: this.tableName,
        keyCondition: 'client_id = :client_id',
        filterCondition,
        attributes
      });

      logger.info('Query result', { 
        itemsCount: result.items?.length,
        items: result.items 
      });

      if (!result.items || result.items.length === 0) {
        return [];
      }

      return result.items.map(item => {
        logger.info('Mapping item', { item });
        return NotificationMapper.toDomain(item);
      });
    } catch (error) {
      logger.error('Error finding notifications by client ID', { clientId, filters, error });
      throw error;
    }
  }

  async save(notification: Notification): Promise<void> {
    try {
      const item = NotificationMapper.toPersistence(notification);
      await this.storageClient.put({
        tableName: this.tableName,
        item
      });
    } catch (error) {
      logger.error('Error saving notification', { notification, error });
      throw error;
    }
  }

  async update(notification: Notification): Promise<void> {
    try {
      const item = NotificationMapper.toPersistence(notification);
      const updateExpression = 'SET delivery_status = :status, delivery_date = :date, retry_count = :retries' + 
        (item.error_message ? ', error_message = :error' : '');
      
      const attributes: Record<string, any> = {
        ':status': item.delivery_status,
        ':date': item.delivery_date,
        ':retries': item.retry_count
      };

      if (item.error_message) {
        attributes[':error'] = item.error_message;
      }

      await this.storageClient.update({
        tableName: this.tableName,
        key: { 
          client_id: notification.clientId,
          event_id: notification.eventId 
        },
        updateExpression,
        attributes
      });
    } catch (error) {
      logger.error('Error updating notification', { notification, error });
      throw error;
    }
  }
}