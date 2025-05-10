import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, StatementEffect } from 'aws-lambda';
import { logger } from '../../../../lib/logger';

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    logger.info('Authorizing request', { 
      authorizationToken: event.authorizationToken,
      methodArn: event.methodArn,
      type: event.type
    });

    // Extract token from Authorization header
    const token = event.authorizationToken;
    if (!token || !token.startsWith('Bearer ')) {
      logger.error('Invalid token format', { token });
      throw new Error('Invalid token format');
    }

    // Extract client ID from token
    const clientId = token.split(' ')[1];
    if (!clientId) {
      logger.error('Client ID not found in token', { token });
      throw new Error('Client ID is required');
    }

    logger.info('Authorization successful', { clientId });

    // Generate policy
    const policy: APIGatewayAuthorizerResult = {
      principalId: clientId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow' as StatementEffect,
            Resource: event.methodArn
          }
        ]
      },
      context: {
        sub: clientId,
        clientId: clientId
      }
    };

    logger.info('Generated policy', { policy });
    return policy;
  } catch (error) {
    logger.error('Authorization failed', { error });
    throw new Error('Unauthorized');
  }
}; 