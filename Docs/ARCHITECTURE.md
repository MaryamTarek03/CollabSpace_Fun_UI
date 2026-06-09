# Clean Architecture Overview

This document provides a visual overview of the Clean Architecture implementation.

## Dependency Flow

```mermaid
graph TB
    subgraph Presentation["🟣 Presentation Layer"]
        UI["UI Components<br/>(AuthPage, DashboardView)"]
        Stores["Zustand Stores<br/>(useAuthStore, useSpacesStore)"]
    end
    
    subgraph DI["📦 DI Container"]
        Container["container.js<br/>inject() / register()"]
    end
    
    subgraph Core["🔵 Core Layer"]
        Entities["Entities<br/>(User, Space, Message)"]
        Interfaces["Interfaces<br/>(IAuthRepository, IStorageService)"]
    end
    
    subgraph Infrastructure["🟢 Infrastructure Layer"]
        Repositories["Repositories<br/>(AuthRepository, SpaceRepository)"]
        Services["Services<br/>(LocalStorageService)"]
        HTTP["HttpClient<br/>+ endpoints.js"]
    end
    
    subgraph External["☁️ External"]
        API["Backend API"]
        Storage["localStorage"]
    end
    
    UI --> Stores
    Stores --> Container
    Container --> Repositories
    Container --> Services
    Repositories --> HTTP
    Repositories --> Entities
    Repositories -.->|implements| Interfaces
    Services -.->|implements| Interfaces
    HTTP --> API
    Services --> Storage
```

## Layer Responsibilities

| Layer | Responsibility | Can Depend On |
|-------|----------------|---------------|
| **Core** | Business logic, entities, interfaces | Nothing (innermost) |
| **Infrastructure** | API calls, storage, external services | Core |
| **Presentation** | UI, state management | Core, Infrastructure (via DI) |

## File Count by Layer

```mermaid
pie title Files by Architecture Layer
    "Core (Entities)" : 8
    "Core (Interfaces)" : 10
    "Infrastructure" : 12
    "Presentation" : 11
    "Config" : 6
```

## Request Flow Example: Login

```mermaid
sequenceDiagram
    participant UI as AuthPage
    participant Store as useAuthStore
    participant DI as DI Container
    participant Repo as AuthRepository
    participant HTTP as HttpClient
    participant API as Backend

    UI->>Store: login(email, password)
    Store->>DI: inject('authRepository')
    DI-->>Store: AuthRepository instance
    Store->>Repo: login(credentials)
    Repo->>HTTP: post('/auth/login', data)
    HTTP->>API: HTTP POST
    API-->>HTTP: User JSON
    HTTP-->>Repo: Response
    Repo-->>Store: User entity
    Store-->>UI: Update state
```

## Benefits

1. **Testability**: Mock repositories for unit tests
2. **Flexibility**: Swap implementations without changing business logic
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Add features without touching existing code
