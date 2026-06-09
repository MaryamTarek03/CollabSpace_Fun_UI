# Class Diagrams by Use Case (Subsystem)

This document contains class diagrams organized by use case/subsystem, following UML object modeling principles. Each diagram shows the relevant **Entity**, **Boundary**, and **Control** objects involved in that feature.

---

## UC-01: Authenticate

**Description:** Register, login, and manage authentication to access the system

```mermaid
classDiagram
    %% ==========================================
    %% BOUNDARY OBJECTS (Conceptual UI)
    %% - Represents UI intent, not React/HTML/etc.
    %% ==========================================

    class AuthenticationView {
        <<Boundary>>
        +showLogin()
        +showRegistration()
        +displayError(message)
    }

    class LoginForm {
        <<Boundary>>
        +submit(identifier, password)
    }

    class RegistrationForm {
        <<Boundary>>
        +submit(userData)
    }

    class PasswordPolicyFeedbackView {
        <<Boundary>>
        +displayPolicyStatus(result)
    }

    class OAuthProviderLinkView {
        <<Boundary>>
        +start(provider)
    }

    %% ==========================================
    %% INTERFACE ADAPTERS
    %% ==========================================

    class AuthController {
        <<Controller>>
        +login(identifier, password)
        +register(userData)
        +startOAuth(provider)
    }

    %% ==========================================
    %% USE CASE INTERACTORS
    %% ==========================================

    class LoginUser {
        <<UseCase>>
        +execute(identifier, password) User
    }

    class RegisterUser {
        <<UseCase>>
        +execute(userData) User
    }

    class StartOAuthLogin {
        <<UseCase>>
        +execute(provider) string
    }

    %% ==========================================
    %% DOMAIN OBJECTS
    %% ==========================================

    class User {
        <<Entity>>
        -id: string
        -name: string
        -username: string
        -email: string
        -avatarColor: string
        -avatarImage: string
        -bio: string
        -createdAt: string
        -showEmail: boolean
        -profileVisibility: string
        +initials() string
    }

    class PasswordPolicy {
        <<DomainService>>
        +evaluate(password) PasswordPolicyResult
    }

    class PasswordPolicyResult {
        <<ValueObject>>
        +isStrong: boolean
        +score: number
        +requirements: RequirementStatus[]
        +nextHint: string
    }

    %% ==========================================
    %% PORTS & ADAPTERS
    %% ==========================================

    class IAuthRepository {
        <<Interface>>
        +login(credentials)* User
        +register(userData)* User
        +getOAuthUrl(provider)* string
    }

    class AuthRepositoryAdapter {
        <<Adapter>>
        +login(credentials) User
        +register(userData) User
        +getOAuthUrl(provider) string
    }

    class UserDtoMapper {
        <<Mapper>>
        +fromDto(data) User$
        +toDto(user) Object$
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    AuthenticationView --> LoginForm : contains
    AuthenticationView --> RegistrationForm : contains
    AuthenticationView --> PasswordPolicyFeedbackView : contains
    AuthenticationView --> OAuthProviderLinkView : contains

    LoginForm --> AuthController : submits
    RegistrationForm --> AuthController : submits
    OAuthProviderLinkView --> AuthController : triggers

    PasswordPolicyFeedbackView --> PasswordPolicy : uses
    RegistrationForm --> PasswordPolicy : validates

    AuthController --> LoginUser : invokes
    AuthController --> RegisterUser : invokes
    AuthController --> StartOAuthLogin : invokes

    LoginUser --> IAuthRepository : depends on
    RegisterUser --> IAuthRepository : depends on
    StartOAuthLogin --> IAuthRepository : depends on

    AuthRepositoryAdapter ..|> IAuthRepository : implements
    AuthRepositoryAdapter --> UserDtoMapper : uses
    UserDtoMapper ..> User : maps
```

---

## UC-02: Manage Profile

**Description:** View and update personal profile information and privacy settings

```mermaid
classDiagram
    %% ==========================================
    %% BOUNDARY OBJECTS (Conceptual UI)
    %% ==========================================

    class UserProfileView {
        <<Boundary>>
        +displayProfile(profile)
        +displayPrivacyNotice(reason)
        +displayError(message)
    }

    class ProfileSettingsView {
        <<Boundary>>
        +displaySettings(user)
        +displayError(message)
    }

    class ProfileEditForm {
        <<Boundary>>
        +submitProfileChanges(profileData)
    }

    class PrivacySettingsView {
        <<Boundary>>
        +submitPrivacySettings(settings)
    }

    class AvatarEditorView {
        <<Boundary>>
        +submitAvatar(imageData)
        +requestAvatarDeletion()
    }

    class UserSearchView {
        <<Boundary>>
        +submitQuery(query)
        +displayResults(users)
        +selectUser(userId)
        +displayError(message)
    }

    %% ==========================================
    %% INTERFACE ADAPTERS
    %% ==========================================

    class ProfileController {
        <<Controller>>
        +loadProfile(userId)
        +searchUsers(query)
        +updateUserProfile(userId, profileData)
        +updatePrivacy(userId, settings)
        +uploadUserAvatar(userId, imageData)
        +deleteUserAvatar(userId)
    }

    %% ==========================================
    %% USE CASE INTERACTORS
    %% ==========================================

    class ViewProfile {
        <<UseCase>>
        +execute(userId) UserProfile
    }

    class SearchUsers {
        <<UseCase>>
        +execute(query) User[]
    }

    class UpdateProfile {
        <<UseCase>>
        +execute(profileData) User
    }

    class UpdatePrivacySettings {
        <<UseCase>>
        +execute(settings) void
    }

    class UploadAvatar {
        <<UseCase>>
        +execute(imageData) User
    }

    class DeleteAvatar {
        <<UseCase>>
        +execute(userId) User
    }

    %% ==========================================
    %% DOMAIN OBJECTS
    %% ==========================================

    class User {
        <<Entity>>
        -id: string
        -name: string
        -username: string
        -email: string
        -bio: string
        -avatarColor: string
        -avatarImage: string
        -showEmail: boolean
        -profileVisibility: string
        -createdAt: string
        +initials() string
    }

    %% ==========================================
    %% PORTS & ADAPTERS
    %% ==========================================

    class IUserRepository {
        <<Interface>>
        +getById(id)* User
        +getProfile(id)* UserProfile
        +update(data)* User
        +uploadAvatar(imageData)* User
        +deleteAvatar()* User
        +updatePrivacy(settings)* void
        +search(query)* User[]
    }

    class UserRepositoryAdapter {
        <<Adapter>>
        +getById(id) User
        +getProfile(id) UserProfile
        +update(data) User
        +uploadAvatar(imageData) User
        +deleteAvatar() User
        +updatePrivacy(settings) void
        +search(query) User[]
    }

    class UserDtoMapper {
        <<Mapper>>
        +fromDto(data) User$
        +toDto(user) Object$
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    ProfileSettingsView --> ProfileEditForm : contains
    ProfileSettingsView --> PrivacySettingsView : contains
    ProfileSettingsView --> AvatarEditorView : contains

    UserProfileView --> ProfileController : requests
    ProfileSettingsView --> ProfileController : requests
    UserSearchView --> ProfileController : requests

    ProfileEditForm --> ProfileController : submits
    PrivacySettingsView --> ProfileController : submits
    AvatarEditorView --> ProfileController : submits

    ProfileController --> ViewProfile : invokes
    ProfileController --> SearchUsers : invokes
    ProfileController --> UpdateProfile : invokes
    ProfileController --> UpdatePrivacySettings : invokes
    ProfileController --> UploadAvatar : invokes
    ProfileController --> DeleteAvatar : invokes

    ViewProfile --> IUserRepository : depends on
    SearchUsers --> IUserRepository : depends on
    UpdateProfile --> IUserRepository : depends on
    UpdatePrivacySettings --> IUserRepository : depends on
    UploadAvatar --> IUserRepository : depends on
    DeleteAvatar --> IUserRepository : depends on

    UserRepositoryAdapter ..|> IUserRepository : implements
    UserRepositoryAdapter --> UserDtoMapper : uses
    UserDtoMapper ..> User : maps
```

