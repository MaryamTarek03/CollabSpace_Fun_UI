# Class Diagrams

## Complete System Class Diagram

```mermaid
classDiagram
    direction TB

    %% ==================== MODELS ====================
    class User {
        +String id
        +String name
        +String username
        +String email
        +String avatarColor
        +String avatarImage
        +String bio
        +Date createdAt
        +get initials() String
        +static fromApi(data) User
        +toApi() Object
    }

    class Space {
        +String id
        +String name
        +String description
        +String thumbnail
        +String thumbnailPosition
        +String category
        +String ownerId
        +String visibility
        +Number requestsCount
        +Date createdAt
        +SpaceMember[] members
        +SpaceFile[] files
        +get memberCount() Number
        +get isPrivate() Boolean
        +static fromApi(data) Space
        +static fromApiList(list) Space[]
        +toApi() Object
    }

    class SpaceMember {
        +String id
        +String memberId
        +String spaceId
        +String userId
        +String role
        +String name
        +String username
        +String email
        +String avatarColor
        +String avatarImage
        +Date joinedAt
        +get initials() String
        +static fromApi(data) SpaceMember
        +static fromApiList(list) SpaceMember[]
    }

    class SpaceFile {
        +String id
        +String spaceId
        +String name
        +String type
        +String size
        +String uploadedBy
        +String uploaderName
        +String downloadUrl
        +String storedFilename
        +String mimeType
        +String time
        +Date createdAt
        +static fromApi(data) SpaceFile
        +static fromApiList(list) SpaceFile[]
    }

    class Message {
        +String id
        +String spaceId
        +String channelId
        +String senderId
        +String sender
        +String avatarColor
        +String avatarImage
        +String text
        +String type
        +String[] mentions
        +String time
        +String replyToId
        +Object replyTo
        +String forwardedFromChannel
        +Date deletedAt
        +String deletedBy
        +Object[] attachments
        +Date createdAt
        +isFromUser(userId) Boolean
        +static fromApi(data) Message
        +static fromApiList(list) Message[]
        +toApi() Object
    }

    class Notification {
        +String id
        +String userId
        +String type
        +String author
        +String text
        +String target
        +String spaceId
        +String inviteId
        +String action
        +Boolean read
        +String time
        +Date createdAt
        +static fromApi(data) Notification
        +static fromApiList(list) Notification[]
    }

    class Invite {
        +String id
        +String spaceId
        +String spaceName
        +String userId
        +String inviterId
        +String inviterName
        +String status
        +Date createdAt
        +Date respondedAt
        +static fromApi(data) Invite
        +static fromApiList(list) Invite[]
    }

    %% Model Relationships
    Space "1" *-- "*" SpaceMember : contains
    Space "1" *-- "*" SpaceFile : contains
    SpaceMember "*" --> "1" User : references
    Message "*" --> "1" User : sender
    Notification "*" --> "1" User : belongs to
    Notification "*" --> "0..1" Space : references
    Notification "*" --> "0..1" Invite : references
    Invite "*" --> "1" Space : for
    Invite "*" --> "1" User : invitee
```

---

## Controllers (Zustand Stores) Class Diagram

