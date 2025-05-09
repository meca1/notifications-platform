import { Notification, QueryResult } from '../../domain/models/Notification';

export interface INotificationRepository {
  getByClientId(clientId: string, limit?: number, startKey?: Record<string, any>): Promise<QueryResult>;
  getByStatusAndDate(clientId: string, deliveryStatus: string, fromDate?: string, toDate?: string, limit?: number, startKey?: Record<string, any>): Promise<QueryResult>;
  getByEventId(eventId: string): Promise<Notification | null>;
  getByEventType(clientId: string, eventType: string, limit?: number, startKey?: Record<string, any>): Promise<QueryResult>;
  updateNotificationStatus(clientId: string, eventId: string, status: 'completed' | 'failed' | 'pending', errorMessage?: string): Promise<void>;
  incrementRetryCount(clientId: string, eventId: string): Promise<void>;
  createNotification(event: Notification): Promise<void>;
} 