// Handler for GET /notification_events 
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetNotificationsUseCase } from '../../../../application/useCases/notifications/GetNotificationsUseCase';
import { NotificationRepository } from '../../../secondary/repositories/NotificationRepository';
import { NotificationMapper } from '../../../secondary/mappers/NotificationMapper';
import { errorHandler } from '../../../../lib/errorHandler';
import { logger } from '../../../../lib/logger';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';
import { StorageConfig } from '../../../../core/ports/output/IStorageConfig';
import { Notification } from '../../../../core/domain/models/Notification';
import { GetNotificationsQuerySchema } from '../../schemas/notificationSchema';

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
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Getting notifications', { 
      queryParams: event.queryStringParameters,
      tableName: process.env.NOTIFICATIONS_TABLE,
      storageEndpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.CLOUD_REGION
    });
    
    // Validar parámetros de consulta
    const validationResult = GetNotificationsQuerySchema.safeParse(event.queryStringParameters || {});
    
    if (!validationResult.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid query parameters',
          errors: validationResult.error.errors,
        }),
      };
    }

    const { clientId, status, fromDate, toDate } = validationResult.data;
    
    const notifications = await getNotificationsUseCase.execute(clientId, {
      status,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined
    });

    logger.info('Notifications retrieved successfully', {
      count: notifications.length,
      clientId,
      filters: {
        status,
        fromDate,
        toDate
      }
    });

    const notificationsDto = notifications.map((notification: Notification) => 
      NotificationMapper.toDto(notification)
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify(notificationsDto)
    };
  } catch (error) {
    logger.error('Error occurred while getting notifications', { 
      error,
      queryParams: event.queryStringParameters
    });
    return errorHandler(error as Error);
  }
}; 