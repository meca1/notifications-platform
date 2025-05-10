import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetNotificationUseCase } from '../../../../application/useCases/notifications/GetNotificationUseCase';
import { NotificationRepository } from '../../../secondary/repositories/NotificationRepository';
import { NotificationMapper } from '../../../secondary/mappers/NotificationMapper';
import { errorHandler } from '../../../../lib/errorHandler';
import { logger } from '../../../../lib/logger';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';
import { StorageConfig } from '../../../../core/ports/output/IStorageConfig';

// Configuración del cliente de almacenamiento
const storageConfig: StorageConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
};

// Inyección de dependencias (en un escenario real usaríamos un contenedor DI)
const storageClient = new CloudStorageClient(storageConfig);
const notificationRepository = new NotificationRepository(storageClient);
const getNotificationUseCase = new GetNotificationUseCase(notificationRepository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Getting notification by ID', { event });
    
    const notificationId = event.pathParameters?.id;
    const clientId = event.requestContext.authorizer?.claims.sub; // Asumiendo autenticación con Cognito
    
    if (!notificationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Notification ID is required' })
      };
    }
    
    if (!clientId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }
    
    const notification = await getNotificationUseCase.execute(notificationId, clientId);
    const notificationDto = NotificationMapper.toDto(notification);
    
    return {
      statusCode: 200,
      body: JSON.stringify(notificationDto)
    };
  } catch (error) {
    return errorHandler(error as Error);
  }
};