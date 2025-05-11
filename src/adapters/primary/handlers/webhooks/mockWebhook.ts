import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { logger } from '../../../../lib/logger';
import { WebhookPayloadSchema } from '../../schemas/webhookSchema';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const rawBody = JSON.parse(event.body || '{}');
    
    // Validar el payload del webhook
    const validationResult = WebhookPayloadSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      logger.error('Invalid webhook payload', {
        errors: validationResult.error.errors,
        rawBody
      });
      
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid webhook payload',
          errors: validationResult.error.errors
        })
      };
    }

    const payload = validationResult.data;
    
    logger.info('Received webhook notification', {
      headers: event.headers,
      payload,
      requestContext: event.requestContext
    });

    // Simular error basado en variable de entorno
    const shouldFail = process.env.MOCK_WEBHOOK_SHOULD_FAIL === 'true';
    if (shouldFail) {
      logger.info('Simulating webhook failure', { 
        eventId: payload.eventId,
        reason: 'MOCK_WEBHOOK_SHOULD_FAIL is set to true'
      });
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Simulated webhook failure',
          error: 'MOCK_WEBHOOK_SHOULD_FAIL is set to true',
          receivedAt: new Date().toISOString(),
          data: payload
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Webhook received successfully',
        receivedAt: new Date().toISOString(),
        data: payload
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