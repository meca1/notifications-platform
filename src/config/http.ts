export const httpConfig = {
    timeout: parseInt(process.env.HTTP_TIMEOUT || '3000'), // 3 segundos
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  };