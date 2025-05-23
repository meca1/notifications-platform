export const env = {
  dbTable: process.env.DYNAMODB_TABLE || 'notification_events',
  region: process.env.CLOUD_REGION || 'us-east-1',
  storageEndpoint: process.env.STORAGE_ENDPOINT,
  accessKeyId: process.env.CLOUD_ACCESS_KEY_ID || 'local',
  secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY || 'local',
  sqsEndpoint: process.env.SQS_ENDPOINT || 'http://localhost:4566',
  notificationQueueUrl: process.env.NOTIFICATION_QUEUE_URL || 'http://localhost:4566/000000000000/notification-queue',
  // Agrega aquí otras variables relevantes según crezca el proyecto
}; 