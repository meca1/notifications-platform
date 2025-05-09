export interface StorageQuery {
  tableName: string;
  keyCondition?: string;
  filterCondition?: string;
  indexName?: string;
  attributes: Record<string, any>;
  limit?: number;
  startKey?: Record<string, any>;
}

export interface StorageUpdate {
  tableName: string;
  key: Record<string, any>;
  updateExpression: string;
  attributes: Record<string, any>;
}

export interface StoragePut {
  tableName: string;
  item: Record<string, any>;
}

export interface StorageGet {
  tableName: string;
  key: Record<string, any>;
}

export interface StorageResult<T> {
  items?: T[];
  item?: T;
  lastEvaluatedKey?: Record<string, any>;
}

export interface IStorageClient {
  query<T>(query: StorageQuery): Promise<StorageResult<T>>;
  update(update: StorageUpdate): Promise<void>;
  put(put: StoragePut): Promise<void>;
  get<T>(get: StorageGet): Promise<StorageResult<T>>;
} 