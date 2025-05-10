const axios = require('axios');

// Configurar entorno de desarrollo
process.env.NODE_ENV = 'local';

const BASE_URL = 'http://localhost:4000/local';

// Configuración de headers para simular autenticación
const headers = {
  'Authorization': 'Bearer client-001', // Token incluye el clientId
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

async function testNotificationById() {
  try {
    console.log('🧪 Starting notification by ID tests...\n');
    console.log('Using headers:', headers);

    // Test Case 1: Get existing notification (happy path)
    console.log('📋 Test Case 1: Get existing notification');
    const response1 = await axios.get(`${BASE_URL}/notification_events/EVT001`, { 
      headers,
      validateStatus: function (status) {
        return status < 500; // Resolve only if the status code is less than 500
      }
    });
    console.log('✅ Response:', JSON.stringify(response1.data, null, 2));
    console.log('-----------------------------------\n');

    // Test Case 2: Get another existing notification
    console.log('📋 Test Case 2: Get another existing notification');
    const response2 = await axios.get(`${BASE_URL}/notification_events/EVT002`, { 
      headers,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    console.log('✅ Response:', JSON.stringify(response2.data, null, 2));
    console.log('-----------------------------------\n');

    // Test Case 3: Error - Non-existent notification
    console.log('📋 Test Case 3: Error - Non-existent notification');
    try {
      await axios.get(`${BASE_URL}/notification_events/NONEXISTENT`, { 
        headers,
        validateStatus: function (status) {
          return status < 500;
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data);
    }
    console.log('-----------------------------------\n');

    // Test Case 4: Error - Invalid ID format
    console.log('📋 Test Case 4: Error - Invalid ID format');
    try {
      await axios.get(`${BASE_URL}/notification_events/invalid@id#format`, { 
        headers,
        validateStatus: function (status) {
          return status < 500;
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data);
    }
    console.log('-----------------------------------\n');

    // Test Case 5: Error - Empty ID
    console.log('📋 Test Case 5: Error - Empty ID');
    try {
      await axios.get(`${BASE_URL}/notification_events/`, { 
        headers,
        validateStatus: function (status) {
          return status < 500;
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data);
    }
    console.log('-----------------------------------\n');

    // Test Case 6: Get notification with special characters in ID
    console.log('📋 Test Case 6: Get notification with special characters in ID');
    try {
      await axios.get(`${BASE_URL}/notification_events/EVT-001_Test`, { 
        headers,
        validateStatus: function (status) {
          return status < 500;
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data);
    }
    console.log('-----------------------------------\n');

    // Test Case 7: Get notification with very long ID
    console.log('📋 Test Case 7: Get notification with very long ID');
    try {
      await axios.get(`${BASE_URL}/notification_events/${'a'.repeat(100)}`, { 
        headers,
        validateStatus: function (status) {
          return status < 500;
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data);
    }
    console.log('-----------------------------------\n');

    // Test Case 8: Error - Different client ID
    console.log('📋 Test Case 8: Error - Different client ID');
    try {
      const differentClientHeaders = {
        ...headers,
        'Authorization': 'Bearer client-002'
      };
      await axios.get(`${BASE_URL}/notification_events/EVT001`, { 
        headers: differentClientHeaders,
        validateStatus: function (status) {
          return status < 500;
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data);
    }
    console.log('-----------------------------------\n');

    // Test Case 9: Error - Missing client ID
    console.log('📋 Test Case 9: Error - Missing client ID');
    try {
      const noClientHeaders = {
        'Authorization': 'Bearer ' // Token sin clientId
      };
      await axios.get(`${BASE_URL}/notification_events/EVT001`, { 
        headers: noClientHeaders,
        validateStatus: function (status) {
          return status < 500;
        }
      });
    } catch (error) {
      console.log('✅ Expected Error:', error.response?.data);
    }
    console.log('-----------------------------------\n');

    console.log('🎉 All notification by ID tests completed successfully!');
  } catch (error) {
    console.error('❌ Unexpected error during tests:', error.response?.data || error.message);
    process.exit(1);
  }
}

testNotificationById(); 