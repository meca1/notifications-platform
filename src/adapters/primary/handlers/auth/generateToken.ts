import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GenerateTokenUseCase } from '../../../../application/useCases/auth/GenerateTokenUseCase';
import { GenerateTokenSchema } from '../../schemas/authSchema';
import { logger } from '../../../../lib/logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const generateTokenUseCase = new GenerateTokenUseCase();
    const rawInput = JSON.parse(event.body || '{}');
    
    const validationResult = GenerateTokenSchema.safeParse(rawInput);
    
    if (!validationResult.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid input',
          errors: validationResult.error.errors,
        }),
      };
    }

    const { clientId, permissions, metadata } = validationResult.data;

    const token = await generateTokenUseCase.execute(clientId, permissions, metadata);

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      }),
    };
  } catch (error) {
    logger.error('Error generating token', { 
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      input: JSON.parse(event.body || '{}')
    });
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error generating token',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}; 