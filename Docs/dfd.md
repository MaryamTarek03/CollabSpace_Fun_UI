# Data Flow Diagrams (DFD)

## DFD Notation

| Symbol  | Meaning                       |
| ------- | ----------------------------- |
| `[[ ]]` | External Entity (Source/Sink) |
| `( )`   | Process                       |
| `[( )]` | Data Store                    |
| `-->`   | Data Flow                     |

---

## Level 0: Context Diagram

```mermaid
flowchart TB
    subgraph External Entities
        Guest[[Guest]]
        AuthUser[[Authenticated User]]
        Member[[Space Member]]
        Admin[[Space Admin]]
        Owner[[Space Owner]]
    end

    System((CollabSpace\nSystem))

    subgraph Data Flows - Input
        Guest -->|Registration Data| System
        Guest -->|Login Credentials| System
        AuthUser -->|Profile Updates| System
        AuthUser -->|Space Search Query| System
        AuthUser -->|Join Request| System
        Member -->|Messages| System
        Member -->|Files| System
        Member -->|Invites| System
        Admin -->|Member Actions| System
        Admin -->|Settings Updates| System
        Owner -->|Ownership Transfer| System
        Owner -->|Space Deletion| System
    end

    subgraph Data Flows - Output
        System -->|Auth Result| Guest
        System -->|User Session| AuthUser
        System -->|Notifications| AuthUser
        System -->|Space List| AuthUser
        System -->|Chat Messages| Member
        System -->|File List| Member
        System -->|Member List| Admin
        System -->|Space Data| Owner
    end
```

---

## Level 1: System Overview DFD

```mermaid
flowchart TB
    %% External Entities
    User[[User]]

    %% Processes
    P1((1.0\nAuthenticate))
    P2((2.0\nManage\nProfile))
    P3((3.0\nManage\nSpaces))
    P4((4.0\nManage\nMembership))
    P5((5.0\nManage\nRoles))
    P6((6.0\nChat))
    P7((7.0\nManage\nFiles))
    P8((8.0\nNotifications))
    P9((9.0\nFavorites))

    %% Data Stores
    D1[(D1: Users)]
    D2[(D2: Spaces)]
    D3[(D3: Members)]
    D4[(D4: Messages)]
    D5[(D5: Files)]
    D6[(D6: Notifications)]
    D7[(D7: Invites)]
    D8[(D8: Favorites)]

    %% Authentication Flows
    User -->|Credentials| P1
    P1 -->|User Data| D1
    D1 -->|User Record| P1
    P1 -->|Auth Result| User

    %% Profile Flows
    User -->|Profile Updates| P2
    P2 <-->|User Data| D1
    P2 -->|Updated Profile| User

    %% Space Management Flows
    User -->|Space Data| P3
    P3 <-->|Space Records| D2
    P3 -->|Space List| User

    %% Membership Flows
    User -->|Join/Invite| P4
    P4 <-->|Member Records| D3
    P4 <-->|Invite Records| D7
    P4 -->|Membership Status| User

    %% Role Management Flows
    User -->|Role Changes| P5
    P5 <-->|Member Roles| D3
    P5 -->|Role Update| User

    %% Chat Flows
    User -->|Message| P6
    P6 <-->|Message Records| D4
    P6 -->|Messages| User

    %% File Management Flows
    User -->|File Upload| P7
    P7 <-->|File Records| D5
    P7 -->|File List| User

    %% Notification Flows
    P4 -->|Invite Notification| P8
    P6 -->|Mention Notification| P8
    P8 <-->|Notification Records| D6
    P8 -->|Notifications| User

    %% Favorites Flows
    User -->|Favorite Action| P9
    P9 <-->|Favorite Records| D8
    P9 -->|Favorite Status| User
```

---

## Level 2: Process 1.0 - Authenticate

