# Use Case Diagram

## System Overview Diagram

```mermaid
flowchart TB
    subgraph Actors
        Guest([Guest])
        User([Authenticated User])
        Member([Member])
        Admin([Admin])
        Owner([Owner])
    end

    subgraph System["CollabSpace System"]
        UC01[UC-01: Authenticate]
        UC02[UC-02: Manage Profile]
        UC03[UC-03: Manage Space Lifecycle]
        UC04[UC-04: Manage Membership]
        UC05[UC-05: Manage Roles & Ownership]
        UC06[UC-06: Collaborate in Chat]
        UC07[UC-07: Manage Files]
        UC08[UC-08: View & Act on Notifications]
        UC09[UC-09: Favorite Spaces]
    end

    Guest --> UC01
    User --> UC01
    User --> UC02
    User --> UC03
    User --> UC04
    User --> UC08
    User --> UC09
    Member --> UC06
    Member --> UC07
    Admin --> UC04
    Admin --> UC05
    Owner --> UC03
    Owner --> UC04
    Owner --> UC05

    %% Inheritance
    Owner -.->|inherits| Admin
    Admin -.->|inherits| Member
    Member -.->|inherits| User
```

---

## UC-01: Authenticate (Detailed)

```mermaid
flowchart LR
    Guest([Guest])
    User([User])

    subgraph UC01["UC-01: Authenticate"]
        Register[UC-01.1: Register]
        Login[UC-01.2: Login]
        Logout[UC-01.3: Logout]

        ValidatePassword((Validate Password Strength))
        CheckLockout((Check Account Lockout))
    end

    Guest --> Register
    Guest --> Login
    User --> Logout

    Register -.->|includes| ValidatePassword
    Login -.->|includes| CheckLockout
```

---

## UC-02: Manage Profile (Detailed)

```mermaid
flowchart LR
    User([Authenticated User])

    subgraph UC02["UC-02: Manage Profile"]
        EditProfile[UC-02.1: Edit Profile Info]
        UploadAvatar[UC-02.2: Upload Avatar]
        ConfigPrivacy[UC-02.3: Configure Privacy]
        DeleteAccount[UC-02.4: Delete Account]
        ViewOther[UC-02.5: View Other Profile]
        SearchUsers[UC-02.6: Search Users]

        CropImage((Crop Image))
        InviteToSpace((Invite to Space))
    end

    User --> EditProfile
    User --> UploadAvatar
    User --> ConfigPrivacy
    User --> DeleteAccount
    User --> ViewOther
    User --> SearchUsers

    UploadAvatar -.->|includes| CropImage
    ViewOther -.->|extends| InviteToSpace
    SearchUsers -.->|includes| ViewOther
```

---

## UC-03: Manage Space Lifecycle (Detailed)

```mermaid
flowchart LR
    User([Authenticated User])
    Admin([Admin])
    Owner([Owner])

    subgraph UC03["UC-03: Manage Space Lifecycle"]
        CreateSpace[UC-03.1: Create Space]
        UpdateSettings[UC-03.2: Update Space Settings]
        ChangeAppearance[UC-03.3: Change Space Appearance]
        SetVisibility[UC-03.4: Set Space Visibility]
        DeleteSpace[UC-03.5: Delete Space]
        SearchSpaces[UC-03.6: Search Public Spaces]

        SelectTemplate((Select Template))
        UploadThumbnail((Upload Thumbnail))
    end

    User --> CreateSpace
    User --> SearchSpaces
    Admin --> UpdateSettings
    Admin --> ChangeAppearance
    Admin --> SetVisibility
    Owner --> DeleteSpace

    CreateSpace -.->|includes| SelectTemplate
    ChangeAppearance -.->|extends| UploadThumbnail
```

---

## UC-04: Manage Membership (Detailed)

```mermaid
flowchart LR
    User([User])
    Member([Member])
    Admin([Admin])
    Owner([Owner])

    subgraph UC04["UC-04: Manage Membership"]
        InviteEmail[UC-04.1: Invite by Email]
        GenerateLink[UC-04.2: Generate Invite Link]
        JoinViaLink[UC-04.3: Join via Link]
        RequestJoin[UC-04.4: Request to Join]
        ApproveReject[UC-04.5: Approve/Reject Request]
        RemoveMember[UC-04.6: Remove Member]
        BanMember[UC-04.7: Ban Member]
        UnbanMember[UC-04.8: Unban Member]
        LeaveSpace[UC-04.9: Leave Space]
        RevokeInvite[UC-04.10: Revoke Invite]
    end

    User --> JoinViaLink
    User --> RequestJoin
    Member --> InviteEmail
    Member --> LeaveSpace
    Admin --> GenerateLink
    Admin --> ApproveReject
    Admin --> RemoveMember
    Admin --> BanMember
    Admin --> UnbanMember
    Admin --> RevokeInvite
    Owner --> RemoveMember
    Owner --> BanMember
```

---

## UC-05: Manage Roles & Ownership (Detailed)