---

## UC-03: Manage Space Lifecycle

**Description:** Create, update, configure, and delete collaborative spaces

```mermaid
classDiagram
    %% ==========================================
    %% BOUNDARY OBJECTS (Conceptual UI)
    %% ==========================================

    class SpaceDashboardView {
        <<Boundary>>
        +displaySpaces(spaces)
        +displayError(message)
    }

    class PublicSpacesListView {
        <<Boundary>>
        +submitSearch(query)
        +displayPublicSpaces(spaces)
        +selectSpace(spaceId)
        +displayError(message)
    }

    class SpaceCreationView {
        <<Boundary>>
        +submitNewSpace(spaceData)
    }

    class SpaceSettingsView {
        <<Boundary>>
        +submitSpaceUpdate(spaceId, changes)
        +submitVisibilityChange(spaceId, visibility)
        +submitThumbnail(spaceId, imageData)
    }

    class SpaceDetailsView {
        <<Boundary>>
        +displaySpace(space)
    }

    class SpaceDeletionConfirmationView {
        <<Boundary>>
        +confirmDeletion(spaceId)
    }

    %% ==========================================
    %% INTERFACE ADAPTERS
    %% ==========================================

    class SpaceController {
        <<Controller>>
        +listSpaces(userId)
        +searchSpaces(query)
        +createSpace(spaceData)
        +updateSpace(spaceId, changes)
        +updateVisibility(spaceId, visibility)
        +uploadThumbnail(spaceId, imageData)
        +deleteSpace(spaceId)
        +getSpace(spaceId)
    }

    %% ==========================================
    %% USE CASE INTERACTORS
    %% ==========================================

    class ListSpaces {
        <<UseCase>>
        +execute(userId) Space[]
    }

    class SearchSpaces {
        <<UseCase>>
        +execute(query) Space[]
    }

    class CreateSpace {
        <<UseCase>>
        +execute(spaceData) Space
    }

    class UpdateSpace {
        <<UseCase>>
        +execute(spaceId, changes) Space
    }

    class UpdateSpaceVisibility {
        <<UseCase>>
        +execute(spaceId, visibility) Space
    }

    class UploadSpaceThumbnail {
        <<UseCase>>
        +execute(spaceId, imageData) Space
    }

    class DeleteSpace {
        <<UseCase>>
        +execute(spaceId) void
    }

    class ViewSpaceDetails {
        <<UseCase>>
        +execute(spaceId) Space
    }

    %% ==========================================
    %% DOMAIN OBJECTS
    %% ==========================================

    class Space {
        <<Entity>>
        -id: string
        -name: string
        -description: string
        -category: string
        -ownerId: string
        -thumbnail: string
        -thumbnailPosition: string
        -visibility: string
        -isOnline: boolean
        -createdAt: string
        +isPrivate() boolean
        +memberCount() number
    }

    class User {
        <<Entity>>
        -id: string
        -username: string
    }

    %% ==========================================
    %% PORTS & ADAPTERS
    %% ==========================================

    class ISpaceRepository {
        <<Interface>>
        +getAll(userId)* Space[]
        +getById(id)* Space
        +create(data)* Space
        +update(id, data)* Space
        +delete(id)* void
        +search(query)* Space[]
        +uploadThumbnail(id, imageData)* Space
    }

    class SpaceRepositoryAdapter {
        <<Adapter>>
        +getAll(userId) Space[]
        +getById(id) Space
        +create(data) Space
        +update(id, data) Space
        +delete(id) void
        +search(query) Space[]
        +uploadThumbnail(id, imageData) Space
    }

    class SpaceDtoMapper {
        <<Mapper>>
        +fromDto(data) Space$
        +toDto(space) Object$
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    SpaceDashboardView --> SpaceCreationView : contains
    SpaceDashboardView --> PublicSpacesListView : contains
    SpaceDashboardView --> SpaceDetailsView : navigates to
    PublicSpacesListView --> SpaceDetailsView : navigates to
    SpaceDetailsView --> SpaceSettingsView : navigates to
    SpaceDetailsView --> SpaceDeletionConfirmationView : navigates to

    SpaceCreationView --> SpaceController : submits
    SpaceSettingsView --> SpaceController : submits
    SpaceDeletionConfirmationView --> SpaceController : submits
    SpaceDashboardView --> SpaceController : requests
    PublicSpacesListView --> SpaceController : submits
    SpaceDetailsView --> SpaceController : requests

    SpaceController --> ListSpaces : invokes
    SpaceController --> SearchSpaces : invokes
    SpaceController --> CreateSpace : invokes
    SpaceController --> UpdateSpace : invokes
    SpaceController --> UpdateSpaceVisibility : invokes
    SpaceController --> UploadSpaceThumbnail : invokes
    SpaceController --> DeleteSpace : invokes
    SpaceController --> ViewSpaceDetails : invokes

    ListSpaces --> ISpaceRepository : depends on
    SearchSpaces --> ISpaceRepository : depends on
    CreateSpace --> ISpaceRepository : depends on
    UpdateSpace --> ISpaceRepository : depends on
    UpdateSpaceVisibility --> ISpaceRepository : depends on
    UploadSpaceThumbnail --> ISpaceRepository : depends on
    DeleteSpace --> ISpaceRepository : depends on
    ViewSpaceDetails --> ISpaceRepository : depends on

    SpaceRepositoryAdapter ..|> ISpaceRepository : implements
    SpaceRepositoryAdapter --> SpaceDtoMapper : uses
    SpaceDtoMapper ..> Space : maps

    Space --> User : owned by
```

---

## UC-04: Manage Membership

**Description:** Handle space membership including invites, join requests, and leaving