```mermaid
flowchart TB
    %% External Entity
    Guest[[Guest]]
    AuthUser[[Authenticated User]]

    %% Processes
    P1_1((1.1\nRegister))
    P1_2((1.2\nLogin))
    P1_3((1.3\nValidate\nCredentials))
    P1_4((1.4\nManage\nSession))
    P1_5((1.5\nLogout))

    %% Data Store
    D1[(D1: Users)]
    D_Session[(Session Store)]

    %% Registration Flow
    Guest -->|Name, Username,\nEmail, Password| P1_1
    P1_1 -->|Check Uniqueness| D1
    D1 -->|Existing Users| P1_1
    P1_1 -->|Hash Password| P1_1
    P1_1 -->|New User Record| D1
    P1_1 -->|User Created| P1_4

    %% Login Flow
    Guest -->|Email/Username,\nPassword| P1_2
    P1_2 -->|Credentials| P1_3
    P1_3 -->|Lookup User| D1
    D1 -->|User Record| P1_3
    P1_3 -->|Verify Hash| P1_3
    P1_3 -->|Valid/Invalid| P1_2
    P1_2 -->|Auth Success| P1_4
    P1_2 -->|Auth Failure| Guest

    %% Session Management
    P1_4 -->|Create Session| D_Session
    P1_4 -->|User Session| AuthUser

    %% Logout Flow
    AuthUser -->|Logout Request| P1_5
    P1_5 -->|Clear Session| D_Session
    P1_5 -->|Session Ended| Guest
```

---

## Level 2: Process 2.0 - Manage Profile

```mermaid
flowchart TB
    %% External Entity
    User[[Authenticated User]]

    %% Processes
    P2_1((2.1\nView\nProfile))
    P2_2((2.2\nEdit\nProfile))
    P2_3((2.3\nUpload\nAvatar))
    P2_4((2.4\nConfigure\nPrivacy))
    P2_5((2.5\nDelete\nAccount))

    %% Data Stores
    D1[(D1: Users)]
    D_Files[(File Storage)]

    %% View Profile
    User -->|View Request| P2_1
    P2_1 -->|Get User| D1
    D1 -->|User Data| P2_1
    P2_1 -->|Profile Info| User

    %% Edit Profile
    User -->|Name, Username, Bio| P2_2
    P2_2 -->|Validate Username| D1
    D1 -->|Uniqueness Check| P2_2
    P2_2 -->|Update User| D1
    P2_2 -->|Updated Profile| User

    %% Upload Avatar
    User -->|Image File| P2_3
    P2_3 -->|Process Image| P2_3
    P2_3 -->|Store File| D_Files
    D_Files -->|File Path| P2_3
    P2_3 -->|Update Avatar URL| D1
    P2_3 -->|Avatar Updated| User

    %% Privacy Settings
    User -->|Privacy Settings| P2_4
    P2_4 -->|Update Settings| D1
    P2_4 -->|Settings Saved| User

    %% Delete Account
    User -->|Delete Request| P2_5
    P2_5 -->|Remove User Data| D1
    P2_5 -->|Remove Avatar| D_Files
    P2_5 -->|Account Deleted| User
```

---

## Level 2: Process 3.0 - Manage Spaces

