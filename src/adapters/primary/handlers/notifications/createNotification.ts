import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateNotificationUseCase } from '../../../../application/useCases/notifications/CreateNotificationUseCase';
import { NotificationRepository } from '../../../secondary/repositories/NotificationRepository';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';
import { QueueClient } from '../../../secondary/clients/queueClient';
import { logger } from '../../../../lib/logger';
import { env } from '../../../../config/env';
import { CreateNotificationSchema } from '../../schemas/notificationSchema';

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

    const rawInput = JSON.parse(event.body || '{}');
    
    const validationResult = CreateNotificationSchema.safeParse(rawInput);
    
    if (!validationResult.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid input',
          errors: validationResult.error.errors,
        }),
      };
    }

    const { client_id, event_id, event_type, content } = validationResult.data;

    const notification = await createNotificationUseCase.execute(client_id, event_id, event_type, content);

    return {
      statusCode: 201,
      body: JSON.stringify(notification),
    };
  } catch (error) {
    const rawInput = JSON.parse(event.body || '{}');
    
    logger.error('Error creating notification', { 
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      input: rawInput
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