```mermaid
---
config:
  layout: elk
---
classDiagram
    %% ==========================================
    %% BOUNDARY OBJECTS (Conceptual UI)
    %% ==========================================

    class MembershipView {
        <<Boundary>>
        +displayMembers(members)
        +displayJoinRequests(requests)
        +displayInviteLinks(invites)
        +displayError(message)
    }

    class JoinSpaceView {
        <<Boundary>>
        +requestJoin(spaceId, message)
    }

    class InviteManagementView {
        <<Boundary>>
        +generateInviteLink(spaceId)
        +revokeInviteLink(inviteId)
        +inviteUsers(spaceId, identifiers)
    }

    class JoinByInviteCodeView {
        <<Boundary>>
        +previewInvite(code)
        +joinByCode(code)
    }

    class JoinRequestModerationView {
        <<Boundary>>
        +approve(spaceId, requestId)
        +reject(spaceId, requestId)
    }

    class MemberAdministrationView {
        <<Boundary>>
        +removeMember(spaceId, memberId)
    }

    %% ==========================================
    %% INTERFACE ADAPTERS
    %% ==========================================

    class MembershipController {
        <<Controller>>
        +leaveSpace(spaceId)
        +requestToJoin(spaceId, message)
        +listMembers(spaceId)
        +removeMember(spaceId, memberId)
        +listJoinRequests(spaceId)
        +approveJoinRequest(spaceId, requestId)
        +rejectJoinRequest(spaceId, requestId)
        +generateInviteLink(spaceId)
        +revokeInviteLink(inviteId)
        +inviteUsers(spaceId, identifiers)
        +getInviteByCode(code)
        +joinByInviteCode(code)
    }

    %% ==========================================
    %% USE CASE INTERACTORS
    %% ==========================================

    class LeaveSpace {
        <<UseCase>>
        +execute(spaceId) void
    }

    class RequestJoinSpace {
        <<UseCase>>
        +execute(spaceId, message) JoinRequest
    }

    class ListMembers {
        <<UseCase>>
        +execute(spaceId) Member[]
    }

    class RemoveMember {
        <<UseCase>>
        +execute(spaceId, memberId) void
    }

    class ListJoinRequests {
        <<UseCase>>
        +execute(spaceId) JoinRequest[]
    }

    class ApproveJoinRequest {
        <<UseCase>>
        +execute(spaceId, requestId) void
    }

    class RejectJoinRequest {
        <<UseCase>>
        +execute(spaceId, requestId) void
    }

    class GenerateInviteLink {
        <<UseCase>>
        +execute(spaceId) Invite
    }

    class RevokeInviteLink {
        <<UseCase>>
        +execute(inviteId) void
    }

    class InviteUsersToSpace {
        <<UseCase>>
        +execute(spaceId, identifiers) void
    }

    class ViewInviteByCode {
        <<UseCase>>
        +execute(code) Invite
    }

    class JoinByInviteCode {
        <<UseCase>>
        +execute(code) void
    }

    %% ==========================================
    %% DOMAIN OBJECTS
    %% ==========================================

    class Member {
        <<Entity>>
        -id: string
        -userId: string
        -spaceId: string
        -role: string
        -joinedAt: string
        +isOwner() boolean
        +isAdmin() boolean
    }

    class JoinRequest {
        <<Entity>>
        -id: string
        -userId: string
        -spaceId: string
        -status: string
        -message: string
        -createdAt: string
    }

    class Invite {
        <<Entity>>
        -id: string
        -spaceId: string
        -inviterId: string
        -inviteeId: string
        -code: string
        -expiresAt: string
        -status: string
        +isExpired() boolean
    }

    class Space {
        <<Entity>>
        -id: string
        -name: string
        -visibility: string
        -requestsCount: number
    }

    class User {
        <<Entity>>
        -id: string
        -username: string
    }

    %% ==========================================
    %% PORTS & ADAPTERS
    %% ==========================================

    class IMemberRepository {
        <<Interface>>
        +getBySpace(spaceId)* Member[]
        +remove(spaceId, memberId)* void
        +leave(spaceId)* void
    }

    class IInviteRepository {
        <<Interface>>
        +getByCode(code)* Invite
        +createLink(spaceId)* Invite
        +revoke(inviteId)* void
        +inviteUsers(spaceId, identifiers)* void
        +getBySpace(spaceId)* Invite[]
    }

    class IJoinRequestRepository {
        <<Interface>>
        +getBySpace(spaceId)* JoinRequest[]
        +create(spaceId, message)* JoinRequest
        +approve(spaceId, requestId)* void
        +reject(spaceId, requestId)* void
    }

    class MemberRepositoryAdapter {
        <<Adapter>>
        +getBySpace(spaceId) Member[]
        +remove(spaceId, memberId) void
        +leave(spaceId) void
    }

    class InviteRepositoryAdapter {
        <<Adapter>>
        +getByCode(code) Invite
        +createLink(spaceId,) Invite
        +revoke(inviteId) void
        +inviteUsers(spaceId, identifiers) void
        +getBySpace(spaceId) Invite[]
    }

    class JoinRequestRepositoryAdapter {
        <<Adapter>>
        +getBySpace(spaceId) JoinRequest[]
        +create(spaceId, message) JoinRequest
        +approve(spaceId, requestId) void
        +reject(spaceId, requestId) void
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    MembershipView --> JoinSpaceView : contains
    MembershipView --> InviteManagementView : contains
    MembershipView --> JoinByInviteCodeView : contains
    MembershipView --> JoinRequestModerationView : contains
    MembershipView --> MemberAdministrationView : contains

    JoinSpaceView --> MembershipController : submits
    InviteManagementView --> MembershipController : submits
    JoinByInviteCodeView --> MembershipController : submits
    JoinRequestModerationView --> MembershipController : submits
    MemberAdministrationView --> MembershipController : submits

    MembershipController --> JoinSpace : invokes
    MembershipController --> LeaveSpace : invokes
    MembershipController --> RequestJoinSpace : invokes
    MembershipController --> ListMembers : invokes
    MembershipController --> RemoveMember : invokes
    MembershipController --> ListJoinRequests : invokes
    MembershipController --> ApproveJoinRequest : invokes
    MembershipController --> RejectJoinRequest : invokes
    MembershipController --> GenerateInviteLink : invokes
    MembershipController --> RevokeInviteLink : invokes
    MembershipController --> InviteUsersToSpace : invokes
    MembershipController --> ViewInviteByCode : invokes
    MembershipController --> JoinByInviteCode : invokes

    LeaveSpace --> IMemberRepository : depends on
    ListMembers --> IMemberRepository : depends on
    RemoveMember --> IMemberRepository : depends on

    RequestJoinSpace --> IJoinRequestRepository : depends on
    ListJoinRequests --> IJoinRequestRepository : depends on
    ApproveJoinRequest --> IJoinRequestRepository : depends on
    RejectJoinRequest --> IJoinRequestRepository : depends on

    GenerateInviteLink --> IInviteRepository : depends on
    RevokeInviteLink --> IInviteRepository : depends on
    InviteUsersToSpace --> IInviteRepository : depends on
    ViewInviteByCode --> IInviteRepository : depends on
    JoinByInviteCode --> IInviteRepository : depends on

    MemberRepositoryAdapter ..|> IMemberRepository : implements
    InviteRepositoryAdapter ..|> IInviteRepository : implements
    JoinRequestRepositoryAdapter ..|> IJoinRequestRepository : implements

    Member --> User : represents
    Member --> Space : belongs to
    JoinRequest --> User : from
    JoinRequest --> Space : to
    Invite --> Space : for
    Invite --> User : from inviter
```

---

## UC-05: Manage Roles & Ownership

**Description:** Assign roles, change permissions, and transfer space ownership

