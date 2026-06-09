# Class Reference (Tables)

This document explains every class shown in [Docs/class-diagrams-by-usecase.md](class-diagrams-by-usecase.md) using short, framework-independent descriptions.

## Legend (how to read the tables)

- `<<Boundary>>`: Conceptual UI responsibility (screens/forms/views). Not a framework component.
- `<<Controller>>`: Interface adapter that translates boundary requests into use-case calls.
- `<<UseCase>>`: Application interactor implementing a specific user goal.
- `<<Entity>>`: Domain object with identity + business rules.
- `<<ValueObject>>`: Immutable domain value (no identity).
- `<<DomainService>>`: Domain logic that doesn’t naturally belong to an entity.
- `<<Interface>>`: Port (dependency inversion point).
- `<<Adapter>>`: Infrastructure implementation of a port (API/DB/etc).
- `<<Mapper>>`: DTO ↔ domain mapping helper.

---

## UC-01: Authenticate

| Class                      | Stereotype          | Responsibility                                                                                        | Key members (from diagram)                                     |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| AuthenticationView         | `<<Boundary>>`      | Orchestrates the authentication experience (switching between login/registration and showing errors). | `showLogin()` / `showRegistration()` / `displayError(message)` |
| LoginForm                  | `<<Boundary>>`      | Captures login input and submits credentials.                                                         | `submit(identifier, password)`                                 |
| RegistrationForm           | `<<Boundary>>`      | Captures registration data and submits it.                                                            | `submit(userData)`                                             |
| PasswordPolicyFeedbackView | `<<Boundary>>`      | Displays password strength/policy evaluation feedback to the user.                                    | `displayPolicyStatus(result)`                                  |
| OAuthProviderLinkView      | `<<Boundary>>`      | Starts OAuth sign-in via a chosen provider.                                                           | `start(provider)`                                              |
| AuthController             | `<<Controller>>`    | Translates boundary actions into auth use-case calls.                                                 | `login(...)` / `register(...)` / `startOAuth(provider)`        |
| LoginUser                  | `<<UseCase>>`       | Authenticates a user using credentials via `IAuthRepository`.                                         | `execute(identifier, password) -> User`                        |
| RegisterUser               | `<<UseCase>>`       | Registers a new user via `IAuthRepository`.                                                           | `execute(userData) -> User`                                    |
| StartOAuthLogin            | `<<UseCase>>`       | Initiates OAuth by retrieving an authorization URL/token.                                             | `execute(provider) -> string`                                  |
| User                       | `<<Entity>>`        | Represents an account/profile with identity and derived behavior.                                     | `initials() -> string` + core identity/profile fields          |
| PasswordPolicy             | `<<DomainService>>` | Evaluates passwords against policy rules.                                                             | `evaluate(password) -> PasswordPolicyResult`                   |
| PasswordPolicyResult       | `<<ValueObject>>`   | Result of password evaluation (strength + guidance).                                                  | `isStrong: boolean` / `nextHint: string`                       |
| IAuthRepository            | `<<Interface>>`     | Port for authentication operations (login/register/OAuth URL).                                        | `login(*)` / `register(*)` / `getOAuthUrl(*)`                  |
| AuthRepositoryAdapter      | `<<Adapter>>`       | Implements `IAuthRepository` against an external system (API, etc.).                                  | `login(...)` / `register(...)` / `getOAuthUrl(...)`            |
| UserDtoMapper              | `<<Mapper>>`        | Maps between external user DTOs and the `User` entity.                                                | `fromDto(data) -> User` / `toDto(user) -> Object`              |

---

## UC-02: Manage Profile

