const {
  DynamoDBClient,
  ScanCommand
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local'
  }
});

async function checkTable() {
  try {
    const command = new ScanCommand({
      TableName: 'notification_events'
    });

    const response = await client.send(command);
    console.log('Table contents:', JSON.stringify(response.Items?.map(item => unmarshall(item)), null, 2));
  } catch (error) {
    console.error('Error checking table:', error);
    process.exit(1);
  }
}

checkTable(); 