```mermaid
classDiagram
    %% ==========================================
    %% BOUNDARY OBJECTS (Conceptual UI)
    %% ==========================================

    class RoleManagementView {
        <<Boundary>>
        +displayMembers(members)
        +changeRole(memberId, role)
        +removeMember(memberId)
        +displayError(message)
    }

    class OwnershipTransferView {
        <<Boundary>>
        +transferOwnership(newOwnerId)
    }

    class BanManagementView {
        <<Boundary>>
        +banMember(memberId, reason)
        +unbanMember(banId)
        +displayBans(bans)
    }

    %% ==========================================
    %% INTERFACE ADAPTERS
    %% ==========================================

    class RoleOwnershipController {
        <<Controller>>
        +listMembers(spaceId)
        +changeMemberRole(spaceId, memberId, role, actorId)
        +removeMember(spaceId, memberId, actorId)
        +banMember(spaceId, memberId, actorId, reason)
        +listBans(spaceId)
        +unbanMember(spaceId, banId, actorId)
        +transferOwnership(spaceId, currentOwnerId, newOwnerId)
    }

    %% ==========================================
    %% USE CASE INTERACTORS
    %% ==========================================

    class ListSpaceMembers {
        <<UseCase>>
        +execute(spaceId) Member[]
    }

    class ChangeMemberRole {
        <<UseCase>>
        +execute(spaceId, memberId, role, actorId) void
    }

    class RemoveMember {
        <<UseCase>>
        +execute(spaceId, memberId, actorId) void
    }

    class BanMember {
        <<UseCase>>
        +execute(spaceId, memberId, actorId, reason) Ban
    }

    class ListBans {
        <<UseCase>>
        +execute(spaceId) Ban[]
    }

    class UnbanMember {
        <<UseCase>>
        +execute(spaceId, banId, actorId) void
    }

    class TransferSpaceOwnership {
        <<UseCase>>
        +execute(spaceId, currentOwnerId, newOwnerId) void
    }

    %% ==========================================
    %% DOMAIN OBJECTS
    %% ==========================================

    class Member {
        <<Entity>>
        -id: string
        -userId: string
        -spaceId: string
        -role: string
        -joinedAt: string
        +isOwner() boolean
        +isAdmin() boolean
        +isModerator() boolean
    }

    class Ban {
        <<Entity>>
        -id: string
        -userId: string
        -spaceId: string
        -bannedBy: string
        -reason: string
        -createdAt: string
    }

    class Space {
        <<Entity>>
        -id: string
        -name: string
        -ownerId: string
    }

    class User {
        <<Entity>>
        -id: string
        -username: string
    }

    %% ==========================================
    %% PORTS & ADAPTERS
    %% ==========================================

    class IMemberRepository {
        <<Interface>>
        +getBySpace(spaceId)* Member[]
        +updateRole(spaceId, memberId, role)* void
        +remove(spaceId, memberId)* void
        +ban(spaceId, memberId, bannedBy, reason)* Ban
    }

    class ISpaceRepository {
        <<Interface>>
        +transferOwnership(spaceId, currentOwnerId, newOwnerId)* void
        +getBans(spaceId)* Ban[]
        +unban(spaceId, banId)* void
    }

    class MemberRepositoryAdapter {
        <<Adapter>>
        +getBySpace(spaceId) Member[]
        +updateRole(spaceId, memberId, role) void
        +remove(spaceId, memberId) void
        +ban(spaceId, memberId, bannedBy, reason) Ban
    }

    class SpaceRepositoryAdapter {
        <<Adapter>>
        +transferOwnership(spaceId, currentOwnerId, newOwnerId) void
        +getBans(spaceId) Ban[]
        +unban(spaceId, banId) void
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    RoleManagementView --> OwnershipTransferView : navigates to
    RoleManagementView --> BanManagementView : navigates to

    RoleManagementView --> RoleOwnershipController : submits
    OwnershipTransferView --> RoleOwnershipController : submits
    BanManagementView --> RoleOwnershipController : submits

    RoleOwnershipController --> ListSpaceMembers : invokes
    RoleOwnershipController --> ChangeMemberRole : invokes
    RoleOwnershipController --> RemoveMember : invokes
    RoleOwnershipController --> BanMember : invokes
    RoleOwnershipController --> ListBans : invokes
    RoleOwnershipController --> UnbanMember : invokes
    RoleOwnershipController --> TransferSpaceOwnership : invokes

    ListSpaceMembers --> IMemberRepository : depends on
    ChangeMemberRole --> IMemberRepository : depends on
    RemoveMember --> IMemberRepository : depends on
    BanMember --> IMemberRepository : depends on

    ListBans --> ISpaceRepository : depends on
    UnbanMember --> ISpaceRepository : depends on
    TransferSpaceOwnership --> ISpaceRepository : depends on

    MemberRepositoryAdapter ..|> IMemberRepository : implements
    SpaceRepositoryAdapter ..|> ISpaceRepository : implements

    Member --> User : represents
    Member --> Space : belongs to
    Ban --> User : bans
    Ban --> Space : from
    Space --> User : owned by
```

---

## UC-06: Collaborate in Chat

**Description:** Send, reply, forward messages, mention users in space channels