```mermaid
classDiagram
    direction TB

    class useAuthStore {
        <<Store>>
        +User user
        +Boolean isAuthenticated
        +Boolean authInitialized
        +Boolean loading
        +Object error
        +setUser(user)
        +login(identifier, password) Promise~User~
        +register(userData) Promise~User~
        +logout()
        +updateProfile(profileData) Promise~User~
        +uploadAvatar(imageData) Promise~User~
        +deleteAvatar() Promise~User~
        +initialize()
    }

    class useSpacesStore {
        <<Store>>
        +Space[] spaces
        +Space activeSpace
        +String[] userFavorites
        +Boolean loading
        +String error
        +String activeTab
        +String activeCategory
        +String activeStatus
        +String searchQuery
        +String viewMode
        +String sortOption
        +setActiveSpace(space)
        +fetchSpaces() Promise~Space[]~
        +createSpace(data) Promise~Space~
        +updateSpace(id, updates) Promise~Space~
        +deleteSpace(id) Promise
        +fetchFavorites(userId) Promise
        +toggleFavorite(userId, spaceId) Promise
        +joinSpace(spaceId) Promise
        +fetchSpaceRequests(spaceId) Promise
        +approveRequest(spaceId, requestId) Promise
        +rejectRequest(spaceId, requestId) Promise
        +transferOwnership(spaceId, currentOwnerId, newOwnerId) Promise
        +getFilteredSpaces() Space[]
    }

    class useChatStore {
        <<Store>>
        +Space activeChatSpace
        +Object[] channels
        +Object activeChannel
        +Message[] messages
        +SpaceMember[] members
        +Message replyingTo
        +String chatInput
        +Boolean loading
        +String error
        +setActiveChatSpace(space) Promise
        +clearActiveChatSpace()
        +setChatInput(input)
        +fetchChannels(spaceId) Promise
        +fetchMembers(spaceId) Promise
        +setActiveChannel(channel)
        +createChannel(name, desc, createdBy) Promise
        +updateChannel(channelId, name, desc) Promise
        +deleteChannel(channelId) Promise
        +fetchMessages(channelId) Promise
        +setReplyingTo(message)
        +clearReplyingTo()
        +sendMessage(messageData) Promise
        +editMessage(messageId, text, senderId) Promise
        +deleteMessage(messageId, senderId) Promise
        +forwardMessage(messageId, targetChannelId, senderId) Promise
        +getCurrentMessages() Message[]
    }

    class useNotificationsStore {
        <<Store>>
        +Notification[] notifications
        +Boolean loading
        +String error
        +fetchNotifications(userId) Promise~Notification[]~
        +markAsRead(id) Promise
        +markAllAsRead() Promise
        +acceptInvite(inviteId, notificationId) Promise~Boolean~
        +declineInvite(inviteId, notificationId) Promise~Boolean~
        +addNotification(notification)
        +clearNotifications()
        +getUnreadCount() Number
    }

    class useUIStore {
        <<Store>>
        +String currentView
        +Boolean isCreateModalOpen
        +Boolean isFilesModalOpen
        +Boolean isMembersModalOpen
        +Boolean isSettingsModalOpen
        +Boolean isInviteModalOpen
        +Boolean isSpaceSettingsModalOpen
        +Boolean isJoinByLinkModalOpen
        +String spaceSettingsTab
        +String settingsTab
        +Object confirmationModal
        +Object infoModal
        +Object inputModal
        +Number createStep
        +String newSpaceName
        +String newSpaceDescription
        +String createdSpaceLink
        +Object viewingFile
        +String fileFilter
        +String themeColor
        +setCurrentView(view)
        +openCreateModal()
        +closeCreateModal()
        +openFilesModal()
        +closeFilesModal()
        +openMembersModal()
        +closeMembersModal()
        +openSettingsModal()
        +closeSettingsModal()
        +openInviteModal()
        +closeInviteModal()
        +openSpaceSettingsModal()
        +closeSpaceSettingsModal()
        +openJoinByLinkModal()
        +closeJoinByLinkModal()
        +openConfirmation(data)
        +closeConfirmation()
        +openInfo(data)
        +closeInfo()
        +openInputModal(data)
        +closeInputModal()
        +setThemeColor(color)
        +resetCreateFlow()
    }

    %% Store Dependencies
    useSpacesStore ..> useAuthStore : uses user
    useChatStore ..> useSpacesStore : uses spaces
    useNotificationsStore ..> useSpacesStore : refreshes spaces
```

---

## API Service Class Diagram

