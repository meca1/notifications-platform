import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { logger } from '../../../../lib/logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    
    logger.info('Received webhook notification', {
      headers: event.headers,
      body,
      requestContext: event.requestContext
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Webhook received successfully',
        receivedAt: new Date().toISOString(),
        data: body
      })
    };
  } catch (error) {
    logger.error('Error processing webhook', { error });
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}; 