```mermaid
classDiagram
    %% ==========================================
    %% BOUNDARY OBJECTS (Conceptual UI)
    %% ==========================================

    class ChatConversationView {
        <<Boundary>>
        +displayMessages(messages)
        +displayError(message)
    }

    class ChannelNavigationView {
        <<Boundary>>
        +selectChannel(channelId)
        +createChannel(name, description)
        +updateChannel(channelId, changes)
        +deleteChannel(channelId)
    }

    class MessageComposerView {
        <<Boundary>>
        +sendMessage(channelId, text, replyToId, attachments)
        +requestMentionSuggestions(query)
    }

    class MessageActionView {
        <<Boundary>>
        +deleteMessage(messageId)
        +forwardMessage(messageId, targetChannelId)
        +editMessage(messageId, newText)
    }

    class MentionSuggestionView {
        <<Boundary>>
        +displaySuggestions(members)
    }

    %% ==========================================
    %% INTERFACE ADAPTERS
    %% ==========================================

    class ChatController {
        <<Controller>>
        +listChannels(spaceId)
        +createChannel(spaceId, channelData)
        +updateChannel(channelId, changes)
        +deleteChannel(channelId)
        +listMessages(spaceId, channelId)
        +sendMessage(spaceId, channelId, messageData)
        +editMessage(messageId, newText, actorId)
        +deleteMessage(messageId, actorId)
        +forwardMessage(messageId, targetChannelId, actorId, spaceId)
        +suggestMentions(spaceId, query)
    }

    %% ==========================================
    %% USE CASE INTERACTORS
    %% ==========================================

    class ListChannels {
        <<UseCase>>
        +execute(spaceId) Channel[]
    }

    class CreateChannel {
        <<UseCase>>
        +execute(spaceId, channelData) Channel
    }

    class UpdateChannel {
        <<UseCase>>
        +execute(channelId, changes) Channel
    }

    class DeleteChannel {
        <<UseCase>>
        +execute(channelId) void
    }

    class ListMessages {
        <<UseCase>>
        +execute(spaceId, channelId) Message[]
    }

    class SendMessage {
        <<UseCase>>
        +execute(spaceId, channelId, messageData) Message
    }

    class EditMessage {
        <<UseCase>>
        +execute(messageId, newText, actorId) Message
    }

    class DeleteMessage {
        <<UseCase>>
        +execute(messageId, actorId) void
    }

    class ForwardMessage {
        <<UseCase>>
        +execute(messageId, targetChannelId, actorId, spaceId) void
    }

    class SuggestMentions {
        <<UseCase>>
        +execute(spaceId, query) Member[]
    }

    %% ==========================================
    %% DOMAIN OBJECTS
    %% ==========================================

    class Message {
        <<Entity>>
        -id: string
        -spaceId: string
        -channelId: string
        -senderId: string
        -text: string
        -type: string
        -mentions: array
        -replyToId: string
        -forwardedFromChannel: string
        -attachments: array
        -deletedAt: string
        -createdAt: string
        +isFromUser(userId) boolean
        +isDeleted() boolean
        +hasMentions() boolean
    }

    class Channel {
        <<Entity>>
        -id: string
        -spaceId: string
        -name: string
        -description: string
        -isDefault: boolean
        -createdAt: string
    }

    class Member {
        <<Entity>>
        -id: string
        -userId: string
        -username: string
        -avatarColor: string
    }

    class Space {
        <<Entity>>
        -id: string
        -name: string
    }

    %% ==========================================
    %% PORTS & ADAPTERS
    %% ==========================================

    class IChatRepository {
        <<Interface>>
        +getMessages(spaceId, channelId)* Message[]
        +sendMessage(spaceId, data)* Message
        +deleteMessage(messageId, senderId)* void
        +updateMessage(messageId, text, senderId)* Message
        +forwardMessage(messageId, targetChannelId, senderId, spaceId)* void
        +getChannels(spaceId)* Channel[]
        +createChannel(spaceId, data)* Channel
        +updateChannel(channelId, data)* Channel
        +deleteChannel(channelId)* void
    }

    class IMemberRepository {
        <<Interface>>
        +getBySpace(spaceId)* Member[]
        +searchMembers(spaceId, query)* Member[]
    }

    class ChatRepositoryAdapter {
        <<Adapter>>
        +getMessages(spaceId, channelId) Message[]
        +sendMessage(spaceId, data) Message
        +deleteMessage(messageId, senderId) void
        +updateMessage(messageId, text, senderId) Message
        +forwardMessage(messageId, targetChannelId, senderId, spaceId) void
        +getChannels(spaceId) Channel[]
        +createChannel(spaceId, data) Channel
        +updateChannel(channelId, data) Channel
        +deleteChannel(channelId) void
    }

    class MessageDtoMapper {
        <<Mapper>>
        +fromDto(data) Message$
    }

    class ChannelDtoMapper {
        <<Mapper>>
        +fromDto(data) Channel$
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    ChatConversationView --> ChannelNavigationView : contains
    ChatConversationView --> MessageComposerView : contains
    ChatConversationView --> MessageActionView : contains
    MessageComposerView --> MentionSuggestionView : contains

    ChannelNavigationView --> ChatController : submits
    MessageComposerView --> ChatController : submits
    MessageActionView --> ChatController : submits
    ChatConversationView --> ChatController : requests

    ChatController --> ListChannels : invokes
    ChatController --> CreateChannel : invokes
    ChatController --> UpdateChannel : invokes
    ChatController --> DeleteChannel : invokes
    ChatController --> ListMessages : invokes
    ChatController --> SendMessage : invokes
    ChatController --> EditMessage : invokes
    ChatController --> DeleteMessage : invokes
    ChatController --> ForwardMessage : invokes
    ChatController --> SuggestMentions : invokes

    ListChannels --> IChatRepository : depends on
    CreateChannel --> IChatRepository : depends on
    UpdateChannel --> IChatRepository : depends on
    DeleteChannel --> IChatRepository : depends on
    ListMessages --> IChatRepository : depends on
    SendMessage --> IChatRepository : depends on
    EditMessage --> IChatRepository : depends on
    DeleteMessage --> IChatRepository : depends on
    ForwardMessage --> IChatRepository : depends on

    SuggestMentions --> IMemberRepository : depends on

    ChatRepositoryAdapter ..|> IChatRepository : implements
    ChatRepositoryAdapter --> MessageDtoMapper : uses
    ChatRepositoryAdapter --> ChannelDtoMapper : uses

    Message --> Channel : belongs to
    Message --> Member : sent by
    Message "0..1" --> Message : replies to
    Channel --> Space : belongs to
```

---

## UC-07: Manage Files & Folders

**Description:** Upload, download, manage files and folders in space