| Class                 | Stereotype       | Responsibility                                                                | Key members (from diagram)                                                                                                          |
| --------------------- | ---------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| UserProfileView       | `<<Boundary>>`   | Displays a user profile (self or other) with privacy messaging.               | `displayProfile(profile)` / `displayPrivacyNotice(reason)` / `displayError(message)`                                                |
| ProfileSettingsView   | `<<Boundary>>`   | Hosts profile settings editing flows (profile, privacy, avatar).              | `displaySettings(user)` / `displayError(message)`                                                                                   |
| ProfileEditForm       | `<<Boundary>>`   | Captures profile edits and submits them.                                      | `submitProfileChanges(profileData)`                                                                                                 |
| PrivacySettingsView   | `<<Boundary>>`   | Captures privacy settings changes and submits them.                           | `submitPrivacySettings(settings)`                                                                                                   |
| AvatarEditorView      | `<<Boundary>>`   | Uploads or deletes avatar.                                                    | `submitAvatar(imageData)` / `requestAvatarDeletion()`                                                                               |
| UserSearchView        | `<<Boundary>>`   | Searches the public user directory and lets the user open a selected profile. | `submitQuery(query)` / `displayResults(users)` / `selectUser(userId)` / `displayError(message)`                                     |
| ProfileController     | `<<Controller>>` | Coordinates view + settings boundary actions into use cases.                  | `loadProfile(...)` / `searchUsers(query)` / `updateProfile(...)` / `updatePrivacy(...)` / `uploadAvatar(...)` / `deleteAvatar(...)` |
| ViewProfile           | `<<UseCase>>`    | Loads a privacy-aware profile view for a given user id.                       | `execute(userId) -> UserProfile`                                                                                                    |
| SearchUsers           | `<<UseCase>>`    | Searches users by query and returns a list of matching users.                 | `execute(query) -> User[]`                                                                                                          |
| UpdateProfile         | `<<UseCase>>`    | Updates editable profile fields.                                              | `execute(profileData) -> User`                                                                                                      |
| UpdatePrivacySettings | `<<UseCase>>`    | Updates privacy configuration for a user.                                     | `execute(settings)`                                                                                                                 |
| UploadAvatar          | `<<UseCase>>`    | Uploads avatar and returns updated user profile.                              | `execute(imageData) -> User`                                                                                                        |
| DeleteAvatar          | `<<UseCase>>`    | Removes avatar and returns updated user profile.                              | `execute() -> User`                                                                                                                 |
| User                  | `<<Entity>>`     | Represents a user including privacy fields.                                   | `initials() -> string` + identity/profile/privacy fields                                                                            |
| IUserRepository       | `<<Interface>>`  | Port for profile queries and updates.                                         | `getById(*)` / `update(*)` / `updatePrivacy(*)` / `getProfile(*)` / `search(*)` / avatar ops                                        |
| UserRepositoryAdapter | `<<Adapter>>`    | Implements `IUserRepository` using external data source.                      | Mirrors `IUserRepository` methods                                                                                                   |
| UserDtoMapper         | `<<Mapper>>`     | Maps DTOs to/from `User`.                                                     | `fromDto(...)` / `toDto(...)`                                                                                                       |

---

## UC-03: Manage Space Lifecycle

| Class                         | Stereotype       | Responsibility                                                   | Key members (from diagram)                                                                                |
| ----------------------------- | ---------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| SpaceDashboardView            | `<<Boundary>>`   | Shows spaces list and errors.                                    | `displaySpaces(spaces)` / `displayError(message)`                                                         |
| PublicSpacesListView          | `<<Boundary>>`   | Shows/searches public spaces and lets the user open one.         | `submitSearch(query)` / `displayPublicSpaces(spaces)` / `selectSpace(spaceId)` / `displayError(message)`  |
| SpaceCreationView             | `<<Boundary>>`   | Captures new-space data and submits it.                          | `submitNewSpace(spaceData)`                                                                               |
| SpaceSettingsView             | `<<Boundary>>`   | Captures updates: settings, visibility, thumbnail.               | `submitSpaceUpdate(...)` / `submitVisibilityChange(...)` / `submitThumbnail(...)`                         |
| SpaceDetailsView              | `<<Boundary>>`   | Displays details for a single space.                             | `displaySpace(space)`                                                                                     |
| SpaceDeletionConfirmationView | `<<Boundary>>`   | Confirms destructive deletion action.                            | `confirmDeletion(spaceId)`                                                                                |
| SpaceController               | `<<Controller>>` | Converts boundary operations into space lifecycle use cases.     | `listSpaces(...)` / `createSpace(...)` / `updateSpace(...)` / `deleteSpace(...)` / etc.                   |
| ListSpaces                    | `<<UseCase>>`    | Lists spaces visible to a user.                                  | `execute(userId) -> Space[]`                                                                              |
| SearchSpaces                  | `<<UseCase>>`    | Searches spaces for a user context.                              | `execute(userId, query) -> Space[]`                                                                       |
| CreateSpace                   | `<<UseCase>>`    | Creates a new space owned by a user.                             | `execute(ownerId, spaceData) -> Space`                                                                    |
| UpdateSpace                   | `<<UseCase>>`    | Updates mutable space attributes.                                | `execute(spaceId, changes) -> Space`                                                                      |
| UpdateSpaceVisibility         | `<<UseCase>>`    | Changes visibility rules for a space.                            | `execute(spaceId, visibility) -> Space`                                                                   |
| UploadSpaceThumbnail          | `<<UseCase>>`    | Uploads/replaces the space thumbnail.                            | `execute(spaceId, imageData) -> Space`                                                                    |
| DeleteSpace                   | `<<UseCase>>`    | Deletes a space.                                                 | `execute(spaceId) -> void`                                                                                |
| ViewSpaceDetails              | `<<UseCase>>`    | Loads full space details.                                        | `execute(spaceId) -> Space`                                                                               |
| Space                         | `<<Entity>>`     | Represents a collaborative space and its rules/derived behavior. | `isPrivate()` / `memberCount()` + metadata fields                                                         |
| User                          | `<<Entity>>`     | Minimal user identity used for ownership relation.               | `id`, `username`                                                                                          |
| ISpaceRepository              | `<<Interface>>`  | Port for space persistence/query.                                | `getAll(*)` / `getById(*)` / `create(*)` / `update(*)` / `delete(*)` / `search(*)` / `uploadThumbnail(*)` |
| SpaceRepositoryAdapter        | `<<Adapter>>`    | Infrastructure implementation of `ISpaceRepository`.             | Mirrors `ISpaceRepository` methods                                                                        |
| SpaceDtoMapper                | `<<Mapper>>`     | Maps DTO ↔ `Space`.                                              | `fromDto(...)` / `toDto(...)`                                                                             |

