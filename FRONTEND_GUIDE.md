# Frontend Integration & Developer Guide

This guide details how to integrate and communicate with the CollabSpace Backend Service using both REST HTTP APIs and SignalR WebSocket connections.

---

## 🔗 Endpoint URLs & Base Config

- **Base URL (Local Dev)**: `http://localhost:5153`
- **SignalR Hub (Local Dev)**: `http://localhost:5153/chathub`
- **Swagger Documentation**: `http://localhost:5153/swagger`

---

## 🔐 Authentication Flow

CollabSpace utilizes JSON Web Tokens (JWT) for authentication with short-lived access tokens and longer-lived refresh tokens.

### 1. Register & Login
Use `/api/auth/register` and `/api/auth/login`. On successful login, the API returns the following response:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "username": "johndoe",
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "7Q2v1B9...",
  "expiresInMinutes": 720,
  "emailConfirmed": true
}
```

Store the `accessToken` in transient memory (e.g. state) and the `refreshToken` in secure persistent storage (e.g. Secure HTTP-Only cookies, Flutter Secure Storage, or local storage depending on application security policies).

### 2. Attaching the JWT
Every authenticated request must include the JWT in the `Authorization` header:
```http
Authorization: Bearer <your_access_token>
```

### 3. Token Refresh
When a request fails with a `411 Token Expired` indicator (look for the header `Token-Expired: true` on a `401 Unauthorized` response), invoke `/api/auth/refresh` immediately:

**POST** `/api/auth/refresh`
```json
{
  "refreshToken": "7Q2v1B9..."
}
```
If valid, this returns a fresh `LoginResponseDto` containing new access and refresh tokens.

---

## ⚠️ Standard Error Handling Schema (RFC 7807)

The API returns failures in the standard **RFC 7807 Problem Details** format. If a request is malformed, has invalid values, or fails business logic validation:

### General API Error Response:
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "detail": "Failed to perform action.",
  "instance": "/api/auth/login",
  "errors": [
    {
      "code": "Auth.InvalidCredentials",
      "message": "Invalid username or password."
    }
  ]
}
```

### Form Field Validation Errors (e.g., from ASP.NET model validation):
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "The request body contains invalid JSON or an incorrectly formatted GUID...",
  "errors": {
    "Email": ["The Email field is required."],
    "Password": ["The Password field must be at least 6 characters."]
  }
}
```

Always check if the `errors` property is an array of objects `{code, message}` or a dictionary mapping field names to validation messages.

---

## 📄 Pagination Models

The API uses two types of pagination depending on the endpoint:

### 1. Offset Pagination (`PagedResponse<T>`)
Used for channels, memberships, and lists.
Request params: `page` (default 1) and `pageSize` (default 10).

**Response Schema:**
```json
{
  "data": [ ... ],
  "meta": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalRecords": 25,
    "totalPages": 3
  }
}
```

### 2. Cursor Pagination (`CursorResponse<T>`)
Used for chat history and notifications to handle active, real-time message streams cleanly.
Request params: `before` (Guid/cursor, optional) and `limit` (int, default 50).

**Response Schema:**
```json
{
  "data": [ ... ],
  "meta": {
    "nextCursor": "d608ee8f-...",
    "hasNextPage": true
  }
}
```
If `hasNextPage` is `true`, pass `nextCursor` value into the next request query parameter `?before=<nextCursor>` to retrieve older items.

---

## 📁 Request Content Types: JSON vs Multipart Form-Data

CollabSpace API accepts payloads differently depending on the action:

1. **Standard Actions**: Always send as `application/json` (e.g., login, updates, text-only chat messages).
2. **File Uploads**: Must be sent as `multipart/form-data`.
   
### Sending Chat Messages (REST Fallback)
The API accepts **both** JSON and Form-Data at `POST /api/spaces/{id}/channels/{channelId}/messages`.

- **JSON Format (`application/json`)**: For text-only messages.
  ```json
  {
    "text": "Hello, team!",
    "parentId": null,
    "attachmentFileIds": [],
    "attachmentUrls": []
  }
  ```
- **Form-Data Format (`multipart/form-data`)**: Required when attaching new files directly.
  - Set `Content-Type: multipart/form-data` (allow your framework to generate the boundary parameter automatically; **do not** write the `Content-Type` header manually without it).
  - Add text fields: `Text`, `ParentId`, `AttachmentFileIds` (array), `AttachmentUrls` (array).
  - Append files into the `Files` key.

---

## 📡 SignalR Real-Time Hub Integration

### Hub Connection Details
- **Route**: `/chathub`
- **Auth Strategy**: WebSockets do not support custom HTTP headers in browsers. The JWT must be passed via the `access_token` query parameter:
  `ws://localhost:5153/chathub?access_token=<YOUR_JWT_TOKEN>`

