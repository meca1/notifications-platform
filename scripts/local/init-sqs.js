const { SQSClient, CreateQueueCommand, ListQueuesCommand } = require('@aws-sdk/client-sqs');

const client = new SQSClient({
  endpoint: 'http://localstack:4566',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local'
  }
});

const queueName = 'notification-queue';

async function createQueueIfNotExists() {
  const queues = await client.send(new ListQueuesCommand({}));
  if (queues.QueueUrls && queues.QueueUrls.some(url => url.endsWith(queueName))) {
    console.log(`ℹ️  Queue ${queueName} already exists`);
    return;
  }
  await client.send(new CreateQueueCommand({ QueueName: queueName }));
  console.log(`✅ Queue ${queueName} created successfully`);
}

createQueueIfNotExists().catch(err => {
  console.error('❌ Error creating queue:', err);
  process.exit(1);
}); 