---

## UC-04: Manage Membership

| Class                        | Stereotype       | Responsibility                                                             | Key members (from diagram)                                                                           |
| ---------------------------- | ---------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| MembershipView               | `<<Boundary>>`   | Displays membership-related lists (members, requests, invites) and errors. | `displayMembers(...)` / `displayJoinRequests(...)` / `displayInviteLinks(...)` / `displayError(...)` |
| JoinSpaceView                | `<<Boundary>>`   | Supports request-join actions.                                             | `requestJoin(...)`                                                                                   |
| InviteManagementView         | `<<Boundary>>`   | Manages invite generation/revocation and inviting users.                   | `generateInviteLink(...)` / `revokeInviteLink(...)` / `inviteUsers(...)`                             |
| JoinByInviteCodeView         | `<<Boundary>>`   | Allows previewing/joining via invite code.                                 | `previewInvite(code)` / `joinByCode(code)`                                                           |
| JoinRequestModerationView    | `<<Boundary>>`   | Moderation actions for join requests.                                      | `approve(...)` / `reject(...)`                                                                       |
| MemberAdministrationView     | `<<Boundary>>`   | Admin action(s) for member removal.                                        | `removeMember(spaceId, memberId)`                                                                    |
| MembershipController         | `<<Controller>>` | Routes membership UI actions to membership use cases.                      | `joinSpace(...)` / `leaveSpace(...)` / `requestToJoin(...)` / invite/join-request ops                |
| JoinSpace                    | `<<UseCase>>`    | Adds a user to a space (membership creation).                              | `execute(spaceId, userId) -> void`                                                                   |
| LeaveSpace                   | `<<UseCase>>`    | Removes the user’s membership from a space.                                | `execute(spaceId, userId) -> void`                                                                   |
| RequestJoinSpace             | `<<UseCase>>`    | Creates a join request for moderated spaces.                               | `execute(spaceId, userId, message) -> JoinRequest`                                                   |
| ListMembers                  | `<<UseCase>>`    | Lists members in a space.                                                  | `execute(spaceId) -> Member[]`                                                                       |
| RemoveMember                 | `<<UseCase>>`    | Removes a member (by admin/moderator authority).                           | `execute(spaceId, memberId) -> void`                                                                 |
| ListJoinRequests             | `<<UseCase>>`    | Lists pending join requests.                                               | `execute(spaceId) -> JoinRequest[]`                                                                  |
| ApproveJoinRequest           | `<<UseCase>>`    | Approves and processes a join request.                                     | `execute(spaceId, requestId) -> void`                                                                |
| RejectJoinRequest            | `<<UseCase>>`    | Rejects a join request.                                                    | `execute(spaceId, requestId) -> void`                                                                |
| GenerateInviteLink           | `<<UseCase>>`    | Creates an invite link/code for a space.                                   | `execute(spaceId, inviterId) -> Invite`                                                              |
| RevokeInviteLink             | `<<UseCase>>`    | Revokes an invite link/code.                                               | `execute(inviteId, revokerId) -> void`                                                               |
| InviteUsersToSpace           | `<<UseCase>>`    | Sends direct invites to selected users.                                    | `execute(spaceId, inviterId, userIds) -> void`                                                       |
| ViewInviteByCode             | `<<UseCase>>`    | Loads invite details by code (preview).                                    | `execute(code) -> Invite`                                                                            |
| JoinByInviteCode             | `<<UseCase>>`    | Joins a space using an invite code.                                        | `execute(code, userId) -> void`                                                                      |
| Member                       | `<<Entity>>`     | Represents a user’s membership + role in a space.                          | `isOwner()` / `isAdmin()` + role/joinedAt fields                                                     |
| JoinRequest                  | `<<Entity>>`     | Represents a pending membership request and its state.                     | status/message fields                                                                                |
| Invite                       | `<<Entity>>`     | Represents a shareable invite with expiry/state.                           | `isExpired()` + code/expires/status fields                                                           |
| Space                        | `<<Entity>>`     | Minimal space data needed for membership context.                          | `id`, `name`, `visibility`, `requestsCount`                                                          |
| User                         | `<<Entity>>`     | Minimal user identity used by membership relations.                        | `id`, `username`                                                                                     |
| IMemberRepository            | `<<Interface>>`  | Port for membership persistence.                                           | `getBySpace(*)` / `add(*)` / `remove(*)` / `leave(*)`                                                |
| IInviteRepository            | `<<Interface>>`  | Port for invites persistence/actions.                                      | `getByCode(*)` / `createLink(*)` / `revoke(*)` / `inviteUsers(*)` / `getBySpace(*)`                  |
| IJoinRequestRepository       | `<<Interface>>`  | Port for join request persistence/actions.                                 | `getBySpace(*)` / `create(*)` / `approve(*)` / `reject(*)`                                           |
| MemberRepositoryAdapter      | `<<Adapter>>`    | Implements `IMemberRepository` using infrastructure.                       | Mirrors `IMemberRepository` methods                                                                  |
| InviteRepositoryAdapter      | `<<Adapter>>`    | Implements `IInviteRepository` using infrastructure.                       | Mirrors `IInviteRepository` methods                                                                  |
| JoinRequestRepositoryAdapter | `<<Adapter>>`    | Implements `IJoinRequestRepository` using infrastructure.                  | Mirrors `IJoinRequestRepository` methods                                                             |

