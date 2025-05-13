# Notification Replay Flow

This diagram shows the flow for replaying a failed notification.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant H as ReplayNotificationHandler
    participant N as NotificationsTable
    participant Q as SQS Queue

    C->>A: POST /notifications/{eventId}/replay
    A->>H: Replay notification
    H->>N: Get notification
    alt Notification not found
        H-->>C: 404 Not Found
    else Notification found
        alt Not client's notification
            H-->>C: 404 Not Found
        else Client's notification
            H->>N: Reset status (PENDING)
            H->>Q: Queue for retry
            H-->>C: 200 OK
        end
    end
```

## Flow Description

1. **Replay Request**
   - Client requests to replay a specific notification
   - System verifies notification exists and belongs to client
   - If not found or unauthorized, returns 404

2. **Reset & Retry**
   - System resets notification status to PENDING
   - Message is queued for reprocessing
   - Client receives success response

3. **Security**
   - Each client can only replay their own notifications
   - Unauthorized requests are rejected with 404 