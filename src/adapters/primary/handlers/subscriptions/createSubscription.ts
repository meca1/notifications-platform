import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateSubscriptionUseCase } from '../../../../application/useCases/subscriptions/CreateSubscriptionUseCase';
import { SubscriptionRepository } from '../../../secondary/repositories/SubscriptionRepository';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';
import { logger } from '../../../../lib/logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const region = process.env.AWS_REGION || 'us-east-1';
    const endpoint = process.env.DYNAMODB_ENDPOINT;

    const storageClient = new CloudStorageClient({
      region,
      endpoint,
    });

    const subscriptionRepository = new SubscriptionRepository(storageClient);
    const createSubscriptionUseCase = new CreateSubscriptionUseCase(subscriptionRepository);

    const { clientId, eventType, webhookUrl } = JSON.parse(event.body || '{}');

    if (!clientId || !eventType || !webhookUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required fields: clientId, eventType, webhookUrl',
        }),
      };
    }

    const subscription = await createSubscriptionUseCase.execute(clientId, eventType, webhookUrl);

    return {
      statusCode: 201,
      body: JSON.stringify(subscription),
    };
  } catch (error) {
    const { clientId, eventType, webhookUrl } = JSON.parse(event.body || '{}');
    
    logger.error('Error creating subscription', { 
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      clientId,
      eventType,
      webhookUrl
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = error instanceof Error && error.name === 'InvalidWebhookUrlException' ? 400 : 500;
    
    return {
      statusCode,
      body: JSON.stringify({
        message: errorMessage,
        error: error instanceof Error ? error.name : 'UnknownError'
      }),
    };
  }
};