```mermaid
classDiagram
    direction LR

    class api {
        <<Service>>
        +auth AuthAPI
        +users UsersAPI
        +spaces SpacesAPI
        +members MembersAPI
        +invites InvitesAPI
        +requests RequestsAPI
        +notifications NotificationsAPI
        +channels ChannelsAPI
        +messages MessagesAPI
        +folders FoldersAPI
        +files FilesAPI
        +get(endpoint) Promise
        +post(endpoint, body) Promise
        +put(endpoint, body) Promise
        +delete(endpoint, body) Promise
    }

    class AuthAPI {
        +register(data) Promise
        +login(data) Promise
    }

    class UsersAPI {
        +getAll() Promise
        +getById(id) Promise
        +update(id, data) Promise
        +delete(id) Promise
        +uploadAvatar(id, imageData) Promise
        +deleteAvatar(id) Promise
        +getSpaces(userId) Promise
        +getInvites(userId) Promise
        +getProfile(id, viewerId) Promise
        +updatePrivacy(id, data) Promise
        +getSharedSpaces(id, viewerId) Promise
        +search(query, viewerId) Promise
        +getFavorites(userId) Promise
        +addFavorite(userId, spaceId) Promise
        +removeFavorite(userId, spaceId) Promise
        +toggleFavorite(userId, spaceId) Promise
    }

    class SpacesAPI {
        +getAll(userId) Promise
        +search(query, userId) Promise
        +getById(id) Promise
        +create(data) Promise
        +update(id, data) Promise
        +delete(id) Promise
        +join(spaceId, userId) Promise
        +getRequests(spaceId) Promise
        +approveRequest(spaceId, requestId) Promise
        +rejectRequest(spaceId, requestId) Promise
        +transferOwnership(spaceId, currentOwnerId, newOwnerId) Promise
        +uploadThumbnail(spaceId, imageData) Promise
        +getBans(spaceId) Promise
        +unban(spaceId, banId) Promise
    }

    class MembersAPI {
        +getBySpace(spaceId) Promise
        +add(spaceId, data) Promise
        +updateRole(spaceId, memberId, role) Promise
        +remove(spaceId, memberId) Promise
        +ban(spaceId, memberId, bannedBy, reason) Promise
        +leave(spaceId, userId) Promise
        +invite(spaceId, data) Promise
        +inviteUser(spaceId, userId, inviterId) Promise
    }

    class InvitesAPI {
        +accept(inviteId) Promise
        +decline(inviteId) Promise
        +getBySpace(spaceId) Promise
        +getByCode(code) Promise
        +revoke(inviteId) Promise
    }

    class ChannelsAPI {
        +getBySpace(spaceId) Promise
        +create(spaceId, data) Promise
        +update(channelId, data) Promise
        +delete(channelId) Promise
    }

    class MessagesAPI {
        +getByChannel(channelId) Promise
        +send(channelId, data) Promise
        +update(id, text, senderId) Promise
        +delete(id, senderId) Promise
        +forward(messageId, targetChannelId, senderId, spaceId) Promise
    }

    class FilesAPI {
        +getBySpace(spaceId, folderId) Promise
        +upload(spaceId, file, uploadedBy, onProgress, folderId) Promise
        +rename(fileId, name, userId) Promise
        +delete(fileId, userId) Promise
        +move(fileIds, folderId, userId) Promise
        +copy(fileIds, folderId, userId) Promise
        +download(fileId) String
        +createLink(spaceId, name, url, uploadedBy, folderId) Promise
    }

    class FoldersAPI {
        +getBySpace(spaceId, parentId) Promise
        +getById(folderId) Promise
        +create(spaceId, data) Promise
        +update(folderId, name) Promise
        +delete(folderId) Promise
    }

    class NotificationsAPI {
        +getAll(userId) Promise
        +create(data) Promise
        +markRead(id) Promise
        +markAllRead() Promise
    }

    class RequestsAPI {
        +cancel(spaceId, requestId) Promise
        +getMy(userId) Promise
        +cancelMy(userId, requestId) Promise
    }

    api *-- AuthAPI
    api *-- UsersAPI
    api *-- SpacesAPI
    api *-- MembersAPI
    api *-- InvitesAPI
    api *-- ChannelsAPI
    api *-- MessagesAPI
    api *-- FilesAPI
    api *-- FoldersAPI
    api *-- NotificationsAPI
    api *-- RequestsAPI
```

---

## View Components Hierarchy