```mermaid
flowchart TB
    %% External Entities
    User[[Authenticated User]]
    Admin[[Admin/Owner]]

    %% Processes
    P3_1((3.1\nCreate\nSpace))
    P3_2((3.2\nUpdate\nSettings))
    P3_3((3.3\nChange\nAppearance))
    P3_4((3.4\nDelete\nSpace))
    P3_5((3.5\nSearch\nSpaces))
    P3_6((3.6\nJoin\nSpace))

    %% Data Stores
    D2[(D2: Spaces)]
    D3[(D3: Members)]
    D4[(D4: Channels)]
    D_Files[(File Storage)]

    %% Create Space
    User -->|Name, Description,\nCategory, Visibility| P3_1
    P3_1 -->|Create Space| D2
    P3_1 -->|Add Owner| D3
    P3_1 -->|Create Default Channel| D4
    P3_1 -->|Space Created| User

    %% Update Settings
    Admin -->|Settings Updates| P3_2
    P3_2 -->|Update Space| D2
    P3_2 -->|Updated Space| Admin

    %% Change Appearance
    Admin -->|Thumbnail Image| P3_3
    P3_3 -->|Store Image| D_Files
    D_Files -->|Image Path| P3_3
    P3_3 -->|Update Thumbnail| D2
    P3_3 -->|Appearance Updated| Admin

    %% Delete Space
    Admin -->|Delete Request| P3_4
    P3_4 -->|Remove Space| D2
    P3_4 -->|Remove Members| D3
    P3_4 -->|Remove Channels| D4
    P3_4 -->|Space Deleted| Admin

    %% Search Spaces
    User -->|Search Query| P3_5
    P3_5 -->|Query Spaces| D2
    D2 -->|Matching Spaces| P3_5
    P3_5 -->|Search Results| User

    %% Join Space
    User -->|Join Request| P3_6
    P3_6 -->|Check Space| D2
    D2 -->|Space Data| P3_6
    P3_6 -->|Add Member| D3
    P3_6 -->|Join Result| User
```

---

## Level 2: Process 4.0 - Manage Membership

```mermaid
flowchart TB
    %% External Entities
    User[[User]]
    Admin[[Admin/Owner]]

    %% Processes
    P4_1((4.1\nInvite\nUser))
    P4_2((4.2\nGenerate\nInvite Link))
    P4_3((4.3\nJoin via\nLink))
    P4_4((4.4\nRequest\nto Join))
    P4_5((4.5\nApprove/Reject\nRequest))
    P4_6((4.6\nRemove\nMember))
    P4_7((4.7\nBan\nMember))
    P4_8((4.8\nLeave\nSpace))

    %% Data Stores
    D3[(D3: Members)]
    D6[(D6: Notifications)]
    D7[(D7: Invites)]
    D_Requests[(Join Requests)]
    D_Bans[(Space Bans)]

    %% Invite User
    Admin -->|User ID, Space ID| P4_1
    P4_1 -->|Create Invite| D7
    P4_1 -->|Create Notification| D6
    P4_1 -->|Invite Sent| Admin

    %% Generate Link
    Admin -->|Space ID| P4_2
    P4_2 -->|Create Link Code| D7
    P4_2 -->|Invite Link| Admin

    %% Join via Link
    User -->|Invite Code| P4_3
    P4_3 -->|Validate Code| D7
    D7 -->|Invite Data| P4_3
    P4_3 -->|Add Member| D3
    P4_3 -->|Joined| User

    %% Request to Join
    User -->|Space ID| P4_4
    P4_4 -->|Create Request| D_Requests
    P4_4 -->|Notify Admins| D6
    P4_4 -->|Request Sent| User

    %% Approve/Reject
    Admin -->|Request ID, Action| P4_5
    P4_5 -->|Update Request| D_Requests
    P4_5 -->|Add Member if Approved| D3
    P4_5 -->|Notify User| D6
    P4_5 -->|Action Complete| Admin

    %% Remove Member
    Admin -->|Member ID| P4_6
    P4_6 -->|Remove Member| D3
    P4_6 -->|Member Removed| Admin

    %% Ban Member
    Admin -->|Member ID, Reason| P4_7
    P4_7 -->|Remove Member| D3
    P4_7 -->|Create Ban Record| D_Bans
    P4_7 -->|Member Banned| Admin

    %% Leave Space
    User -->|Space ID| P4_8
    P4_8 -->|Remove Self| D3
    P4_8 -->|Left Space| User
```

---

## Level 2: Process 5.0 - Manage Roles

