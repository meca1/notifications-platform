import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  QueryCommand, 
  UpdateCommand, 
  PutCommand,
  GetCommand
} from '@aws-sdk/lib-dynamodb';
import { IStorageClient, StorageQuery, StorageUpdate, StoragePut, StorageGet, StorageResult } from '../../../core/ports/output/IStorageClient';
import { StorageConfig } from '../../../core/ports/output/IStorageConfig';

export class CloudStorageClient implements IStorageClient {
  private readonly client: DynamoDBClient;
  private readonly documentClient: DynamoDBDocumentClient;

  constructor(config: StorageConfig) {
    this.client = new DynamoDBClient({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.credentials,
    });

    this.documentClient = DynamoDBDocumentClient.from(this.client);
  }

  async query<T>(query: StorageQuery): Promise<StorageResult<T>> {
    const command = new QueryCommand({
      TableName: query.tableName,
      IndexName: query.indexName,
      KeyConditionExpression: query.keyCondition,
      FilterExpression: query.filterCondition,
      ExpressionAttributeValues: query.attributes,
      Limit: query.limit,
      ExclusiveStartKey: query.startKey,
    });

    const response = await this.documentClient.send(command);
    return {
      items: response.Items as T[],
      lastEvaluatedKey: response.LastEvaluatedKey,
    };
  }

  async update(update: StorageUpdate): Promise<void> {
    const command = new UpdateCommand({
      TableName: update.tableName,
      Key: update.key,
      UpdateExpression: update.updateExpression,
      ExpressionAttributeValues: update.attributes,
    });

    await this.documentClient.send(command);
  }

  async put(put: StoragePut): Promise<void> {
    const command = new PutCommand({
      TableName: put.tableName,
      Item: put.item,
    });

    await this.documentClient.send(command);
  }

  async get<T>(get: StorageGet): Promise<StorageResult<T>> {
    const command = new GetCommand({
      TableName: get.tableName,
      Key: get.key,
    });

    const response = await this.documentClient.send(command);
    return {
      item: response.Item as T,
    };
  }
} 