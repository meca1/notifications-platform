# Webhook Notification Flow

This diagram shows the main flow for delivering a notification to a webhook endpoint.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant L as CreateNotificationHandler
    participant Q as SQS Queue
    participant D as DeliverNotificationHandler
    participant S as SubscriptionsTable
    participant W as Webhook Endpoint
    participant N as NotificationsTable

    C->>A: POST /notifications
    A->>L: Create notification
    L->>N: Save (PENDING)
    L->>Q: Queue message
    L-->>C: 201 Created

    Note over Q,D: Async Processing

    Q->>D: Process message
    D->>N: Get notification
    D->>S: Get subscription
    alt Has subscription
        D->>W: Send webhook
        alt Success
            D->>N: Update (DELIVERED)
        else Failure
            D->>N: Update (FAILED)
            D->>Q: Retry
        end
    else No subscription
        D->>N: Update (FAILED)
    end
```

## Flow Description

1. **Create Notification**
   - Client creates a notification
   - System saves it as PENDING
   - Message is queued for processing

2. **Process Notification**
   - System retrieves notification and subscription
   - If subscription exists:
     - Attempts to deliver to webhook
     - Updates status based on result
   - If no subscription:
     - Marks as FAILED

3. **Error Handling**
   - Failed deliveries are retried
   - All errors are logged
   - Each message is processed independently 