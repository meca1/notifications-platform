import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Permission } from '../../../core/domain/constants/roles';
import { logger } from '../../../lib/logger';

export const checkPermission = (requiredPermission: Permission) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult | null> => {
    try {
      // Get permissions from the authorizer context
      const permissions = JSON.parse(event.requestContext.authorizer?.permissions || '[]') as string[];

      if (!permissions.includes(requiredPermission)) {
        logger.warn('Permission denied', {
          requiredPermission,
          userPermissions: permissions,
          path: event.path,
          method: event.httpMethod
        });

        return {
          statusCode: 403,
          body: JSON.stringify({
            message: 'Permission denied',
            requiredPermission
          })
        };
      }

      return null; // Continue with the request
    } catch (error) {
      logger.error('Error checking permissions', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error,
        path: event.path,
        method: event.httpMethod
      });

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error checking permissions'
        })
      };
    }
  };
}; 