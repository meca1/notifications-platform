import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetNotificationUseCase } from '../../../../application/useCases/notifications/GetNotificationUseCase';
import { NotificationRepository } from '../../../secondary/repositories/NotificationRepository';
import { NotificationMapper } from '../../../secondary/mappers/NotificationMapper';
import { errorHandler } from '../../../../lib/errorHandler';
import { logger } from '../../../../lib/logger';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';
import { StorageConfig } from '../../../../core/ports/output/IStorageConfig';
import { UnauthorizedError } from '../../../../lib/errorHandler';
import { GetNotificationParamsSchema } from '../../schemas/notificationSchema';

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
const getNotificationUseCase = new GetNotificationUseCase(notificationRepository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Validar parámetros de la ruta
    const paramsValidation = GetNotificationParamsSchema.safeParse(event.pathParameters);
    
    if (!paramsValidation.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid path parameters',
          errors: paramsValidation.error.errors,
        }),
      };
    }

    const { id: eventId } = paramsValidation.data;

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
    
    logger.info('Getting notification', { 
      eventId,
      clientId,
      authHeader: authHeader.substring(0, 10) + '...' // Solo logueamos parte del token por seguridad
    });

    const notification = await getNotificationUseCase.execute(eventId, clientId);
    const notificationDto = NotificationMapper.toDto(notification);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: notificationDto
      })
    };
  } catch (error) {
    logger.error('Error getting notification', { 
      error,
      eventId: event.pathParameters?.id,
      clientId: event.requestContext.authorizer?.clientId,
      authHeader: event.headers.Authorization ? 'Bearer ...' : 'missing'
    });
    return errorHandler(error as Error);
  }
};