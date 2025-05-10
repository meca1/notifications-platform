// Centralized error handling 
import { APIGatewayProxyResult } from 'aws-lambda';
import { logger } from './logger';
import { NotificationNotFoundException } from '../core/domain/exceptions/NotificationNotFoundException';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export const errorHandler = (error: Error): APIGatewayProxyResult => {
  logger.error('Error occurred', error);

  if (error instanceof ValidationError) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Validation Error',
        message: error.message
      })
    };
  }

  if (error instanceof NotificationNotFoundException) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Not Found',
        message: error.message
      })
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Unauthorized',
        message: error.message
      })
    };
  }

  // Default error response for unexpected errors
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message
    })
  };
}; 