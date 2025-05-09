import { IStorageClient } from '../../../core/ports/output/IStorageClient';
import { Notification, QueryResult } from '../../../core/domain/models/Notification';
import { env } from '../../../config/env';

export class NotificationRepository {
  private readonly tableName: string;

  constructor(private readonly storageClient: IStorageClient) {
    this.tableName = env.dbTable;
  }

  // 1. Obtener todas las notificaciones de un cliente
  async getByClientId(clientId: string, limit?: number, startKey?: Record<string, any>): Promise<QueryResult> {
    const result = await this.storageClient.query<Notification>({
      tableName: this.tableName,
      keyCondition: 'client_id = :clientId',
      attributes: { ':clientId': clientId },
      limit,
      startKey,
    });
    return { items: result.items || [], lastEvaluatedKey: result.lastEvaluatedKey };
  }

  // 2. Filtrar por estado de entrega y fecha (StatusDateIndex)
  async getByStatusAndDate(clientId: string, deliveryStatus: string, fromDate?: string, toDate?: string, limit?: number, startKey?: Record<string, any>): Promise<QueryResult> {
    const filterCondition = fromDate && toDate ? 'delivery_date BETWEEN :fromDate AND :toDate' : undefined;
    const attributes: Record<string, any> = {
      ':clientId': clientId,
      ':status': deliveryStatus,
      ...(fromDate && { ':fromDate': fromDate }),
      ...(toDate && { ':toDate': toDate }),
    };
    const result = await this.storageClient.query<Notification>({
      tableName: this.tableName,
      indexName: 'StatusDateIndex',
      keyCondition: 'client_id = :clientId AND delivery_status = :status',
      filterCondition,
      attributes,
      limit,
      startKey,
    });
    return { items: result.items || [], lastEvaluatedKey: result.lastEvaluatedKey };
  }

  // 3. Obtener un evento específico por su ID (EventIdIndex)
  async getByEventId(eventId: string): Promise<Notification | null> {
    const result = await this.storageClient.query<Notification>({
      tableName: this.tableName,
      indexName: 'EventIdIndex',
      keyCondition: 'event_id = :eventId',
      attributes: { ':eventId': eventId },
      limit: 1,
    });
    return result.items && result.items.length > 0 ? result.items[0] : null;
  }

  // 4. Consultar eventos de un tipo específico (EventTypeIndex)
  async getByEventType(clientId: string, eventType: string, limit?: number, startKey?: Record<string, any>): Promise<QueryResult> {
    const result = await this.storageClient.query<Notification>({
      tableName: this.tableName,
      indexName: 'EventTypeIndex',
      keyCondition: 'client_id = :clientId AND event_type = :eventType',
      attributes: { ':clientId': clientId, ':eventType': eventType },
      limit,
      startKey,
    });
    return { items: result.items || [], lastEvaluatedKey: result.lastEvaluatedKey };
  }

  // Métodos de escritura y actualización (puedes mantener los que ya tienes)
  async updateNotificationStatus(
    clientId: string,
    eventId: string,
    status: 'completed' | 'failed' | 'pending',
    errorMessage?: string
  ): Promise<void> {
    await this.storageClient.update({
      tableName: this.tableName,
      key: { client_id: clientId, event_id: eventId },
      updateExpression: 'SET delivery_status = :status, delivery_date = :date, error_message = :error',
      attributes: {
        ':status': status,
        ':date': new Date().toISOString(),
        ':error': errorMessage || null,
      },
    });
  }

  async incrementRetryCount(clientId: string, eventId: string): Promise<void> {
    await this.storageClient.update({
      tableName: this.tableName,
      key: { client_id: clientId, event_id: eventId },
      updateExpression: 'SET retry_count = retry_count + :inc',
      attributes: { ':inc': 1 },
    });
  }

  async createNotification(event: Notification): Promise<void> {
    await this.storageClient.put({
      tableName: this.tableName,
      item: {
        ...event,
        creation_date: new Date().toISOString(),
        delivery_date: new Date().toISOString(),
        retry_count: 0,
      },
    });
  }
} 