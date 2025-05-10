const {
  DynamoDBClient,
  PutItemCommand
} = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local'
  }
});

const testNotification = {
  client_id: 'test-client-1',
  event_id: 'test-event-1',
  event_type: 'ORDER_CREATED',
  content: 'Test notification content',
  webhook_url: 'http://localhost:3000/webhook',
  delivery_status: 'PENDING',
  retry_count: 0,
  creation_date: new Date().toISOString(),
  delivery_date: null,
  error_message: null
};

async function insertTestData() {
  try {
    const params = {
      TableName: 'notification_events',
      Item: marshall(testNotification)
    };

    await client.send(new PutItemCommand(params));
    console.log('✅ Test data inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting test data:', error);
    process.exit(1);
  }
}

insertTestData(); 