### Client-to-Hub Commands (Invocations)
When entering/exiting rooms inside the 3D space or a specific text-channel interface, invoke:

1. `JoinSpace(spaceId)`: Adds the socket connection to the room's group to receive updates.
2. `LeaveSpace(spaceId)`: Removes connection from the room's group.

### Hub-to-Client Broadcasts (Listeners)
Subscribe to these methods on the client side:

| Method Name | Payload Schema | Trigger |
| :--- | :--- | :--- |
| `ReceiveMessage` | `ChatMessageResponseDto` | Broadcasted to the space when any member sends a new message. |
| `MessageEdited` | `ChatMessageResponseDto` | Broadcasted when a message is updated. |
| `MessageDeleted` | `{ channelId: Guid, messageId: Guid, deletedById: Guid, deletedAt: DateTime }` | Broadcasted when a message is removed. |
| `ReceiveNotification` | `NotificationResponseDto` | Sent directly to the target user (e.g. for workspace invites, mentions). |

---

### 💻 Client Code Examples

#### 1. Next.js / Web Client (JavaScript/TypeScript)
First install the official library:
```bash
npm install @microsoft/signalr
```

```typescript
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5153/chathub?access_token=" + token, {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets
  })
  .withAutomaticReconnect()
  .build();

// Bind listeners
connection.on("ReceiveMessage", (message) => {
  console.log("New message: ", message.text);
});

connection.on("MessageDeleted", (info) => {
  console.log("Message deleted:", info.messageId);
});

connection.on("ReceiveNotification", (notification) => {
  console.log("Notification received: ", notification.title);
});

// Start connection & join Space
async function start() {
  try {
    await connection.start();
    console.log("SignalR Connected.");
    
    // Join a Space room
    await connection.invoke("JoinSpace", "space-guid-here");
  } catch (err) {
    console.error("SignalR Connection Error: ", err);
  }
}

start();
```

---

#### 2. Flutter Client (Dart)
Add `signalr_netcore` dependency:
```yaml
dependencies:
  signalr_netcore: ^1.3.1
```

```dart
import 'package:signalr_netcore/signalr_netcore.dart';

final serverUrl = "http://localhost:5153/chathub?access_token=$token";

final httpOptions = HttpConnectionOptions(
  transport: HttpTransportType.WebSockets,
  skipNegotiation: true,
  logMessageContent: true,
);

final hubConnection = HubConnectionBuilder()
    .withUrl(serverUrl, options: httpOptions)
    .build();

void setupSignalR() async {
  // Bind listeners
  hubConnection.on("ReceiveMessage", (arguments) {
    final message = arguments?[0];
    print("New message: ${message['text']}");
  });

  hubConnection.on("MessageDeleted", (arguments) {
    final info = arguments?[0];
    print("Deleted message: ${info['messageId']}");
  });

  hubConnection.on("ReceiveNotification", (arguments) {
    final notification = arguments?[0];
    print("Notification: ${notification['title']}");
  });

  // Start Connection
  await hubConnection.start();
  print("SignalR connected successfully");

  // Join Space
  await hubConnection.invoke("JoinSpace", args: ["space-guid-here"]);
}
```