```mermaid
flowchart TB
    %% External Entities
    Admin[[Admin]]
    Owner[[Owner]]

    %% Processes
    P5_1((5.1\nChange\nRole))
    P5_2((5.2\nTransfer\nOwnership))

    %% Data Stores
    D2[(D2: Spaces)]
    D3[(D3: Members)]

    %% Change Role
    Owner -->|Member ID, New Role| P5_1
    Admin -->|Member ID, New Role| P5_1
    P5_1 -->|Validate Permission| D3
    D3 -->|Current Roles| P5_1
    P5_1 -->|Update Role| D3
    P5_1 -->|Role Changed| Owner
    P5_1 -->|Role Changed| Admin

    %% Transfer Ownership
    Owner -->|New Owner ID| P5_2
    P5_2 -->|Update Space Owner| D2
    P5_2 -->|Set New Owner Role| D3
    P5_2 -->|Demote Old Owner| D3
    P5_2 -->|Ownership Transferred| Owner
```

---

## Level 2: Process 6.0 - Chat

```mermaid
flowchart TB
    %% External Entities
    Member[[Member]]
    Admin[[Admin/Owner]]

    %% Processes
    P6_1((6.1\nManage\nChannels))
    P6_2((6.2\nSend\nMessage))
    P6_3((6.3\nReply to\nMessage))
    P6_4((6.4\nForward\nMessage))
    P6_5((6.5\nMention\nUsers))
    P6_6((6.6\nEdit\nMessage))
    P6_7((6.7\nDelete\nMessage))
    P6_8((6.8\nAttach\nFiles))

    %% Data Stores
    D4[(D4: Messages)]
    D_Channels[(Channels)]
    D6[(D6: Notifications)]
    D5[(D5: Files)]

    %% Manage Channels
    Admin -->|Channel Name, Desc| P6_1
    P6_1 -->|CRUD Channel| D_Channels
    P6_1 -->|Channel List| Admin

    %% Send Message
    Member -->|Text, Channel ID| P6_2
    P6_2 -->|Store Message| D4
    P6_2 -->|Message Sent| Member

    %% Reply
    Member -->|Text, Reply To ID| P6_3
    P6_3 -->|Get Original| D4
    D4 -->|Original Message| P6_3
    P6_3 -->|Store Reply| D4
    P6_3 -->|Reply Sent| Member

    %% Forward
    Member -->|Message ID,\nTarget Channel| P6_4
    P6_4 -->|Get Message| D4
    D4 -->|Message Data| P6_4
    P6_4 -->|Create Forward| D4
    P6_4 -->|Forwarded| Member

    %% Mention
    Member -->|Text with @mentions| P6_5
    P6_5 -->|Parse Mentions| P6_5
    P6_5 -->|Store Message| D4
    P6_5 -->|Create Notifications| D6
    P6_5 -->|Message Sent| Member

    %% Edit
    Member -->|Message ID, New Text| P6_6
    P6_6 -->|Update Message| D4
    P6_6 -->|Message Edited| Member

    %% Delete
    Member -->|Message ID| P6_7
    Admin -->|Message ID| P6_7
    P6_7 -->|Soft Delete| D4
    P6_7 -->|Message Deleted| Member

    %% Attach Files
    Member -->|File, Message| P6_8
    P6_8 -->|Store File| D5
    D5 -->|File ID| P6_8
    P6_8 -->|Link to Message| D4
    P6_8 -->|Attachment Added| Member
```

---

## Level 2: Process 7.0 - Manage Files

