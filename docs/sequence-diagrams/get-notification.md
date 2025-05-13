# Get Notification Flow

This diagram shows the flow for retrieving a notification by ID.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant H as GetNotificationHandler
    participant N as NotificationsTable

    C->>A: GET /notifications/{id}
    A->>H: Get notification
    H->>N: Find by eventId
    alt Not found or unauthorized
        H-->>C: 404 Not Found
    else Found and authorized
        H-->>C: 200 OK
    end
```

## Flow Description

1. **Request**
   - Client requests a specific notification by ID
   - System validates authorization

2. **Response**
   - Returns notification if found and authorized
   - Returns 404 if not found or unauthorized 