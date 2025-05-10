const {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  endpoint: 'http://dynamodb:8000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local' 
  }
});

const tableParams = {
  TableName: 'notification_events',
  BillingMode: 'PAY_PER_REQUEST',
  AttributeDefinitions: [
    { AttributeName: 'client_id', AttributeType: 'S' },
    { AttributeName: 'event_id', AttributeType: 'S' },
    { AttributeName: 'delivery_status', AttributeType: 'S' },
    { AttributeName: 'event_type', AttributeType: 'S' },
    { AttributeName: 'creation_date', AttributeType: 'S' }
  ],
  KeySchema: [
    { AttributeName: 'client_id', KeyType: 'HASH' },
    { AttributeName: 'event_id', KeyType: 'RANGE' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'StatusDateIndex',
      KeySchema: [
        { AttributeName: 'client_id', KeyType: 'HASH' },
        { AttributeName: 'delivery_status', KeyType: 'RANGE' }
      ],
      Projection: {
        ProjectionType: 'INCLUDE',
        NonKeyAttributes: [
          'creation_date',
          'delivery_date',
          'delivery_status',
          'event_type',
          'content',
          'webhook_url',
          'retry_count',
          'error_message'
        ]
      }
    },
    {
      IndexName: 'EventTypeIndex',
      KeySchema: [
        { AttributeName: 'client_id', KeyType: 'HASH' },
        { AttributeName: 'event_type', KeyType: 'RANGE' }
      ],
      Projection: {
        ProjectionType: 'INCLUDE',
        NonKeyAttributes: [
          'creation_date',
          'delivery_date',
          'delivery_status',
          'webhook_url',
          'content',
          'retry_count',
          'error_message'
        ]
      }
    },
    {
      IndexName: 'EventIdIndex',
      KeySchema: [
        { AttributeName: 'event_id', KeyType: 'HASH' }
      ],
      Projection: {
        ProjectionType: 'ALL'
      }
    },
    {
      IndexName: 'CreationDateIndex',
      KeySchema: [
        { AttributeName: 'client_id', KeyType: 'HASH' },
        { AttributeName: 'creation_date', KeyType: 'RANGE' }
      ],
      Projection: {
        ProjectionType: 'INCLUDE',
        NonKeyAttributes: [
          'delivery_status',
          'delivery_date',
          'event_type',
          'content',
          'webhook_url',
          'retry_count',
          'error_message'
        ]
      }
    }
  ]
};

async function createTableIfNotExists() {
  const tables = await client.send(new ListTablesCommand({}));
  if (tables.TableNames.includes(tableParams.TableName)) {
    console.log(`ℹ️  Table ${tableParams.TableName} already exists`);
    return;
  }
  await client.send(new CreateTableCommand(tableParams));
  console.log(`✅ Table ${tableParams.TableName} created successfully`);
}

createTableIfNotExists().catch(err => {
  console.error('❌ Error creating table:', err);
  process.exit(1);
}); 