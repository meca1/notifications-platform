const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const axios = require('axios');

// Configuración del cliente DynamoDB para local
const client = new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'subscriptions';
const API_ENDPOINT = 'http://localhost:4000/local';

// Función para crear una suscripción vía API
async function createSubscriptionAPI(clientId, eventType, webhookUrl) {
  try {
    console.log('📤 Enviando request a API:', {
      url: `${API_ENDPOINT}/subscriptions`,
      method: 'POST',
      data: { clientId, eventType, webhookUrl }
    });

    const response = await axios.post(`${API_ENDPOINT}/subscriptions`, {
      clientId,
      eventType,
      webhookUrl
    });
    console.log('✅ Suscripción creada exitosamente vía API:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear suscripción vía API:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

// Función para crear una suscripción vía DynamoDB
/*
async function createSubscriptionDynamoDB(clientId, eventType, webhookUrl) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      client_id: clientId,
      event_type: eventType,
      webhook_url: webhookUrl,
      created_at: new Date().toISOString(),
      is_active: true,
    },
  };

  try {
    await docClient.send(new PutCommand(params));
    console.log('✅ Suscripción creada exitosamente en DynamoDB');
    return params.Item;
  } catch (error) {
    console.error('❌ Error al crear suscripción en DynamoDB:', error);
    throw error;
  }
}
*/

// Función para buscar suscripciones por clientId vía DynamoDB
/*
async function findSubscriptionsByClientIdDynamoDB(clientId) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'client_id = :clientId',
    ExpressionAttributeValues: {
      ':clientId': clientId,
    },
  };

  try {
    const result = await docClient.send(new QueryCommand(params));
    console.log('✅ Suscripciones encontradas en DynamoDB:', result.Items);
    return result.Items;
  } catch (error) {
    console.error('❌ Error al buscar suscripciones en DynamoDB:', error);
    throw error;
  }
}
*/

// Función para buscar una suscripción específica vía DynamoDB
/*
async function findSubscriptionDynamoDB(clientId, eventType) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'client_id = :clientId AND event_type = :eventType',
    ExpressionAttributeValues: {
      ':clientId': clientId,
      ':eventType': eventType,
    },
  };

  try {
    const result = await docClient.send(new QueryCommand(params));
    console.log('✅ Suscripción encontrada en DynamoDB:', result.Items[0]);
    return result.Items[0];
  } catch (error) {
    console.error('❌ Error al buscar suscripción en DynamoDB:', error);
    throw error;
  }
}
*/

// Función principal de prueba
async function runTests() {
  try {
    console.log('\n🚀 Iniciando pruebas de suscripciones...\n');

    // Test 1: Crear suscripción exitosa
    console.log('📝 Test 1: Crear suscripción exitosa');
    const testClientId = 'test-client-' + Date.now();
    const testEventType = 'PAYMENT_RECEIVED';
    const testWebhookUrl = 'https://api.example.com/webhook';
    await createSubscriptionAPI(testClientId, testEventType, testWebhookUrl);

    // Test 2: Crear suscripción sin clientId
    console.log('\n📝 Test 2: Crear suscripción sin clientId');
    try {
      await createSubscriptionAPI(undefined, testEventType, testWebhookUrl);
      console.error('❌ Error: Se esperaba que fallara por clientId faltante');
    } catch (error) {
      console.log('✅ Test exitoso: API rechazó la petición sin clientId');
    }

    // Test 3: Crear suscripción sin eventType
    console.log('\n📝 Test 3: Crear suscripción sin eventType');
    try {
      await createSubscriptionAPI(testClientId, undefined, testWebhookUrl);
      console.error('❌ Error: Se esperaba que fallara por eventType faltante');
    } catch (error) {
      console.log('✅ Test exitoso: API rechazó la petición sin eventType');
    }

    // Test 4: Crear suscripción sin webhookUrl
    console.log('\n📝 Test 4: Crear suscripción sin webhookUrl');
    try {
      await createSubscriptionAPI(testClientId, testEventType, undefined);
      console.error('❌ Error: Se esperaba que fallara por webhookUrl faltante');
    } catch (error) {
      console.log('✅ Test exitoso: API rechazó la petición sin webhookUrl');
    }

    // Test 5: Crear suscripción con webhookUrl inválido
    console.log('\n📝 Test 5: Crear suscripción con webhookUrl inválido');
    try {
      await createSubscriptionAPI(testClientId, testEventType, 'not-a-url');
      console.error('❌ Error: Se esperaba que fallara por webhookUrl inválido');
    } catch (error) {
      console.log('✅ Test exitoso: API rechazó la petición con webhookUrl inválido');
    }

    // Test 6: Crear suscripción con eventType inválido
    console.log('\n📝 Test 6: Crear suscripción con eventType inválido');
    try {
      await createSubscriptionAPI(testClientId, 'INVALID_EVENT_TYPE', testWebhookUrl);
      console.error('❌ Error: Se esperaba que fallara por eventType inválido');
    } catch (error) {
      console.log('✅ Test exitoso: API rechazó la petición con eventType inválido');
    }

    // Test 7: Crear suscripción duplicada
    console.log('\n📝 Test 7: Crear suscripción duplicada');
    try {
      await createSubscriptionAPI(testClientId, testEventType, testWebhookUrl);
      console.error('❌ Error: Se esperaba que fallara por suscripción duplicada');
    } catch (error) {
      console.log('✅ Test exitoso: API rechazó la petición de suscripción duplicada');
    }

    console.log('\n✨ Todas las pruebas completadas exitosamente!\n');
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar las pruebas
runTests(); 