```mermaid
classDiagram
    %% ==========================================
    %% BOUNDARY OBJECTS (Conceptual UI)
    %% ==========================================

    class FileBrowserView {
        <<Boundary>>
        +displayFolders(folders)
        +displayFiles(files)
        +displayError(message)
    }

    class FolderNavigationView {
        <<Boundary>>
        +openFolder(folderId)
        +navigateUp()
    }

    class FileUploadView {
        <<Boundary>>
        +upload(spaceId, folderId, fileData)
        +displayProgress(progress)
    }

    class FilePreviewView {
        <<Boundary>>
        +preview(fileId)
        +download(fileId)
    }

    class FileOrganizationView {
        <<Boundary>>
        +renameFile(fileId, name)
        +deleteFile(fileId)
        +moveFiles(fileIds, targetFolderId)
        +copyFiles(fileIds, targetFolderId)
        +createFolder(spaceId, parentFolderId, name)
        +renameFolder(folderId, name)
        +deleteFolder(folderId)
        +createLink(spaceId, folderId, name, url)
    }

    %% ==========================================
    %% INTERFACE ADAPTERS
    %% ==========================================

    class FileController {
        <<Controller>>
        +listFolderContents(spaceId, folderId)
        +uploadFile(spaceId, folderId, fileData, actorId)
        +downloadFile(fileId)
        +renameFile(fileId, name, actorId)
        +deleteFile(fileId, actorId)
        +moveFiles(fileIds, folderId, actorId)
        +copyFiles(fileIds, folderId, actorId)
        +createFolder(spaceId, parentId, name, actorId)
        +renameFolder(folderId, name, actorId)
        +deleteFolder(folderId, actorId)
        +createLink(spaceId, folderId, name, url, actorId)
    }

    %% ==========================================
    %% USE CASE INTERACTORS
    %% ==========================================

    class ListFolderContents {
        <<UseCase>>
        +execute(spaceId, folderId) FileSystemListing
    }

    class UploadFile {
        <<UseCase>>
        +execute(spaceId, folderId, fileData, actorId) File
    }

    class DownloadFile {
        <<UseCase>>
        +execute(fileId) string
    }

    class RenameFile {
        <<UseCase>>
        +execute(fileId, name, actorId) File
    }

    class DeleteFile {
        <<UseCase>>
        +execute(fileId, actorId) void
    }

    class MoveFiles {
        <<UseCase>>
        +execute(fileIds, folderId, actorId) void
    }

    class CopyFiles {
        <<UseCase>>
        +execute(fileIds, folderId, actorId) void
    }

    class CreateFolder {
        <<UseCase>>
        +execute(spaceId, parentId, name, actorId) Folder
    }

    class RenameFolder {
        <<UseCase>>
        +execute(folderId, name, actorId) Folder
    }

    class DeleteFolder {
        <<UseCase>>
        +execute(folderId, actorId) void
    }

    class CreateLink {
        <<UseCase>>
        +execute(spaceId, folderId, name, url, actorId) File
    }

    %% ==========================================
    %% DOMAIN OBJECTS
    %% ==========================================

    class File {
        <<Entity>>
        -id: string
        -spaceId: string
        -folderId: string
        -name: string
        -fileType: string
        -size: number
        -url: string
        -isLink: boolean
        -uploadedBy: string
        -uploaderUsername: string
        -thumbnailPosition: number
        -createdAt: string
        +isImage() boolean
        +isVideo() boolean
        +isPdf() boolean
    }

    class Folder {
        <<Entity>>
        -id: string
        -spaceId: string
        -parentId: string
        -name: string
        -createdBy: string
        -createdAt: string
    }

    class Space {
        <<Entity>>
        -id: string
        -name: string
    }

    class FileSystemListing {
        <<ValueObject>>
        +folders: Folder[]
        +files: File[]
    }

    %% ==========================================
    %% PORTS & ADAPTERS
    %% ==========================================

    class IFileRepository {
        <<Interface>>
        +list(spaceId, folderId)* FileSystemListing
        +upload(spaceId, folderId, fileData, actorId, onProgress)* File
        +delete(fileId, actorId)* void
        +rename(fileId, name, actorId)* File
        +move(fileIds, folderId, actorId)* void
        +copy(fileIds, folderId, actorId)* void
        +getDownloadUrl(fileId)* string
        +createFolder(spaceId, parentId, name, actorId)* Folder
        +renameFolder(folderId, name, actorId)* Folder
        +deleteFolder(folderId, actorId)* void
        +createLink(spaceId, folderId, name, url, actorId)* File
    }

    class FileRepositoryAdapter {
        <<Adapter>>
        +list(spaceId, folderId) FileSystemListing
        +upload(spaceId, folderId, fileData, actorId, onProgress) File
        +delete(fileId, actorId) void
        +rename(fileId, name, actorId) File
        +move(fileIds, folderId, actorId) void
        +copy(fileIds, folderId, actorId) void
        +getDownloadUrl(fileId) string
        +createFolder(spaceId, parentId, name, actorId) Folder
        +renameFolder(folderId, name, actorId) Folder
        +deleteFolder(folderId, actorId) void
        +createLink(spaceId, folderId, name, url, actorId) File
    }

    class FileDtoMapper {
        <<Mapper>>
        +fromDto(data) File$
        +toDto(file) Object$
    }

    class FolderDtoMapper {
        <<Mapper>>
        +fromDto(data) Folder$
        +toDto(folder) Object$
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    FileBrowserView --> FolderNavigationView : contains
    FileBrowserView --> FileUploadView : contains
    FileBrowserView --> FilePreviewView : contains
    FileBrowserView --> FileOrganizationView : contains

    FolderNavigationView --> FileController : submits
    FileUploadView --> FileController : submits
    FilePreviewView --> FileController : submits
    FileOrganizationView --> FileController : submits
    FileBrowserView --> FileController : requests

    FileController --> ListFolderContents : invokes
    FileController --> UploadFile : invokes
    FileController --> DownloadFile : invokes
    FileController --> RenameFile : invokes
    FileController --> DeleteFile : invokes
    FileController --> MoveFiles : invokes
    FileController --> CopyFiles : invokes
    FileController --> CreateFolder : invokes
    FileController --> RenameFolder : invokes
    FileController --> DeleteFolder : invokes
    FileController --> CreateLink : invokes

    ListFolderContents --> IFileRepository : depends on
    UploadFile --> IFileRepository : depends on
    DownloadFile --> IFileRepository : depends on
    RenameFile --> IFileRepository : depends on
    DeleteFile --> IFileRepository : depends on
    MoveFiles --> IFileRepository : depends on
    CopyFiles --> IFileRepository : depends on
    CreateFolder --> IFileRepository : depends on
    RenameFolder --> IFileRepository : depends on
    DeleteFolder --> IFileRepository : depends on
    CreateLink --> IFileRepository : depends on

    FileRepositoryAdapter ..|> IFileRepository : implements
    FileRepositoryAdapter --> FileDtoMapper : uses
    FileRepositoryAdapter --> FolderDtoMapper : uses

    File --> Folder : belongs to
    Folder --> Folder : nested in
    Folder --> Space : belongs to
```

---

## UC-08: View & Act on Notifications

**Description:** View notifications and respond to invites, mentions, and system alerts

```mermaid
classDiagram
    %% ==========================================
    %% BOUNDARY OBJECTS (Conceptual UI)
    %% ==========================================

    class NotificationIndicatorView {
        <<Boundary>>
        +displayUnreadCount(count)
    }

    class NotificationListView {
        <<Boundary>>
        +displayNotifications(notifications)
        +markAllRead()
        +selectNotification(notificationId)
        +displayError(message)
    }

    class NotificationActionView {
        <<Boundary>>
        +markRead(notificationId)
        +dismiss(notificationId)
        +acceptInvite(inviteId, notificationId)
        +declineInvite(inviteId, notificationId)
        +navigateToTarget(notification)
    }

    %% ==========================================
    %% INTERFACE ADAPTERS
    %% ==========================================

    class NotificationController {
        <<Controller>>
        +listNotifications(userId)
        +markNotificationRead(notificationId)
        +markAllRead(userId)
        +dismissNotification(notificationId)
        +acceptInvite(inviteId, notificationId)
        +declineInvite(inviteId, notificationId)
    }

    %% ==========================================
    %% USE CASE INTERACTORS
    %% ==========================================

    class ListNotifications {
        <<UseCase>>
        +execute(userId) Notification[]
    }

    class MarkNotificationRead {
        <<UseCase>>
        +execute(notificationId) void
    }

    class MarkAllNotificationsRead {
        <<UseCase>>
        +execute(userId) void
    }

    class DismissNotification {
        <<UseCase>>
        +execute(notificationId) void
    }

    class AcceptInvite {
        <<UseCase>>
        +execute(inviteId, notificationId) void
    }

    class DeclineInvite {
        <<UseCase>>
        +execute(inviteId, notificationId) void
    }

    %% ==========================================
    %% DOMAIN OBJECTS
    %% ==========================================

    class Notification {
        <<Entity>>
        -id: string
        -userId: string
        -type: string
        -title: string
        -message: string
        -read: boolean
        -data: object
        -createdAt: string
        +isMention() boolean
        +isInvite() boolean
        +isSystem() boolean
    }

    class Invite {
        <<Entity>>
        -id: string
        -spaceId: string
        -spaceName: string
        -inviterId: string
        -inviterName: string
        -inviteeId: string
        -status: string
        -createdAt: string
        +isPending() boolean
    }

    class User {
        <<Entity>>
        -id: string
        -username: string
    }

    class Space {
        <<Entity>>
        -id: string
        -name: string
    }

    %% ==========================================
    %% PORTS & ADAPTERS
    %% ==========================================

    class INotificationRepository {
        <<Interface>>
        +getByUser(userId)* Notification[]
        +markRead(notificationId)* void
        +markAllRead(userId)* void
        +delete(notificationId)* void
        +create(data)* Notification
    }

    class IInviteRepository {
        <<Interface>>
        +accept(inviteId)* void
        +decline(inviteId)* void
        +getByUser(userId)* Invite[]
    }

    class NotificationRepositoryAdapter {
        <<Adapter>>
        +getByUser(userId) Notification[]
        +markRead(notificationId) void
        +markAllRead(userId) void
        +delete(notificationId) void
        +create(data) Notification
    }

    class InviteRepositoryAdapter {
        <<Adapter>>
        +accept(inviteId) void
        +decline(inviteId) void
        +getByUser(userId) Invite[]
    }

    class NotificationDtoMapper {
        <<Mapper>>
        +fromDto(data) Notification$
    }

    class InviteDtoMapper {
        <<Mapper>>
        +fromDto(data) Invite$
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    NotificationIndicatorView --> NotificationListView : opens
    NotificationListView --> NotificationActionView : contains

    NotificationIndicatorView --> NotificationController : requests
    NotificationListView --> NotificationController : submits
    NotificationActionView --> NotificationController : submits

    NotificationController --> ListNotifications : invokes
    NotificationController --> MarkNotificationRead : invokes
    NotificationController --> MarkAllNotificationsRead : invokes
    NotificationController --> DismissNotification : invokes
    NotificationController --> AcceptInvite : invokes
    NotificationController --> DeclineInvite : invokes

    ListNotifications --> INotificationRepository : depends on
    MarkNotificationRead --> INotificationRepository : depends on
    MarkAllNotificationsRead --> INotificationRepository : depends on
    DismissNotification --> INotificationRepository : depends on

    AcceptInvite --> IInviteRepository : depends on
    DeclineInvite --> IInviteRepository : depends on

    NotificationRepositoryAdapter ..|> INotificationRepository : implements
    InviteRepositoryAdapter ..|> IInviteRepository : implements
    NotificationRepositoryAdapter --> NotificationDtoMapper : uses
    InviteRepositoryAdapter --> InviteDtoMapper : uses

    Notification --> User : for
    Invite --> User : to
    Invite --> User : from
    Invite --> Space : for
```