---

## UC-05: Manage Roles & Ownership

| Class                   | Stereotype       | Responsibility                                                    | Key members (from diagram)                                                                 |
| ----------------------- | ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| RoleManagementView      | `<<Boundary>>`   | Displays members and supports role change/removal actions.        | `displayMembers(...)` / `changeRole(...)` / `removeMember(...)` / `displayError(...)`      |
| OwnershipTransferView   | `<<Boundary>>`   | Triggers ownership transfer flow.                                 | `transferOwnership(newOwnerId)`                                                            |
| BanManagementView       | `<<Boundary>>`   | Bans/unbans members and displays ban list.                        | `banMember(...)` / `unbanMember(...)` / `displayBans(bans)`                                |
| RoleOwnershipController | `<<Controller>>` | Converts boundary actions into role/ownership/ban use-case calls. | `listMembers(...)` / `changeMemberRole(...)` / `banMember(...)` / `transferOwnership(...)` |
| ListSpaceMembers        | `<<UseCase>>`    | Lists members for role/ownership management.                      | `execute(spaceId) -> Member[]`                                                             |
| ChangeMemberRole        | `<<UseCase>>`    | Changes a member role with actor authorization.                   | `execute(spaceId, memberId, role, actorId) -> void`                                        |
| RemoveMember            | `<<UseCase>>`    | Removes a member with actor authorization.                        | `execute(spaceId, memberId, actorId) -> void`                                              |
| BanMember               | `<<UseCase>>`    | Bans a member with actor authorization + reason.                  | `execute(spaceId, memberId, actorId, reason) -> Ban`                                       |
| ListBans                | `<<UseCase>>`    | Lists bans for a space.                                           | `execute(spaceId) -> Ban[]`                                                                |
| UnbanMember             | `<<UseCase>>`    | Removes a ban.                                                    | `execute(spaceId, banId, actorId) -> void`                                                 |
| TransferSpaceOwnership  | `<<UseCase>>`    | Transfers ownership between members.                              | `execute(spaceId, currentOwnerId, newOwnerId) -> void`                                     |
| Member                  | `<<Entity>>`     | Membership entity with role semantics.                            | `isOwner()` / `isAdmin()` / `isModerator()`                                                |
| Ban                     | `<<Entity>>`     | Represents a ban policy enforcement record.                       | ban metadata fields                                                                        |
| Space                   | `<<Entity>>`     | Minimal space data needed for ownership.                          | `id`, `name`, `ownerId`                                                                    |
| User                    | `<<Entity>>`     | Minimal user identity referenced by membership/ban.               | `id`, `username`                                                                           |
| IMemberRepository       | `<<Interface>>`  | Port for member role updates and bans.                            | `getBySpace(*)` / `updateRole(*)` / `remove(*)` / `ban(*)`                                 |
| ISpaceRepository        | `<<Interface>>`  | Port for ownership transfer and ban queries.                      | `transferOwnership(*)` / `getBans(*)` / `unban(*)`                                         |
| MemberRepositoryAdapter | `<<Adapter>>`    | Implements `IMemberRepository`.                                   | Mirrors `IMemberRepository` methods                                                        |
| SpaceRepositoryAdapter  | `<<Adapter>>`    | Implements `ISpaceRepository`.                                    | Mirrors `ISpaceRepository` methods                                                         |