```mermaid
flowchart TB
    %% External Entities
    Member[[Member]]
    Admin[[Admin/Owner]]

    %% Processes
    P7_1((7.1\nUpload\nFile))
    P7_2((7.2\nCreate\nFolder))
    P7_3((7.3\nNavigate\nFolders))
    P7_4((7.4\nRename\nItem))
    P7_5((7.5\nDelete\nItem))
    P7_6((7.6\nMove/Copy\nFiles))
    P7_7((7.7\nPreview\nFile))
    P7_8((7.8\nDownload\nFile))

    %% Data Stores
    D5[(D5: Files)]
    D_Folders[(Folders)]
    D_Storage[(File Storage)]

    %% Upload File
    Member -->|File Binary,\nSpace ID, Folder ID| P7_1
    P7_1 -->|Store Binary| D_Storage
    D_Storage -->|Stored Path| P7_1
    P7_1 -->|Create Record| D5
    P7_1 -->|Upload Complete| Member

    %% Create Folder
    Member -->|Folder Name,\nParent ID| P7_2
    P7_2 -->|Create Folder| D_Folders
    P7_2 -->|Folder Created| Member

    %% Navigate
    Member -->|Folder ID| P7_3
    P7_3 -->|Get Contents| D5
    P7_3 -->|Get Subfolders| D_Folders
    D5 -->|Files| P7_3
    D_Folders -->|Folders| P7_3
    P7_3 -->|Contents List| Member

    %% Rename
    Member -->|Item ID, New Name| P7_4
    Admin -->|Item ID, New Name| P7_4
    P7_4 -->|Update Name| D5
    P7_4 -->|Update Name| D_Folders
    P7_4 -->|Renamed| Member

    %% Delete
    Member -->|Item ID| P7_5
    Admin -->|Item ID| P7_5
    P7_5 -->|Delete Record| D5
    P7_5 -->|Delete Record| D_Folders
    P7_5 -->|Delete Binary| D_Storage
    P7_5 -->|Deleted| Member

    %% Move/Copy
    Member -->|File IDs,\nTarget Folder| P7_6
    P7_6 -->|Update/Copy Records| D5
    P7_6 -->|Copy Binaries if Copy| D_Storage
    P7_6 -->|Move/Copy Complete| Member

    %% Preview
    Member -->|File ID| P7_7
    P7_7 -->|Get File Info| D5
    D5 -->|File Metadata| P7_7
    P7_7 -->|Get Binary| D_Storage
    D_Storage -->|File Data| P7_7
    P7_7 -->|Preview Data| Member

    %% Download
    Member -->|File ID| P7_8
    P7_8 -->|Get File Path| D5
    D5 -->|Stored Path| P7_8
    P7_8 -->|Serve File| D_Storage
    D_Storage -->|File Binary| P7_8
    P7_8 -->|File Download| Member
```

---

## Level 2: Process 8.0 - Notifications

```mermaid
flowchart TB
    %% External Entities
    User[[Authenticated User]]

    %% Internal Sources
    ChatSystem((Chat\nSystem))
    MemberSystem((Membership\nSystem))

    %% Processes
    P8_1((8.1\nCreate\nNotification))
    P8_2((8.2\nFetch\nNotifications))
    P8_3((8.3\nMark\nas Read))
    P8_4((8.4\nAccept\nInvite))
    P8_5((8.5\nDecline\nInvite))

    %% Data Stores
    D6[(D6: Notifications)]
    D7[(D7: Invites)]
    D3[(D3: Members)]

    %% Create Notification (from internal systems)
    ChatSystem -->|Mention Data| P8_1
    MemberSystem -->|Invite Data| P8_1
    P8_1 -->|Store Notification| D6
    P8_1 -->|Notification Created| D6

    %% Fetch Notifications
    User -->|User ID| P8_2
    P8_2 -->|Get Notifications| D6
    D6 -->|Notification List| P8_2
    P8_2 -->|Notifications| User

    %% Mark as Read
    User -->|Notification ID| P8_3
    P8_3 -->|Update Read Status| D6
    P8_3 -->|Marked Read| User

    %% Accept Invite
    User -->|Invite ID| P8_4
    P8_4 -->|Get Invite| D7
    D7 -->|Invite Data| P8_4
    P8_4 -->|Update Status| D7
    P8_4 -->|Add Member| D3
    P8_4 -->|Mark Notification Read| D6
    P8_4 -->|Invite Accepted| User

    %% Decline Invite
    User -->|Invite ID| P8_5
    P8_5 -->|Update Status| D7
    P8_5 -->|Mark Notification Read| D6
    P8_5 -->|Invite Declined| User
```