```mermaid
classDiagram
    direction TB

    class App {
        <<Component>>
        +Router router
        +AuthProvider context
    }

    class AppLayout {
        <<Component>>
        +Sidebar sidebar
        +MobileNav mobileNav
        +Outlet content
    }

    %% Feature Components
    class AuthPage {
        <<View>>
        +String mode
        +handleLogin()
        +handleRegister()
    }

    class DashboardView {
        <<View>>
        +Space[] spaces
        +enterSpace(space)
        +handleToggleFavorite(spaceId)
    }

    class SpaceDetailsView {
        <<View>>
        +Space activeSpace
        +openChat()
        +openFiles()
        +openMembers()
    }

    class ChatView {
        <<View>>
        +Space activeChatSpace
        +Channel activeChannel
        +Message[] messages
        +handleSendMessage()
    }

    class FilesModal {
        <<View>>
        +SpaceFile[] files
        +Folder[] folders
        +handleUpload()
        +handleDelete()
        +navigateToFolder()
    }

    class MembersModal {
        <<View>>
        +SpaceMember[] members
        +handleRoleChange()
        +handleKick()
        +handleBan()
    }

    class SettingsModal {
        <<View>>
        +User user
        +handleSaveProfile()
        +handleUploadAvatar()
        +handleDeleteAccount()
    }

    class NotificationsPanel {
        <<View>>
        +Notification[] notifications
        +handleAcceptInvite()
        +handleDeclineInvite()
        +handleMarkRead()
    }

    %% Shared Components
    class ModalWrapper {
        <<Shared>>
        +Boolean isOpen
        +Function onClose
        +String size
    }

    class Avatar {
        <<Shared>>
        +Object user
        +String size
    }

    class Button {
        <<Shared>>
        +String variant
        +Boolean disabled
        +Function onClick
    }

    class ConfirmationModal {
        <<Shared>>
        +String title
        +String message
        +Function onConfirm
    }

    %% Relationships
    App *-- AppLayout
    AppLayout *-- DashboardView
    AppLayout *-- SpaceDetailsView
    AppLayout *-- ChatView
    AppLayout *-- AuthPage

    SpaceDetailsView ..> FilesModal : opens
    SpaceDetailsView ..> MembersModal : opens
    SpaceDetailsView ..> SettingsModal : opens
    AppLayout ..> NotificationsPanel : contains

    FilesModal --|> ModalWrapper
    MembersModal --|> ModalWrapper
    SettingsModal --|> ModalWrapper
    ConfirmationModal --|> ModalWrapper

    MembersModal ..> Avatar : uses
    ChatView ..> Avatar : uses
    NotificationsPanel ..> Avatar : uses
```

---

## Model-Store-View Relationships

```mermaid
classDiagram
    direction LR

    %% Models
    class User {
        <<Model>>
    }
    class Space {
        <<Model>>
    }
    class Message {
        <<Model>>
    }
    class Notification {
        <<Model>>
    }

    %% Stores
    class useAuthStore {
        <<Controller>>
        +User user
    }
    class useSpacesStore {
        <<Controller>>
        +Space[] spaces
        +Space activeSpace
    }
    class useChatStore {
        <<Controller>>
        +Message[] messages
    }
    class useNotificationsStore {
        <<Controller>>
        +Notification[] notifications
    }

    %% Views
    class AuthPage {
        <<View>>
    }
    class DashboardView {
        <<View>>
    }
    class ChatView {
        <<View>>
    }
    class NotificationsPanel {
        <<View>>
    }

    %% API
    class api {
        <<Service>>
    }

    %% Model-Store relationships
    useAuthStore --> User : manages
    useSpacesStore --> Space : manages
    useChatStore --> Message : manages
    useNotificationsStore --> Notification : manages

    %% Store-View relationships
    AuthPage --> useAuthStore : subscribes
    DashboardView --> useSpacesStore : subscribes
    DashboardView --> useAuthStore : subscribes
    ChatView --> useChatStore : subscribes
    ChatView --> useSpacesStore : subscribes
    NotificationsPanel --> useNotificationsStore : subscribes

    %% Store-API relationships
    useAuthStore --> api : calls
    useSpacesStore --> api : calls
    useChatStore --> api : calls
    useNotificationsStore --> api : calls
```

---

## Enum Types

```mermaid
classDiagram
    class UserRole {
        <<enumeration>>
        Owner
        Admin
        Member
    }

    class SpaceVisibility {
        <<enumeration>>
        public
        private
    }

    class SpaceCategory {
        <<enumeration>>
        CREATIVE
        TECH
        EDUCATION
        MEETING
    }

    class NotificationType {
        <<enumeration>>
        invite
        mention
        session
        file
        system
    }

    class InviteStatus {
        <<enumeration>>
        pending
        accepted
        declined
    }

    class MessageType {
        <<enumeration>>
        user
        system
    }

    class ModalSize {
        <<enumeration>>
        sm
        md
        lg
        xl
    }

    class ButtonVariant {
        <<enumeration>>
        primary
        secondary
        danger
        success
        warning
    }
```