---

## UC-06: Collaborate in Chat

| Class                 | Stereotype       | Responsibility                                                    | Key members (from diagram)                                                                                     |
| --------------------- | ---------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| ChatConversationView  | `<<Boundary>>`   | Displays messages for the selected channel and errors.            | `displayMessages(messages)` / `displayError(message)`                                                          |
| ChannelNavigationView | `<<Boundary>>`   | Selects/creates/updates/deletes channels.                         | `selectChannel(...)` / `createChannel(...)` / `updateChannel(...)` / `deleteChannel(...)`                      |
| MessageComposerView   | `<<Boundary>>`   | Composes and sends messages; requests mention suggestions.        | `sendMessage(...)` / `requestMentionSuggestions(query)`                                                        |
| MessageActionView     | `<<Boundary>>`   | Performs message actions (delete/forward/edit).                   | `deleteMessage(...)` / `forwardMessage(...)` / `editMessage(...)`                                              |
| MentionSuggestionView | `<<Boundary>>`   | Displays mention suggestions.                                     | `displaySuggestions(members)`                                                                                  |
| ChatController        | `<<Controller>>` | Routes chat boundary actions into chat/channel/message use cases. | `listChannels(...)` / `sendMessage(...)` / `editMessage(...)` / `forwardMessage(...)` / `suggestMentions(...)` |
| ListChannels          | `<<UseCase>>`    | Lists channels in a space.                                        | `execute(spaceId) -> Channel[]`                                                                                |
| CreateChannel         | `<<UseCase>>`    | Creates a channel in a space.                                     | `execute(spaceId, channelData) -> Channel`                                                                     |
| UpdateChannel         | `<<UseCase>>`    | Updates channel attributes.                                       | `execute(channelId, changes) -> Channel`                                                                       |
| DeleteChannel         | `<<UseCase>>`    | Deletes a channel.                                                | `execute(channelId) -> void`                                                                                   |
| ListMessages          | `<<UseCase>>`    | Lists messages for a channel.                                     | `execute(spaceId, channelId) -> Message[]`                                                                     |
| SendMessage           | `<<UseCase>>`    | Sends a message (and optionally reply/attachments).               | `execute(spaceId, channelId, messageData) -> Message`                                                          |
| EditMessage           | `<<UseCase>>`    | Edits a message with actor authorization.                         | `execute(messageId, newText, actorId) -> Message`                                                              |
| DeleteMessage         | `<<UseCase>>`    | Deletes a message with actor authorization.                       | `execute(messageId, actorId) -> void`                                                                          |
| ForwardMessage        | `<<UseCase>>`    | Forwards a message to another channel with actor authorization.   | `execute(messageId, targetChannelId, actorId, spaceId) -> void`                                                |
| SuggestMentions       | `<<UseCase>>`    | Searches members for mention auto-complete.                       | `execute(spaceId, query) -> Member[]`                                                                          |
| Message               | `<<Entity>>`     | Chat message entity with state (deleted/reply/mentions/etc.).     | `isFromUser(...)` / `isDeleted()` / `hasMentions()`                                                            |
| Channel               | `<<Entity>>`     | Space channel entity.                                             | channel metadata fields                                                                                        |
| Member                | `<<Entity>>`     | Minimal member identity used for mentions.                        | `userId`, `username`, avatar fields                                                                            |
| Space                 | `<<Entity>>`     | Minimal space context for channels.                               | `id`, `name`                                                                                                   |
| IChatRepository       | `<<Interface>>`  | Port for message/channel persistence and operations.              | message ops + channel ops (get/create/update/delete)                                                           |
| IMemberRepository     | `<<Interface>>`  | Port for member search/list in a space.                           | `getBySpace(*)` / `searchMembers(*)`                                                                           |
| ChatRepositoryAdapter | `<<Adapter>>`    | Implements `IChatRepository`.                                     | Mirrors `IChatRepository` methods                                                                              |
| MessageDtoMapper      | `<<Mapper>>`     | Maps message DTOs to `Message`.                                   | `fromDto(data) -> Message`                                                                                     |
| ChannelDtoMapper      | `<<Mapper>>`     | Maps channel DTOs to `Channel`.                                   | `fromDto(data) -> Channel`                                                                                     |

