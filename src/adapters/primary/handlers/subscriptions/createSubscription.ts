import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateSubscriptionUseCase } from '../../../../application/useCases/subscriptions/CreateSubscriptionUseCase';
import { SubscriptionRepository } from '../../../secondary/repositories/SubscriptionRepository';
import { CloudStorageClient } from '../../../secondary/clients/storageClient';
import { logger } from '../../../../lib/logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const region = process.env.AWS_REGION || 'us-east-1';
    const endpoint = process.env.DYNAMODB_ENDPOINT;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are required');
    }

    const storageClient = new CloudStorageClient({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
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
    logger.error('Error creating subscription', { error });
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};