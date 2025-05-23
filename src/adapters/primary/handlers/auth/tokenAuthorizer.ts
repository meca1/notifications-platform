import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import { logger } from '../../../../lib/logger';
import { Role, RolePermissions } from '../../../../core/domain/constants/roles';

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    logger.info('Authorizing request', {
      methodArn: event.methodArn,
      type: event.type
    });

    const token = event.authorizationToken.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, secret) as {
      sub: string;           // Subject (client identifier)
      role?: Role;
      permissions?: string[];
      metadata?: Record<string, any>;
    };

    // Get permissions based on role if not explicitly provided
    const permissions = decoded.permissions || 
      (decoded.role ? RolePermissions[decoded.role] : []);

    logger.info('Token decoded successfully', {
      clientId: decoded.sub,
      role: decoded.role,
      permissions
    });

    return {
      principalId: decoded.sub,  // Use sub as the principal identifier
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        clientId: decoded.sub,   // Use sub as clientId in context
        role: decoded.role || 'client',
        permissions: JSON.stringify(permissions),
        metadata: JSON.stringify(decoded.metadata || {}),
      },
    };
  } catch (error) {
    logger.error('Error authorizing token', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error
    });

    throw new Error('Unauthorized');
  }
}; 