---

## UC-07: Manage Files & Folders

| Class                 | Stereotype        | Responsibility                                                        | Key members (from diagram)                                                 |
| --------------------- | ----------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| FileBrowserView       | `<<Boundary>>`    | Displays folder/file listings and errors.                             | `displayFolders(...)` / `displayFiles(...)` / `displayError(message)`      |
| FolderNavigationView  | `<<Boundary>>`    | Navigates the folder tree.                                            | `openFolder(folderId)` / `navigateUp()`                                    |
| FileUploadView        | `<<Boundary>>`    | Uploads files and shows progress.                                     | `upload(...)` / `displayProgress(progress)`                                |
| FilePreviewView       | `<<Boundary>>`    | Previews and downloads a file.                                        | `preview(fileId)` / `download(fileId)`                                     |
| FileOrganizationView  | `<<Boundary>>`    | Performs organization actions: rename/delete/move/copy/folders/links. | rename/delete/move/copy + folder + link actions                            |
| FileController        | `<<Controller>>`  | Routes file/folder UI actions into file use cases.                    | `listFolderContents(...)` / `uploadFile(...)` / `moveFiles(...)` / etc.    |
| ListFolderContents    | `<<UseCase>>`     | Lists folders/files in a given folder.                                | `execute(spaceId, folderId) -> FileSystemListing`                          |
| UploadFile            | `<<UseCase>>`     | Uploads a file (with actor context) and returns created `File`.       | `execute(spaceId, folderId, fileData, actorId) -> File`                    |
| DownloadFile          | `<<UseCase>>`     | Produces a download URL (or token) for a file.                        | `execute(fileId) -> string`                                                |
| RenameFile            | `<<UseCase>>`     | Renames a file with actor authorization.                              | `execute(fileId, name, actorId) -> File`                                   |
| DeleteFile            | `<<UseCase>>`     | Deletes a file with actor authorization.                              | `execute(fileId, actorId) -> void`                                         |
| MoveFiles             | `<<UseCase>>`     | Moves files to a target folder.                                       | `execute(fileIds, folderId, actorId) -> void`                              |
| CopyFiles             | `<<UseCase>>`     | Copies files to a target folder.                                      | `execute(fileIds, folderId, actorId) -> void`                              |
| CreateFolder          | `<<UseCase>>`     | Creates a folder.                                                     | `execute(spaceId, parentId, name, actorId) -> Folder`                      |
| RenameFolder          | `<<UseCase>>`     | Renames a folder.                                                     | `execute(folderId, name, actorId) -> Folder`                               |
| DeleteFolder          | `<<UseCase>>`     | Deletes a folder.                                                     | `execute(folderId, actorId) -> void`                                       |
| CreateLink            | `<<UseCase>>`     | Creates a link-like file entry (URL shortcut).                        | `execute(spaceId, folderId, name, url, actorId) -> File`                   |
| File                  | `<<Entity>>`      | Represents a stored file or a link entry with media helpers.          | `isImage()` / `isVideo()` / `isPdf()`                                      |
| Folder                | `<<Entity>>`      | Represents a folder in a space’s file tree.                           | folder identity + hierarchy fields                                         |
| Space                 | `<<Entity>>`      | Minimal space context for files.                                      | `id`, `name`                                                               |
| FileSystemListing     | `<<ValueObject>>` | Bundles folder + file results for a listing operation.                | `folders: Folder[]` / `files: File[]`                                      |
| IFileRepository       | `<<Interface>>`   | Port for file/folder storage operations.                              | `list(*)` / `upload(*)` / `move(*)` / `copy(*)` / `createFolder(*)` / etc. |
| FileRepositoryAdapter | `<<Adapter>>`     | Implements `IFileRepository`.                                         | Mirrors `IFileRepository` methods                                          |
| FileDtoMapper         | `<<Mapper>>`      | Maps DTO ↔ `File`.                                                    | `fromDto(...)` / `toDto(...)`                                              |
| FolderDtoMapper       | `<<Mapper>>`      | Maps DTO ↔ `Folder`.                                                  | `fromDto(...)` / `toDto(...)`                                              |

