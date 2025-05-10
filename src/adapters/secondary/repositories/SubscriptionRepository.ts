import { Subscription } from '../../../core/domain/models/Subscription';
import { ISubscriptionRepository } from '../../../core/ports/output/ISubscriptionRepository';
import { SubscriptionMapper } from '../mappers/SubscriptionMapper';
import { logger } from '../../../lib/logger';
import { CloudStorageClient } from '../clients/storageClient';
import { StorageConfig } from '../../../core/ports/output/IStorageConfig';

export class SubscriptionRepository implements ISubscriptionRepository {
  private readonly storageClient: CloudStorageClient;
  private readonly tableName: string;

  constructor(storageClient: CloudStorageClient) {
    this.storageClient = storageClient;
    this.tableName = process.env.SUBSCRIPTIONS_TABLE || 'subscriptions';
  }

  async findByClientIdAndEventType(clientId: string, eventType: string): Promise<Subscription | null> {
    try {
      const result = await this.storageClient.query({
        tableName: this.tableName,
        keyCondition: 'client_id = :clientId AND event_type = :eventType',
        attributes: {
          ':clientId': clientId,
          ':eventType': eventType,
        },
      });

      if (!result.items || result.items.length === 0) {
        return null;
      }

      return SubscriptionMapper.toDomain(result.items[0]);
    } catch (error) {
      logger.error('Error finding subscription', { clientId, eventType, error });
      throw error;
    }
  }

  async findByClientId(clientId: string): Promise<Subscription[]> {
    try {
      const result = await this.storageClient.query({
        tableName: this.tableName,
        keyCondition: 'client_id = :clientId',
        attributes: {
          ':clientId': clientId,
        },
      });

      if (!result.items) {
        return [];
      }

      return result.items.map(item => SubscriptionMapper.toDomain(item));
    } catch (error) {
      logger.error('Error finding subscriptions by client', { clientId, error });
      throw error;
    }
  }

  async save(subscription: Subscription): Promise<void> {
    try {
      const item = SubscriptionMapper.toPersistence(subscription);
      await this.storageClient.put({
        tableName: this.tableName,
        item,
      });
    } catch (error) {
      logger.error('Error saving subscription', { subscription, error });
      throw error;
    }
  }

  async update(clientId: string, eventType: string, subscription: Partial<Subscription>): Promise<void> {
    try {
      const updateExpression = Object.keys(subscription)
        .map(key => `#${key} = :${key}`)
        .join(', ');

      const expressionAttributeNames = Object.keys(subscription).reduce((acc, key) => ({
        ...acc,
        [`#${key}`]: key,
      }), {});

      const expressionAttributeValues = Object.entries(subscription).reduce((acc, [key, value]) => ({
        ...acc,
        [`:${key}`]: value,
      }), {});

      await this.storageClient.update({
        tableName: this.tableName,
        key: {
          client_id: clientId,
          event_type: eventType,
        },
        updateExpression: `SET ${updateExpression}`,
        attributes: {
          ...expressionAttributeValues,
        },
      });
    } catch (error) {
      logger.error('Error updating subscription', { clientId, eventType, subscription, error });
      throw error;
    }
  }
}