---

## Level 2: Process 9.0 - Favorites

```mermaid
flowchart TB
    %% External Entity
    User[[Authenticated User]]

    %% Processes
    P9_1((9.1\nAdd\nFavorite))
    P9_2((9.2\nRemove\nFavorite))
    P9_3((9.3\nGet\nFavorites))

    %% Data Stores
    D8[(D8: Favorites)]
    D2[(D2: Spaces)]

    %% Add Favorite
    User -->|Space ID| P9_1
    P9_1 -->|Create Favorite| D8
    P9_1 -->|Favorite Added| User

    %% Remove Favorite
    User -->|Space ID| P9_2
    P9_2 -->|Delete Favorite| D8
    P9_2 -->|Favorite Removed| User

    %% Get Favorites
    User -->|User ID| P9_3
    P9_3 -->|Get Favorite IDs| D8
    D8 -->|Space IDs| P9_3
    P9_3 -->|Get Spaces| D2
    D2 -->|Space Data| P9_3
    P9_3 -->|Favorite Spaces| User
```

---

## Data Store Dictionary

| Store ID | Name          | Description                  | Key Fields                                                  |
| -------- | ------------- | ---------------------------- | ----------------------------------------------------------- |
| D1       | Users         | User account information     | id, name, username, email, password_hash, avatar            |
| D2       | Spaces        | Collaborative workspace data | id, name, description, owner_id, visibility                 |
| D3       | Members       | Space membership records     | id, space_id, user_id, role, joined_at                      |
| D4       | Messages      | Chat messages                | id, channel_id, sender_id, text, mentions, reply_to_id      |
| D5       | Files         | File metadata                | id, space_id, folder_id, name, stored_filename, uploaded_by |
| D6       | Notifications | User notifications           | id, user_id, type, text, read, space_id                     |
| D7       | Invites       | Space invitations            | id, space_id, user_id, inviter_id, status, code             |
| D8       | Favorites     | User favorite spaces         | id, user_id, space_id                                       |

---

## Data Flow Summary

| Process               | Input Data       | Output Data       | Data Stores Accessed           |
| --------------------- | ---------------- | ----------------- | ------------------------------ |
| 1.0 Authenticate      | Credentials      | Session           | D1: Users                      |
| 2.0 Manage Profile    | Profile Data     | Updated Profile   | D1: Users                      |
| 3.0 Manage Spaces     | Space Data       | Space List        | D2: Spaces, D3: Members        |
| 4.0 Manage Membership | Invite/Join Data | Membership Status | D3: Members, D7: Invites       |
| 5.0 Manage Roles      | Role Changes     | Updated Roles     | D2: Spaces, D3: Members        |
| 6.0 Chat              | Messages         | Message List      | D4: Messages                   |
| 7.0 Manage Files      | Files            | File List         | D5: Files                      |
| 8.0 Notifications     | Actions          | Notifications     | D6: Notifications, D7: Invites |
| 9.0 Favorites         | Favorite Actions | Favorite List     | D8: Favorites, D2: Spaces      |

---

## Physical Data Flow Diagram

```mermaid
flowchart LR
    subgraph Client["Client (Browser)"]
        React[React SPA]
        Stores[Zustand Stores]
    end

    subgraph Server["Server (Node.js)"]
        API[Express API]
        FileHandler[File Handler]
    end

    subgraph Storage["Storage"]
        SQLite[(SQLite DB)]
        FileSystem[(File System)]
    end

    React <-->|HTTP/JSON| API
    React <-->|State| Stores
    API <-->|SQL Queries| SQLite
    API <-->|Read/Write| FileHandler
    FileHandler <-->|Binary| FileSystem
```