---

## UC-09: Favorite Spaces

**Description:** Mark/unmark spaces as favorites for quick access

```mermaid
classDiagram
    %% ==========================================
    %% BOUNDARY OBJECTS (Conceptual UI)
    %% ==========================================

    class FavoritesView {
        <<Boundary>>
        +displayFavoriteSpaces(spaces)
        +toggleFavorite(spaceId)
        +displayError(message)
    }

    class SpaceListView {
        <<Boundary>>
        +displaySpaces(spaces)
        +filterFavoritesOnly(enabled)
    }

    class SpaceDetailsView {
        <<Boundary>>
        +displaySpace(space)
        +toggleFavorite(spaceId)
    }

    %% ==========================================
    %% INTERFACE ADAPTERS
    %% ==========================================

    class FavoritesController {
        <<Controller>>
        +listFavorites(userId)
        +toggleFavorite(userId, spaceId)
        +addFavorite(userId, spaceId)
        +removeFavorite(userId, spaceId)
    }

    %% ==========================================
    %% USE CASE INTERACTORS
    %% ==========================================

    class ListFavoriteSpaces {
        <<UseCase>>
        +execute(userId) Space[]
    }

    class ToggleFavoriteSpace {
        <<UseCase>>
        +execute(userId, spaceId) void
    }

    class AddFavoriteSpace {
        <<UseCase>>
        +execute(userId, spaceId) Favorite
    }

    class RemoveFavoriteSpace {
        <<UseCase>>
        +execute(userId, spaceId) void
    }

    %% ==========================================
    %% DOMAIN OBJECTS
    %% ==========================================

    class Favorite {
        <<Entity>>
        -id: string
        -userId: string
        -spaceId: string
        -createdAt: string
    }

    class Space {
        <<Entity>>
        -id: string
        -name: string
        -description: string
        -thumbnail: string
        -ownerId: string
    }

    class User {
        <<Entity>>
        -id: string
        -username: string
    }

    %% ==========================================
    %% PORTS & ADAPTERS
    %% ==========================================

    class IFavoritesRepository {
        <<Interface>>
        +getFavorites(userId)* Favorite[]
        +addFavorite(userId, spaceId)* Favorite
        +removeFavorite(userId, spaceId)* void
        +toggleFavorite(userId, spaceId)* void
    }

    class FavoritesRepositoryAdapter {
        <<Adapter>>
        +getFavorites(userId) Favorite[]
        +addFavorite(userId, spaceId) Favorite
        +removeFavorite(userId, spaceId) void
        +toggleFavorite(userId, spaceId) void
    }

    class FavoriteDtoMapper {
        <<Mapper>>
        +fromDto(data) Favorite$
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    SpaceListView --> FavoritesView : contains
    SpaceDetailsView --> FavoritesView : contains

    SpaceListView --> FavoritesController : submits
    SpaceDetailsView --> FavoritesController : submits
    FavoritesView --> FavoritesController : requests

    FavoritesController --> ListFavoriteSpaces : invokes
    FavoritesController --> ToggleFavoriteSpace : invokes
    FavoritesController --> AddFavoriteSpace : invokes
    FavoritesController --> RemoveFavoriteSpace : invokes

    ListFavoriteSpaces --> IFavoritesRepository : depends on
    ToggleFavoriteSpace --> IFavoritesRepository : depends on
    AddFavoriteSpace --> IFavoritesRepository : depends on
    RemoveFavoriteSpace --> IFavoritesRepository : depends on

    FavoritesRepositoryAdapter ..|> IFavoritesRepository : implements
    FavoritesRepositoryAdapter --> FavoriteDtoMapper : uses

    Favorite --> User : belongs to
    Favorite --> Space : references
    User "1" --> "*" Favorite : has
    Space "1" --> "*" Favorite : favorited by
```

---

## Domain Layer - Entity Objects Class Diagram

This diagram shows all entity objects in the domain layer with their complete attributes, methods, and relationships.

