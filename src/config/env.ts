export const env = {
  dbTable: process.env.DYNAMODB_TABLE || 'notification_events',
  region: process.env.CLOUD_REGION || 'us-east-1',
  storageEndpoint: process.env.STORAGE_ENDPOINT,
  accessKeyId: process.env.CLOUD_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY,
  // Agrega aquí otras variables relevantes según crezca el proyecto
}; 