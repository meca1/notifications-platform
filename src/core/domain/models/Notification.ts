// DynamoDB schema definition 

export interface Notification {
  client_id: string;
  event_id: string;
  event_type: string;
  content: string;
  creation_date: string;
  delivery_date: string;
  delivery_status: 'completed' | 'failed' | 'pending';
  webhook_url: string;
  retry_count: number;
  error_message?: string;
}

export interface NotificationKey {
  client_id: string;
  event_id: string;
}

export interface NotificationStatusKey {
  client_id: string;
  delivery_status: string;
}

export interface NotificationEventTypeKey {
  client_id: string;
  event_type: string;
}

export interface QueryResult {
  items: Notification[];
  lastEvaluatedKey?: Record<string, any>;
} 