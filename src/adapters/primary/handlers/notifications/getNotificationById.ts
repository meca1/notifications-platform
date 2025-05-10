import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetNotificationUseCase } from '../../../../application/useCases/notifications/GetNotificationUseCase';
import { NotificationRepository } from '../../../secondary/repositories/NotificationRepository';
import { NotificationMapper } from '../../../secondary/mappers/NotificationMapper';
import { errorHandler } from '../../../../lib/errorHandler';
import { logger } from '../../../../lib/logger';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';
import { StorageConfig } from '../../../../core/ports/output/IStorageConfig';
import { UnauthorizedError } from '../../../../lib/errorHandler';

// Configuración del cliente de almacenamiento
const storageConfig: StorageConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
};

// Inyección de dependencias
const storageClient = new CloudStorageClient(storageConfig);
const notificationRepository = new NotificationRepository(storageClient);
const getNotificationUseCase = new GetNotificationUseCase(notificationRepository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Getting notification by ID', { 
      event,
      requestContext: event.requestContext,
      authorizer: event.requestContext.authorizer
    });
    
    const notificationId = event.pathParameters?.id;
    if (!notificationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Notification ID is required' })
      };
    }

    // Obtener clientId del contexto del autorizador
    const clientId = event.requestContext.authorizer?.clientId || event.requestContext.authorizer?.sub;
    logger.info('Extracted client ID from authorizer', { clientId });
    
    if (!clientId) {
      logger.error('Client ID not found in authorizer context', {
        authorizer: event.requestContext.authorizer
      });
      throw new UnauthorizedError('Client ID is required');
    }
    
    const notification = await getNotificationUseCase.execute(notificationId, clientId);
    const notificationDto = NotificationMapper.toDto(notification);
    
    return {
      statusCode: 200,
      body: JSON.stringify(notificationDto)
    };
  } catch (error) {
    logger.error('Error getting notification by ID', { error });
    return errorHandler(error as Error);
  }
};