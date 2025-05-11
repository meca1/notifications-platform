
# Cobre Notification Platform

  

## Description

  

The Cobre Notification Platform is a serverless solution designed to manage event-based transactional notifications in a cloud-native environment. It allows clients to subscribe to specific events (such as payments or transfers), receive notifications through webhooks, query events via a REST API, and handle automatic retries in case of delivery failures. The platform uses a hexagonal architecture (ports and adapters) to ensure modularity, scalability, and maintainability.

  

## Key Features

  

-  **Event Subscription**: Clients can subscribe to event types through a REST API, specifying webhook URLs.

-  **Notification Creation**: Automatic notification generation from transactional events.

-  **Notification Delivery**: HTTP notification delivery to client-configured webhooks.

-  **Self-Service API**: Query notifications, manage subscriptions, and resend failed notifications.

-  **Retry Handling**: Exponential backoff strategy for failed deliveries (maximum 3 attempts).

-  **Observability**: Near real-time metrics and logs for system monitoring.

-  **Security**: JWT-based authentication, HMAC signatures for notifications, and OWASP vulnerability mitigation.

  

## Architecture

  

The platform follows a hexagonal design with modular components that interact through ports and adapters. Key services include:

  

-  **API Gateway**: Entry point for HTTP requests.

-  **Authentication Service**: Verifies JWT tokens for secure access.

-  **Event Generator**: Creates notifications based on events (e.g., `POST /notification_events`).

-  **Notification Manager**: Manages notification creation, storage, and queuing.

-  **Subscription Manager**: Handles subscriptions to specific events.

-  **Database**: Stores notifications and subscriptions with indexes for efficient queries.

-  **Message Queue**: Processes notifications asynchronously.

-  **Webhook Service**: Sends notifications to external URLs.

-  **Retry Manager**: Requeues failed notifications with exponential backoff.

-  **Monitoring**: Records metrics and logs for observability.

  

