// Handler for POST /notification_events/{id}/replay 
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ReplayNotificationUseCase } from '../../../../application/useCases/notifications/ReplayNotificationUseCase';
import { NotificationRepository } from '../../../secondary/repositories/NotificationRepository';
import { NotificationMapper } from '../../../secondary/mappers/NotificationMapper';
import { errorHandler } from '../../../../lib/errorHandler';
import { logger } from '../../../../lib/logger';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';
import { StorageConfig } from '../../../../core/ports/output/IStorageConfig';
import { UnauthorizedError } from '../../../../lib/errorHandler';
import { QueueClient } from '../../../secondary/clients/queueClient';
import { env } from '../../../../config/env';

// Configuración del cliente de almacenamiento
const region = process.env.AWS_REGION || 'us-east-1';
const endpoint = process.env.DYNAMODB_ENDPOINT;

const storageConfig: StorageConfig = {
  region,
  endpoint,
};

// Inyección de dependencias
const storageClient = new CloudStorageClient(storageConfig);
const notificationRepository = new NotificationRepository(storageClient);
const queueClient = new QueueClient(env.notificationQueueUrl);
const replayNotificationUseCase = new ReplayNotificationUseCase(
  notificationRepository,
  queueClient
);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const eventId = event.pathParameters?.id;
    if (!eventId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Notification ID is required',
          error: 'VALIDATION_ERROR'
        })
      };
    }

    // Obtener y validar el token de autorización
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Valid Bearer token is required');
    }

    // Obtener clientId del contexto del autorizador
    const clientId = event.requestContext.authorizer?.clientId || event.requestContext.authorizer?.sub;
    if (!clientId || clientId === 'YOUR_AUTH_TOKEN') {
      throw new UnauthorizedError('Valid client ID is required');
    }
    
    logger.info('Replaying notification', { 
      eventId,
      clientId,
      authHeader: authHeader.substring(0, 10) + '...' // Solo logueamos parte del token por seguridad
    });

    const notification = await replayNotificationUseCase.execute(eventId, clientId);
    const notificationDto = NotificationMapper.toDto(notification);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: notificationDto,
        message: 'Notification queued for replay'
      })
    };
  } catch (error) {
    logger.error('Error replaying notification', { 
      error,
      eventId: event.pathParameters?.id,
      clientId: event.requestContext.authorizer?.clientId,
      authHeader: event.headers.Authorization ? 'Bearer ...' : 'missing'
    });
    return errorHandler(error as Error);
  }
}; 