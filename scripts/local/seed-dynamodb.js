const {
  DynamoDBClient,
  PutItemCommand
} = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const fs = require('fs');
const path = require('path');

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local'
  }
});

async function insertTestData() {
  try {
    // Read the JSON file
    const dataPath = path.join(__dirname, 'notifications_events_db.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`📥 Found ${data.events.length} events to insert`);

    // Insert each event
    for (const event of data.events) {
      const params = {
        TableName: 'notification_events',
        Item: marshall(event)
      };

      await client.send(new PutItemCommand(params));
      console.log(`✅ Inserted event ${event.event_id}`);
    }

    console.log('🎉 All test data inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting test data:', error);
    process.exit(1);
  }
}

insertTestData(); 