```mermaid
flowchart LR
    Admin([Admin])
    Owner([Owner])

    subgraph UC05["UC-05: Manage Roles & Ownership"]
        ChangeRole[UC-05.1: Change Member Role]
        TransferOwnership[UC-05.2: Transfer Ownership]

        ConfirmTransfer((Confirm Transfer))
    end

    Admin --> ChangeRole
    Owner --> ChangeRole
    Owner --> TransferOwnership

    TransferOwnership -.->|includes| ConfirmTransfer
```

---

## UC-06: Collaborate in Chat (Detailed)

```mermaid
flowchart LR
    Member([Member])
    Author([Message Author])
    Admin([Admin])

    subgraph UC06["UC-06: Collaborate in Chat"]
        SendMessage[UC-06.1: Send Message]
        ReplyMessage[UC-06.2: Reply to Message]
        ForwardMessage[UC-06.3: Forward Message]
        MentionUsers[UC-06.4: Mention Users]
        EditMessage[UC-06.5: Edit Message]
        DeleteMessage[UC-06.6: Delete Message]
        AttachFiles[UC-06.7: Attach Files]

        NotifyMentioned((Notify Mentioned))
        UploadAttachment((Upload Attachment))
    end

    Member --> SendMessage
    Member --> ReplyMessage
    Member --> ForwardMessage
    Member --> MentionUsers
    Member --> AttachFiles
    Author --> EditMessage
    Author --> DeleteMessage
    Admin --> DeleteMessage

    MentionUsers -.->|includes| NotifyMentioned
    AttachFiles -.->|includes| UploadAttachment
```

---

## UC-07: Manage Files (Detailed)

```mermaid
flowchart LR
    Member([Member])
    FileOwner([File Owner])
    Admin([Admin])

    subgraph UC07["UC-07: Manage Files"]
        UploadFile[UC-07.1: Upload File]
        CreateFolder[UC-07.2: Create Folder]
        NavigateFolders[UC-07.3: Navigate Folders]
        RenameItem[UC-07.4: Rename File]
        RenameFolder[UC-07.5: Rename Folder]
        DeleteFolder[UC-07.6: Delete Folder]
        DeleteItem[UC-07.7: Delete File]
        MoveFiles[UC-07.8: Move Files]
        CopyFiles[UC-07.9: Copy Files]
        PreviewFile[UC-07.10: Preview File]
        DownloadFile[UC-07.11: Download File]
        CreateLink[UC-07.12: Create Link]

        TrackProgress((Track Upload Progress))
    end

    Member --> UploadFile
    Admin --> CreateFolder
    Member --> NavigateFolders
    Member --> MoveFiles
    Member --> CopyFiles
    Member --> PreviewFile
    Member --> DownloadFile
    Member --> CreateLink
    FileOwner --> RenameItem
    FileOwner --> DeleteItem
    Admin --> RenameFolder
    Admin --> DeleteFolder
    Admin --> RenameItem
    Admin --> DeleteItem

    UploadFile -.->|includes| TrackProgress
```

---

## UC-08: View & Act on Notifications (Detailed)

```mermaid
flowchart LR
    User([Authenticated User])

    subgraph UC08["UC-08: View & Act on Notifications"]
        ViewNotifications[UC-08.1: View Notifications]
        AcceptInvite[UC-08.2: Accept Invite]
        DeclineInvite[UC-08.3: Decline Invite]
        MarkRead[UC-08.4: Mark as Read]
        MarkAllRead[UC-08.5: Mark All Read]

        JoinSpace((Join Space))
        RefreshSpaces((Refresh Spaces))
    end

    User --> ViewNotifications
    User --> AcceptInvite
    User --> DeclineInvite
    User --> MarkRead
    User --> MarkAllRead

    AcceptInvite -.->|includes| JoinSpace
    AcceptInvite -.->|includes| RefreshSpaces
```

---

## UC-09: Favorite Spaces (Detailed)

```mermaid
flowchart LR
    User([Authenticated User])

    subgraph UC09["UC-09: Favorite Spaces"]
        AddFavorite[UC-09.1: Add to Favorites]
        RemoveFavorite[UC-09.2: Remove from Favorites]
        FilterFavorites[UC-09.3: Filter by Favorites]
    end

    User --> AddFavorite
    User --> RemoveFavorite
    User --> FilterFavorites
```

---

## Actor Hierarchy

```mermaid
flowchart TB
    Guest([Guest]) --> User([Authenticated User])
    User --> Member([Space Member])
    Member --> Admin([Space Admin])
    Admin --> Owner([Space Owner])

    subgraph Permissions
        P1[Register/Login]
        P2[Manage Profile, Notifications]
        P3[Chat, Files, Invite, Favorites]
        P4[Manage Members, Approve Requests, Ban, Unban]
        P5[Delete Space, Transfer Ownership]
    end

    Guest -.- P1
    User -.- P2
    Member -.- P3
    Admin -.- P4
    Owner -.- P5
```

---

## Relationship Legend

| Symbol                 | Meaning                                 |
| ---------------------- | --------------------------------------- |
| `─────>`               | Actor performs use case                 |
| `-.->` with "includes" | Use case always includes another        |
| `-.->` with "extends"  | Use case optionally extends another     |
| `-.->` with "inherits" | Actor inherits permissions from another |
| `(( ))`                | Included/Extended sub-function          |
| `[ ]`                  | Use case                                |
| `([ ])`                | Actor                                   |
