export const httpConfig = {
    timeout: parseInt(process.env.HTTP_TIMEOUT || '5000'), // 5 segundos
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  };