```mermaid
classDiagram
    %% ==========================================
    %% CORE ENTITIES
    %% ==========================================

    class User {
        <<Entity>>
        -id: string
        -name: string
        -username: string
        -email: string
        -avatarColor: string
        -avatarImage: string
        -bio: string
        -visibility: string
        -searchable: boolean
        -createdAt: string
        +initials() string
        +hasAvatar() boolean
        +isPublic() boolean
    }

    class Space {
        <<Entity>>
        -id: string
        -name: string
        -description: string
        -category: string
        -ownerId: string
        -thumbnail: string
        -thumbnailPosition: string
        -visibility: string
        -isOnline: boolean
        -membersCount: number
        -requestsCount: number
        -createdAt: string
        +isPrivate() boolean
        +isPublic() boolean
        +memberCount() number
    }

    class Member {
        <<Entity>>
        -id: string
        -spaceId: string
        -userId: string
        -username: string
        -name: string
        -email: string
        -avatarColor: string
        -avatarImage: string
        -role: string
        -joinedAt: string
        +isOwner() boolean
        +isAdmin() boolean
        +isModerator() boolean
        +isMember() boolean
        +initials() string
    }

    class Message {
        <<Entity>>
        -id: string
        -spaceId: string
        -channelId: string
        -senderId: string
        -sender: string
        -avatarColor: string
        -avatarImage: string
        -text: string
        -type: string
        -mentions: array
        -replyToId: string
        -replyTo: object
        -forwardedFromChannel: string
        -forwardedFromChannelName: string
        -deletedAt: string
        -deletedBy: string
        -attachments: array
        -createdAt: string
        +isFromUser(userId) boolean
        +isDeleted() boolean
        +hasMentions() boolean
        +hasAttachments() boolean
        +isForwarded() boolean
        +isReply() boolean
    }

    class Channel {
        <<Entity>>
        -id: string
        -spaceId: string
        -name: string
        -description: string
        -isDefault: boolean
        -createdAt: string
        +isGeneral() boolean
    }

    class File {
        <<Entity>>
        -id: string
        -spaceId: string
        -folderId: string
        -name: string
        -originalName: string
        -mimeType: string
        -size: number
        -url: string
        -uploadedBy: string
        -createdAt: string
        +extension() string
        +isImage() boolean
        +isDocument() boolean
        +isVideo() boolean
        +formattedSize() string
    }

    class Folder {
        <<Entity>>
        -id: string
        -spaceId: string
        -parentId: string
        -name: string
        -createdBy: string
        -createdAt: string
        +isRoot() boolean
        +hasParent() boolean
    }

    class Notification {
        <<Entity>>
        -id: string
        -userId: string
        -type: string
        -title: string
        -message: string
        -isRead: boolean
        -data: object
        -createdAt: string
        +isMention() boolean
        +isInvite() boolean
        +isSystem() boolean
        +isJoinRequest() boolean
    }

    class Invite {
        <<Entity>>
        -id: string
        -spaceId: string
        -spaceName: string
        -inviterId: string
        -inviterName: string
        -inviteeId: string
        -inviteeName: string
        -code: string
        -expiresAt: string
        -maxUses: number
        -uses: number
        -status: string
        -createdAt: string
        +isExpired() boolean
        +isPending() boolean
        +isAccepted() boolean
        +isDeclined() boolean
        +hasUsesLeft() boolean
    }

    class JoinRequest {
        <<Entity>>
        -id: string
        -spaceId: string
        -userId: string
        -username: string
        -avatarColor: string
        -avatarImage: string
        -message: string
        -status: string
        -createdAt: string
        +isPending() boolean
        +isApproved() boolean
        +isRejected() boolean
    }

    class Ban {
        <<Entity>>
        -id: string
        -spaceId: string
        -userId: string
        -username: string
        -avatarColor: string
        -bannedBy: string
        -bannedByName: string
        -reason: string
        -createdAt: string
    }

    class Favorite {
        <<Entity>>
        -id: string
        -userId: string
        -spaceId: string
        -createdAt: string
    }

    %% ==========================================
    %% RELATIONSHIPS - User Associations
    %% ==========================================

    User "1" --> "*" Space : owns
    User "1" --> "*" Member : has memberships
    User "1" --> "*" Message : sends
    User "1" --> "*" Notification : receives
    User "1" --> "*" Favorite : has
    User "1" --> "*" Invite : sends
    User "1" --> "*" Invite : receives
    User "1" --> "*" JoinRequest : submits
    User "1" --> "*" Ban : banned as
    User "1" --> "*" File : uploads
    User "1" --> "*" Folder : creates

    %% ==========================================
    %% RELATIONSHIPS - Space Associations
    %% ==========================================

    Space "1" --> "*" Member : has
    Space "1" --> "*" Channel : contains
    Space "1" --> "*" File : stores
    Space "1" --> "*" Folder : organizes
    Space "1" --> "*" Invite : generates
    Space "1" --> "*" JoinRequest : receives
    Space "1" --> "*" Ban : enforces
    Space "1" --> "*" Favorite : favorited as

    %% ==========================================
    %% RELATIONSHIPS - Content Associations
    %% ==========================================

    Channel "1" --> "*" Message : contains
    Folder "1" --> "*" File : contains
    Folder "1" --> "*" Folder : has subfolders

    %% ==========================================
    %% RELATIONSHIPS - Message Self-References
    %% ==========================================

    Message "0..1" --> "0..1" Message : replies to
    Message "0..1" --> "0..1" Channel : forwarded from

    %% ==========================================
    %% RELATIONSHIPS - Member Junction
    %% ==========================================

    Member --> User : represents
    Member --> Space : belongs to
```

### Entity Relationships Summary

```mermaid
erDiagram
    USER ||--o{ SPACE : "owns"
    USER ||--o{ MEMBER : "has membership"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ FAVORITE : "marks"
    USER ||--o{ INVITE : "sends/receives"
    USER ||--o{ JOIN_REQUEST : "submits"
    USER ||--o{ BAN : "banned"

    SPACE ||--o{ MEMBER : "has"
    SPACE ||--o{ CHANNEL : "contains"
    SPACE ||--o{ FILE : "stores"
    SPACE ||--o{ FOLDER : "organizes"
    SPACE ||--o{ INVITE : "generates"
    SPACE ||--o{ JOIN_REQUEST : "receives"
    SPACE ||--o{ BAN : "enforces"
    SPACE ||--o{ FAVORITE : "favorited"

    CHANNEL ||--o{ MESSAGE : "contains"
    FOLDER ||--o{ FILE : "contains"
    FOLDER ||--o{ FOLDER : "has subfolders"

    MESSAGE ||--o| MESSAGE : "replies to"

    MEMBER }o--|| USER : "represents"
    MEMBER }o--|| SPACE : "belongs to"
    FAVORITE }o--|| USER : "by"
    FAVORITE }o--|| SPACE : "of"
```

---

## Summary

| Use Case                       | Primary Entities            | Primary Boundaries                                                                                           | Primary Controllers / Use Cases                                                   |
| ------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| UC-01 Authenticate             | User                        | AuthenticationView, LoginForm, RegistrationForm                                                              | AuthController; LoginUser, RegisterUser, StartOAuthLogin                          |
| UC-02 Manage Profile           | User, UserProfile           | UserProfileView, ProfileSettingsView, ProfileEditForm, PrivacySettingsView, AvatarEditorView, UserSearchView | ProfileController; ViewProfile, SearchUsers, UpdateProfile, UpdatePrivacySettings |
| UC-03 Manage Space Lifecycle   | Space, User                 | SpaceDashboardView, PublicSpacesListView, SpaceCreationView, SpaceSettingsView                               | SpaceController; ListSpaces, CreateSpace, UpdateSpace, DeleteSpace                |
| UC-04 Manage Membership        | Member, Invite, JoinRequest | MembershipView, InviteManagementView, JoinRequestModerationView                                              | MembershipController; JoinSpace, LeaveSpace, RequestJoinSpace                     |
| UC-05 Manage Roles & Ownership | Member, Ban, Space          | RoleManagementView, OwnershipTransferView, BanManagementView                                                 | RoleOwnershipController; ChangeMemberRole, TransferSpaceOwnership                 |
| UC-06 Collaborate in Chat      | Message, Channel, Member    | ChatConversationView, ChannelNavigationView, MessageComposerView                                             | ChatController; ListMessages, SendMessage, ForwardMessage                         |
| UC-07 Manage Files             | File, Folder                | FileBrowserView, FolderNavigationView, FileUploadView                                                        | FileController; ListFolderContents, UploadFile, MoveFiles                         |
| UC-08 View Notifications       | Notification, Invite        | NotificationIndicatorView, NotificationListView, NotificationActionView                                      | NotificationController; ListNotifications, MarkAllNotificationsRead               |
| UC-09 Favorite Spaces          | Favorite, Space, User       | FavoritesView, SpaceListView, SpaceDetailsView                                                               | FavoritesController; ListFavoriteSpaces, ToggleFavoriteSpace                      |

---

## References

- Bruegge, B., & Dutoit, A. H. (2009). _Object-Oriented Software Engineering Using UML, Patterns, and Java_. Chapter 5: Analysis, Object Modeling.
- Jacobson, I. (1992). _Object-Oriented Software Engineering: A Use Case Driven Approach_.
