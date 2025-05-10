const axios = require('axios');

const BASE_URL = 'http://localhost:4000/local';

async function testNotifications() {
  try {
    console.log('🧪 Starting notification tests...\n');

    // Test Case 1: Get all notifications for a client
    console.log('📋 Test Case 1: Get all notifications for client-001');
    const response1 = await axios.get(`${BASE_URL}/notification_events?clientId=client-001`);
    console.log('✅ Response:', JSON.stringify(response1.data, null, 2));
    console.log('-----------------------------------\n');

    // Test Case 2: Get notifications with date filter
    console.log('📋 Test Case 2: Get notifications after specific date');
    const response2 = await axios.get(`${BASE_URL}/notification_events?clientId=client-001&fromDate=2024-03-15T10:00:00Z`);
    console.log('✅ Response:', JSON.stringify(response2.data, null, 2));
    console.log('-----------------------------------\n');

    // Test Case 3: Get notifications with status filter
    console.log('📋 Test Case 3: Get notifications with pending status');
    const response3 = await axios.get(`${BASE_URL}/notification_events?clientId=client-001&status=pending`);
    console.log('✅ Response:', JSON.stringify(response3.data, null, 2));
    console.log('-----------------------------------\n');

    // Test Case 4: Get notifications with both date and status filters
    console.log('📋 Test Case 4: Get notifications with both date and status filters');
    const response4 = await axios.get(
      `${BASE_URL}/notification_events?clientId=client-001&fromDate=2024-03-15T09:00:00Z&toDate=2024-03-15T11:00:00Z&status=failed`
    );
    console.log('✅ Response:', JSON.stringify(response4.data, null, 2));
    console.log('-----------------------------------\n');

    // Test Case 5: Get notifications for a different client
    console.log('📋 Test Case 5: Get notifications for client-002');
    const response5 = await axios.get(`${BASE_URL}/notification_events?clientId=client-002`);
    console.log('✅ Response:', JSON.stringify(response5.data, null, 2));
    console.log('-----------------------------------\n');

    // Test Case 6: Get notifications with completed status
    console.log('📋 Test Case 6: Get notifications with completed status');
    const response6 = await axios.get(`${BASE_URL}/notification_events?clientId=client-002&status=completed`);
    console.log('✅ Response:', JSON.stringify(response6.data, null, 2));
    console.log('-----------------------------------\n');

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Error during tests:', error.response?.data || error.message);
    process.exit(1);
  }
}

testNotifications(); 