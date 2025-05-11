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
import { DeliveryStatus } from '../../../../core/domain/valueObjects/DeliveryStatus';
import { ValidationError } from '../../../../lib/errorHandler';

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

// Validación de parámetros
function validateQueryParameters(params: { [key: string]: string | undefined }): {
  clientId: string;
  status?: DeliveryStatus;
  fromDate?: Date;
  toDate?: Date;
} {
  const { clientId, status, fromDate, toDate } = params;

  if (!clientId) {
    throw new ValidationError('Client ID is required');
  }

  let validatedStatus: DeliveryStatus | undefined;
  if (status) {
    if (!Object.values(DeliveryStatus).includes(status as DeliveryStatus)) {
      throw new ValidationError(
        `Invalid status. Valid values are: ${Object.values(DeliveryStatus).join(', ')}`
      );
    }
    validatedStatus = status as DeliveryStatus;
  }

  const validatedFromDate = fromDate ? validateAndParseDate(fromDate, 'fromDate') : undefined;
  const validatedToDate = toDate ? validateAndParseDate(toDate, 'toDate') : undefined;

  // Validar que fromDate no sea posterior a toDate
  if (validatedFromDate && validatedToDate && validatedFromDate > validatedToDate) {
    throw new ValidationError('fromDate cannot be later than toDate');
  }

  // Validar que las fechas no sean futuras
  const now = new Date();
  if (validatedFromDate && validatedFromDate > now) {
    throw new ValidationError('fromDate cannot be in the future');
  }
  if (validatedToDate && validatedToDate > now) {
    throw new ValidationError('toDate cannot be in the future');
  }

  return {
    clientId,
    status: validatedStatus,
    fromDate: validatedFromDate,
    toDate: validatedToDate
  };
}

function validateAndParseDate(dateStr: string, paramName: string): Date {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`Invalid ${paramName} format. Use ISO 8601 format.`);
  }
  return date;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Getting notifications', { 
      queryParams: event.queryStringParameters,
      tableName: process.env.NOTIFICATIONS_TABLE,
      storageEndpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.CLOUD_REGION
    });
    
    const validatedParams = validateQueryParameters(event.queryStringParameters || {});
    
    const notifications = await getNotificationsUseCase.execute(validatedParams.clientId, {
      status: validatedParams.status,
      fromDate: validatedParams.fromDate,
      toDate: validatedParams.toDate
    });

    logger.info('Notifications retrieved successfully', {
      count: notifications.length,
      clientId: validatedParams.clientId,
      filters: {
        status: validatedParams.status,
        fromDate: validatedParams.fromDate?.toISOString(),
        toDate: validatedParams.toDate?.toISOString()
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