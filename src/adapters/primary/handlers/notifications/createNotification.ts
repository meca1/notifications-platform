import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateNotificationUseCase } from '../../../../application/useCases/notifications/CreateNotificationUseCase';
import { NotificationRepository } from '../../../secondary/repositories/NotificationRepository';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';
import { QueueClient } from '../../../secondary/clients/queueClient';
import { logger } from '../../../../lib/logger';
import { env } from '../../../../config/env';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const region = process.env.AWS_REGION || 'us-east-1';
    const endpoint = process.env.DYNAMODB_ENDPOINT;
    const queueUrl = env.notificationQueueUrl;

    const storageClient = new CloudStorageClient({
      region,
      endpoint,
    });

    const queueClient = new QueueClient(queueUrl);
    const notificationRepository = new NotificationRepository(storageClient);
    const createNotificationUseCase = new CreateNotificationUseCase(notificationRepository, queueClient);

    const { client_id, event_type, content } = JSON.parse(event.body || '{}');

    if (!client_id || !event_type || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required fields: client_id, event_type, content',
        }),
      };
    }

    if (typeof content !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Content must be a string',
        }),
      };
    }

    const notification = await createNotificationUseCase.execute(client_id, event_type, content);

    return {
      statusCode: 201,
      body: JSON.stringify(notification),
    };
  } catch (error) {
    const { client_id, event_type, content } = JSON.parse(event.body || '{}');
    
    logger.error('Error creating notification', { 
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      client_id,
      event_type,
      content
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = error instanceof Error && error.name === 'InvalidEventTypeException' ? 400 : 500;
    
    return {
      statusCode,
      body: JSON.stringify({
        message: errorMessage,
        error: error instanceof Error ? error.name : 'UnknownError'
      }),
    };
  }
}; 