---

## UC-08: View & Act on Notifications

| Class                         | Stereotype       | Responsibility                                                               | Key members (from diagram)                                                                              |
| ----------------------------- | ---------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| NotificationIndicatorView     | `<<Boundary>>`   | Shows unread count and opens notifications UI.                               | `displayUnreadCount(count)`                                                                             |
| NotificationListView          | `<<Boundary>>`   | Displays list; supports mark-all-read and selecting a notification.          | `displayNotifications(...)` / `markAllRead()` / `selectNotification(...)` / `displayError(...)`         |
| NotificationActionView        | `<<Boundary>>`   | Performs actions on a selected notification (read/dismiss/invite decisions). | `markRead(...)` / `dismiss(...)` / `acceptInvite(...)` / `declineInvite(...)` / `navigateToTarget(...)` |
| NotificationController        | `<<Controller>>` | Converts notification boundary actions into notification/invite use cases.   | `listNotifications(...)` / `markAllRead(...)` / `acceptInvite(...)` / etc.                              |
| ListNotifications             | `<<UseCase>>`    | Loads notifications for a user.                                              | `execute(userId) -> Notification[]`                                                                     |
| MarkNotificationRead          | `<<UseCase>>`    | Marks a notification as read.                                                | `execute(notificationId) -> void`                                                                       |
| MarkAllNotificationsRead      | `<<UseCase>>`    | Marks all notifications as read for a user.                                  | `execute(userId) -> void`                                                                               |
| DismissNotification           | `<<UseCase>>`    | Removes/dismisses a notification.                                            | `execute(notificationId) -> void`                                                                       |
| AcceptInvite                  | `<<UseCase>>`    | Accepts an invite from notification context.                                 | `execute(inviteId, notificationId) -> void`                                                             |
| DeclineInvite                 | `<<UseCase>>`    | Declines an invite from notification context.                                | `execute(inviteId, notificationId) -> void`                                                             |
| Notification                  | `<<Entity>>`     | Represents a notification item with typed semantics.                         | `isMention()` / `isInvite()` / `isSystem()`                                                             |
| Invite                        | `<<Entity>>`     | Represents an invitation with state.                                         | `isPending()`                                                                                           |
| User                          | `<<Entity>>`     | Minimal user identity referenced by notification/invite.                     | `id`, `username`                                                                                        |
| Space                         | `<<Entity>>`     | Minimal space identity referenced by invite.                                 | `id`, `name`                                                                                            |
| INotificationRepository       | `<<Interface>>`  | Port for notification persistence/actions.                                   | `getByUser(*)` / `markRead(*)` / `markAllRead(*)` / `delete(*)` / `create(*)`                           |
| IInviteRepository             | `<<Interface>>`  | Port for invite acceptance/decline queries.                                  | `accept(*)` / `decline(*)` / `getByUser(*)`                                                             |
| NotificationRepositoryAdapter | `<<Adapter>>`    | Implements `INotificationRepository`.                                        | Mirrors `INotificationRepository` methods                                                               |
| InviteRepositoryAdapter       | `<<Adapter>>`    | Implements `IInviteRepository`.                                              | Mirrors `IInviteRepository` methods                                                                     |
| NotificationDtoMapper         | `<<Mapper>>`     | Maps DTO → `Notification`.                                                   | `fromDto(data) -> Notification`                                                                         |
| InviteDtoMapper               | `<<Mapper>>`     | Maps DTO → `Invite`.                                                         | `fromDto(data) -> Invite`                                                                               |

---

## UC-09: Favorite Spaces