For more details, see [docs/architecture.md](https://grok.com/chat/docs/architecture.md).

  

## Requirements

  

-  **Environment**: Node.js 18.x or higher.

-  **Dependencies**: Serverless Framework, TypeScript, AWS CLI configured.

-  **AWS Services**:

- DynamoDB: Notification storage (`notifications-platform-prod-notification_events`) and subscriptions (`notifications-platform-prod-subscriptions`).

- SQS: Queues for asynchronous processing (`notifications-platform-prod-notification-queue` and DLQ).

- API Gateway: REST endpoints with JWT authentication.

- Lambda: Business logic execution.

- CloudWatch: Monitoring and logs.

-  **Development Tools**:

- Jest: For unit and integration testing.

- Docker: For local environment with DynamoDB (see `docker-compose.yml`).

-  **Environment Variables**: Configure variables in `.env` (see `.env.example`).

  

## Installation

  

1. Clone the repository:

```bash

git  clone  https://github.com/cobre/notifications-platform.git

cd  notifications-platform

```

  

2. Install dependencies:

```bash

npm  install

```

  

3. Configure environment variables:

```bash

cp  .env.example  .env

```

Edit `.env` with AWS credentials and specific configurations (e.g., `NOTIFICATIONS_TABLE`, `SUBSCRIPTIONS_TABLE`, `NOTIFICATION_QUEUE_URL`).

  

4. Start local DynamoDB (optional, for development):

```bash

docker-compose  up  -d

npm  run  seed:dynamodb

```

  

5. Deploy the application to AWS:

```bash

serverless  deploy  --stage  prod

```

  

## Usage

  

### API Endpoints

  

You can find a complete Postman collection with all available endpoints here:

[Postman Collection](https://api.postman.com/collections/42445248-883a4cc7-1f2d-4aac-b128-4716bd3140ba)

  

-  **Authentication**:

-  `POST /auth/token`: Generate a JWT token.

-  **Notifications**:

-  `POST /notification_events`: Create a new notification.

-  `GET /notification_events`: List client notifications.

-  `GET /notification_events/{id}`: Get notification details.

-  `POST /notification_events/{id}/replay`: Resend a failed notification.

-  **Subscriptions**:

-  `POST /subscriptions`: Subscribe to an event type with a webhook URL.

-  **Webhooks**:

-  `POST /webhook`: Test endpoint to simulate webhook reception (mock).

  

### Subscription Creation Example

  

```bash

curl  -X  POST  https://api.cobre.com/subscriptions  \

-H "Authorization: Bearer <JWT_TOKEN>" \

-H  "Content-Type: application/json"  \

-d '{"eventType": "credit_card_payment", "webhookUrl": "https://client.com/webhook"}'

```

  

### Notification Creation Example

  

```bash

curl  -X  POST  https://api.cobre.com/notification_events  \

-H "Authorization: Bearer <JWT_TOKEN>" \

-H  "Content-Type: application/json"  \

-d '{"clientId": "client123", "eventType": "credit_card_payment", "content": "Payment of $150 received"}'

```

  

### Notification Query Example

  

```bash

curl  -X  GET  https://api.cobre.com/notification_events  \

-H "Authorization: Bearer <JWT_TOKEN>"

```

  

## Project Structure

  

```

notifications-platform/

├── .env # Environment variables

├── docs/ # Documentation

│ ├── architecture.md # Technical architecture

│ └── TECHNICAL_DECISIONS.md # Technical decisions

├── resources/ # Infrastructure definitions (DynamoDB, SQS)

├── scripts/local/ # Local environment scripts (seeding, testing)

├── src/

│ ├── adapters/ # Port implementations (handlers, repositories, clients)

│ │ ├── primary/ # API and queue handlers

│ │ └── secondary/ # Repositories and external clients

│ ├── application/ # Business logic use cases

│ ├── config/ # Configurations (environment, HTTP)

│ ├── core/ # Domain models, ports, exceptions

│ └── lib/ # Utilities (logging, error handling)

├── tests/ # Unit and integration tests

├── docker-compose.yml # Local DynamoDB configuration

├── serverless.yml # Serverless Framework configuration

├── package.json # Dependencies and scripts

└── tsconfig.json # TypeScript configuration

```

  

## Available Scripts

  

- Start tests:

```bash

npm  test

```

  

- Start local DynamoDB and load test data:

```bash

npm  run  seed:dynamodb

```

  

- Deploy to AWS:

```bash

serverless  deploy  --stage  prod

```

  

- Test endpoints locally (see `scripts/local/`):

```bash

node  scripts/local/test-notifications.js

```

  

## Local Development

  

1. Start local DynamoDB:

```bash

docker-compose  up  -d

```

  

2. Load test data:

```bash

node  scripts/local/seed-dynamodb.js

```

  

3. Run the application locally:

```bash

serverless  offline

```

  

## Contributing

  

1. Fork the repository.

2. Create a branch for your feature:

```bash

git  checkout  -b  feature/new-feature

```

  

3. Write unit tests for your changes (use Jest).

4. Submit a pull request with a clear description of the changes.

  

## Testing

  

The project uses Jest for unit and integration testing. Run:

  

```bash

npm  test

```

  

Tests cover:

  

- Use cases (`application/useCases/`).

- Models and value objects (`core/domain/`).

- Handlers and clients (`adapters/`).

  

## Deployment

  

To deploy to a specific environment:

  

```bash

serverless  deploy  --stage  <stage>

```

  

Make sure to configure AWS credentials in `~/.aws/credentials`.

  

## Monitoring

  

The platform records metrics and logs in CloudWatch, including:

  

- Successful/failed delivery rate per client.

- Webhook delivery latency.

- Number of retries per notification.

- Dead letter queue message volume.

  

## Security

  

-  **Authentication**: All requests require a JWT token (`Authorization: Bearer <token>`).

-  **Webhook Validation**: Notifications can include HMAC signatures (pending implementation in `POST /notification_events/verify`).

-  **OWASP Mitigations**:

- Strict access control through `client_id`.

- Input sanitization to prevent injections.

- Security headers in HTTP responses.

  

## Technical Decisions

  

See [docs/TECHNICAL_DECISIONS.md](./docs/TECHNICAL_DECISIONS.md) for details on architectural decisions, such as the choice of hexagonal architecture, TypeScript, and AWS.

  

## Pending Endpoints and Services

  

To complete functionality, the following are planned:

  

-  `PUT /subscriptions`: Update existing subscriptions.

-  `DELETE /subscriptions`: Cancel subscriptions.

-  `GET /subscriptions`: List active subscriptions.

-  `GET /notification_events/{id}/delivery_status`: Query delivery status.

-  `POST /notification_events/verify`: Verify notification authenticity.

- Dead letter queue (DLQ) processor for handling persistent failures.

- Metrics and dashboard service for advanced observability.

  

## License

  

This project is owned by Cobre and is protected by copyright. Contact the development team for more information.

  

## Contact

  

For support or inquiries, contact the team at `dev@cobre.com`.

  

----------

  

**Version**: 1.0

**Last Updated**: May 11, 2025