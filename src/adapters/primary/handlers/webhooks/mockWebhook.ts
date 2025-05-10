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

    // Simular error basado en variable de entorno
    const shouldFail = process.env.MOCK_WEBHOOK_SHOULD_FAIL === 'true';
    if (shouldFail) {
      logger.info('Simulating webhook failure', { 
        eventId: body.eventId,
        reason: 'MOCK_WEBHOOK_SHOULD_FAIL is set to true'
      });
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Simulated webhook failure',
          error: 'MOCK_WEBHOOK_SHOULD_FAIL is set to true',
          receivedAt: new Date().toISOString(),
          data: body
        })
      };
    }

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