| Class                      | Stereotype       | Responsibility                                                    | Key members (from diagram)                                                                |
| -------------------------- | ---------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| FavoritesView              | `<<Boundary>>`   | Displays favorites and toggles favorite state, showing errors.    | `displayFavoriteSpaces(...)` / `toggleFavorite(spaceId)` / `displayError(message)`        |
| SpaceListView              | `<<Boundary>>`   | Displays spaces list and optionally filters to favorites.         | `displaySpaces(spaces)` / `filterFavoritesOnly(enabled)`                                  |
| SpaceDetailsView           | `<<Boundary>>`   | Displays space details and toggles favorite state.                | `displaySpace(space)` / `toggleFavorite(spaceId)`                                         |
| FavoritesController        | `<<Controller>>` | Routes favorite-related boundary actions into favorite use cases. | `listFavorites(...)` / `toggleFavorite(...)` / `addFavorite(...)` / `removeFavorite(...)` |
| ListFavoriteSpaces         | `<<UseCase>>`    | Lists a user’s favorite spaces.                                   | `execute(userId) -> Space[]`                                                              |
| ToggleFavoriteSpace        | `<<UseCase>>`    | Toggles favorite state (domain decision delegated to repo).       | `execute(userId, spaceId) -> void`                                                        |
| AddFavoriteSpace           | `<<UseCase>>`    | Adds a favorite record.                                           | `execute(userId, spaceId) -> Favorite`                                                    |
| RemoveFavoriteSpace        | `<<UseCase>>`    | Removes a favorite record.                                        | `execute(userId, spaceId) -> void`                                                        |
| Favorite                   | `<<Entity>>`     | Represents a favorite relation between user and space.            | userId/spaceId association                                                                |
| Space                      | `<<Entity>>`     | Minimal space data needed for favorites UI.                       | identity + thumbnail/owner fields                                                         |
| User                       | `<<Entity>>`     | Minimal user identity used in favorites.                          | `id`, `username`                                                                          |
| IFavoritesRepository       | `<<Interface>>`  | Port for favorites persistence/actions.                           | `getFavorites(*)` / `addFavorite(*)` / `removeFavorite(*)` / `toggleFavorite(*)`          |
| FavoritesRepositoryAdapter | `<<Adapter>>`    | Implements `IFavoritesRepository`.                                | Mirrors `IFavoritesRepository` methods                                                    |
| FavoriteDtoMapper          | `<<Mapper>>`     | Maps DTO → `Favorite`.                                            | `fromDto(data) -> Favorite`                                                               |

---

## Domain Layer - Entity Objects

These are the domain entities shown in the “Domain Layer - Entity Objects Class Diagram”.

| Class        | Stereotype   | Responsibility                                                               | Notable behavior (from diagram)                                                                       |
| ------------ | ------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| User         | `<<Entity>>` | System user account/profile and privacy settings.                            | `initials()` / `hasAvatar()` / `isPublic()`                                                           |
| Space        | `<<Entity>>` | Collaborative workspace with visibility and counts.                          | `isPrivate()` / `isPublic()` / `memberCount()`                                                        |
| Member       | `<<Entity>>` | Junction entity: user membership within a space (role-based).                | `isOwner()` / `isAdmin()` / `isModerator()` / `isMember()` / `initials()`                             |
| Message      | `<<Entity>>` | Chat message with reply/forward/attachments and deletion state.              | `isFromUser()` / `isDeleted()` / `hasMentions()` / `hasAttachments()` / `isForwarded()` / `isReply()` |
| Channel      | `<<Entity>>` | Chat channel within a space.                                                 | `isGeneral()`                                                                                         |
| File         | `<<Entity>>` | Stored file metadata with helpers (type/size formatting).                    | `extension()` / `isImage()` / `isDocument()` / `isVideo()` / `formattedSize()`                        |
| Folder       | `<<Entity>>` | Folder hierarchy node for organizing files.                                  | `isRoot()` / `hasParent()`                                                                            |
| Notification | `<<Entity>>` | Notification item with typed semantics (invite/mention/system/join-request). | `isMention()` / `isInvite()` / `isSystem()` / `isJoinRequest()`                                       |
| Invite       | `<<Entity>>` | Invitation record (code/expiry/usage/state).                                 | `isExpired()` / `isPending()` / `isAccepted()` / `isDeclined()` / `hasUsesLeft()`                     |
| JoinRequest  | `<<Entity>>` | Membership request with status transitions.                                  | `isPending()` / `isApproved()` / `isRejected()`                                                       |
| Ban          | `<<Entity>>` | Ban record and enforcement metadata.                                         | (no behavior listed)                                                                                  |
| Favorite     | `<<Entity>>` | Favorite relation between a user and space.                                  | (no behavior listed)                                                                                  |
