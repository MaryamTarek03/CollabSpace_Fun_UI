# Use Case Documentation

## Level 0: Main Use Cases Summary

| UC ID | Use Case Name               | Primary Actor | Description                                                            |
| ----- | --------------------------- | ------------- | ---------------------------------------------------------------------- |
| UC-01 | Authenticate                | User          | Register, login, and manage authentication to access the system        |
| UC-02 | Manage Profile              | User          | View and update personal profile information and privacy settings      |
| UC-03 | Manage Space Lifecycle      | User          | Create, update, configure, and delete collaborative spaces             |
| UC-04 | Manage Membership           | User          | Handle space membership including invites, join requests, and leaving  |
| UC-05 | Manage Roles & Ownership    | Admin/Owner   | Assign roles, change permissions, and transfer space ownership         |
| UC-06 | Collaborate in Chat         | Member        | Send, reply, forward messages, mention users in space channels         |
| UC-07 | Manage Files                | Member        | Upload, organize, share, and manage files within spaces                |
| UC-08 | View & Act on Notifications | User          | View notifications and respond to invites, mentions, and system alerts |
| UC-09 | Favorite Spaces             | User          | Mark/unmark spaces as favorites for quick access                       |

---

## UC-01: Authenticate

| Field                 | Description                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Use Case ID**       | UC-01                                                                                                                                                                                                        |
| **Use Case Name**     | Authenticate                                                                                                                                                                                                 |
| **Actor(s)**          | User (Guest)                                                                                                                                                                                                 |
| **Description**       | Users can register a new account or login to an existing account to access the system                                                                                                                        |
| **Preconditions**     | System is accessible; For login: account exists                                                                                                                                                              |
| **Postconditions**    | User is authenticated and redirected to Dashboard                                                                                                                                                            |
| **Main Flow**         | 1. User navigates to Auth page<br>2. User selects Login or Register<br>3. User enters credentials<br>4. System validates input<br>5. System authenticates/creates user<br>6. User is redirected to Dashboard |
| **Alternative Flows** | **A1: Invalid Credentials** - Display error message<br>**A2: Account Locked** - Show lockout countdown<br>**A3: Password Strength Fail** - Show password requirements                                        |
| **Includes**          | Validate Password Strength, Check Account Lockout                                                                                                                                                            |
| **Sub-Use Cases**     | UC-01.1 Register, UC-01.2 Login, UC-01.3 Logout                                                                                                                                                              |

### UC-01.1: Register

| Field                 | Description                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**       | UC-01.1                                                                                                                                                                                                                         |
| **Use Case Name**     | Register                                                                                                                                                                                                                        |
| **Actor(s)**          | Guest User                                                                                                                                                                                                                      |
| **Description**       | Create a new user account                                                                                                                                                                                                       |
| **Preconditions**     | User is not authenticated                                                                                                                                                                                                       |
| **Postconditions**    | New account created; User logged in                                                                                                                                                                                             |
| **Main Flow**         | 1. User enters name, username, email<br>2. User enters password meeting strength requirements<br>3. User confirms password<br>4. System validates all fields<br>5. System creates account<br>6. User is logged in automatically |
| **Alternative Flows** | **A1: Username taken** - Show error<br>**A2: Email exists** - Show error<br>**A3: Weak password** - Show hint for next requirement                                                                                              |

### UC-01.2: Login

| Field                 | Description                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**       | UC-01.2                                                                                                                           |
| **Use Case Name**     | Login                                                                                                                             |
| **Actor(s)**          | Registered User                                                                                                                   |
| **Description**       | Authenticate with existing credentials                                                                                            |
| **Preconditions**     | User has an account                                                                                                               |
| **Postconditions**    | User is authenticated                                                                                                             |
| **Main Flow**         | 1. User enters email/username<br>2. User enters password<br>3. System validates credentials<br>4. User is redirected to Dashboard |
| **Alternative Flows** | **A1: Invalid credentials** - Show error, increment failed attempts<br>**A2: Account locked** - Show countdown timer              |

### UC-01.3: Logout

| Field              | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-01.3                                                                              |
| **Use Case Name**  | Logout                                                                               |
| **Actor(s)**       | Authenticated User                                                                   |
| **Description**    | End the current session                                                              |
| **Preconditions**  | User is authenticated                                                                |
| **Postconditions** | User session ended; Redirected to Auth page                                          |
| **Main Flow**      | 1. User clicks logout<br>2. System clears session<br>3. User redirected to Auth page |

---

## UC-02: Manage Profile

| Field                 | Description                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**       | UC-02                                                                                                                                                 |
| **Use Case Name**     | Manage Profile                                                                                                                                        |
| **Actor(s)**          | Authenticated User                                                                                                                                    |
| **Description**       | View and update personal profile information, avatar, and privacy settings                                                                            |
| **Preconditions**     | User is authenticated                                                                                                                                 |
| **Postconditions**    | Profile information is updated                                                                                                                        |
| **Main Flow**         | 1. User opens Settings modal<br>2. User selects Profile tab<br>3. User modifies profile fields<br>4. User saves changes<br>5. System updates profile  |
| **Alternative Flows** | **A1: Validation error** - Show field errors<br>**A2: Upload avatar** - Open cropper                                                                  |
| **Sub-Use Cases**     | UC-02.1 Edit Profile Info, UC-02.2 Upload Avatar, UC-02.3 Configure Privacy, UC-02.4 Delete Account, UC-02.5 View Other Profile, UC-02.6 Search Users |

### UC-02.1: Edit Profile Info

| Field                 | Description                                                                                                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**       | UC-02.1                                                                                                                                                                                                                                |
| **Use Case Name**     | Edit Profile Info                                                                                                                                                                                                                      |
| **Actor(s)**          | Authenticated User                                                                                                                                                                                                                     |
| **Description**       | Update name, username, and bio                                                                                                                                                                                                         |
| **Preconditions**     | User is authenticated                                                                                                                                                                                                                  |
| **Postconditions**    | Profile information updated                                                                                                                                                                                                            |
| **Main Flow**         | 1. User opens Settings > Profile<br>2. User edits name (2-30 chars)<br>3. User edits username (3-20 chars, lowercase/numbers/underscores)<br>4. User edits bio (max 160 chars)<br>5. User clicks Save<br>6. System validates and saves |
| **Alternative Flows** | **A1: Invalid username format** - Show validation error                                                                                                                                                                                |

### UC-02.2: Upload Avatar

| Field                 | Description                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Use Case ID**       | UC-02.2                                                                                                                                                                                                                  |
| **Use Case Name**     | Upload Avatar                                                                                                                                                                                                            |
| **Actor(s)**          | Authenticated User                                                                                                                                                                                                       |
| **Description**       | Upload and crop a profile picture                                                                                                                                                                                        |
| **Preconditions**     | User is authenticated                                                                                                                                                                                                    |
| **Postconditions**    | Avatar image updated                                                                                                                                                                                                     |
| **Main Flow**         | 1. User clicks avatar area or drags image<br>2. System validates file (JPEG/PNG/WebP/GIF, max 2MB)<br>3. Image cropper opens<br>4. User adjusts zoom and position<br>5. User applies crop<br>6. System uploads and saves |
| **Alternative Flows** | **A1: Invalid file type** - Show error<br>**A2: File too large** - Show error                                                                                                                                            |

### UC-02.3: Configure Privacy

| Field              | Description                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-02.3                                                                                                                                                         |
| **Use Case Name**  | Configure Privacy                                                                                                                                               |
| **Actor(s)**       | Authenticated User                                                                                                                                              |
| **Description**    | Set profile visibility and email display preferences                                                                                                            |
| **Preconditions**  | User is authenticated                                                                                                                                           |
| **Postconditions** | Privacy settings updated                                                                                                                                        |
| **Main Flow**      | 1. User opens Settings > Privacy<br>2. User toggles Show Email option<br>3. User sets Profile Visibility (public/members-only/private)<br>4. User saves changes |

### UC-02.4: Delete Account

| Field              | Description                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-02.4                                                                                                                                                      |
| **Use Case Name**  | Delete Account                                                                                                                                               |
| **Actor(s)**       | Authenticated User                                                                                                                                           |
| **Description**    | Permanently delete user account                                                                                                                              |
| **Preconditions**  | User is authenticated                                                                                                                                        |
| **Postconditions** | Account deleted; User logged out                                                                                                                             |
| **Main Flow**      | 1. User opens Settings > General<br>2. User clicks Delete Account<br>3. User types "DELETE" to confirm<br>4. System deletes account<br>5. User is logged out |

### UC-02.5: View Other Profile

| Field                 | Description                                                                                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**       | UC-02.5                                                                                                                                                                                                        |
| **Use Case Name**     | View Other Profile                                                                                                                                                                                             |
| **Actor(s)**          | Authenticated User                                                                                                                                                                                             |
| **Description**       | View another user's profile information                                                                                                                                                                        |
| **Preconditions**     | User is authenticated                                                                                                                                                                                          |
| **Postconditions**    | Profile displayed (based on privacy settings)                                                                                                                                                                  |
| **Main Flow**         | 1. User clicks on another user's name/avatar<br>2. System fetches profile with privacy check<br>3. System displays public info, shared spaces<br>4. User can invite to their spaces (if the profile is public) |
| **Alternative Flows** | **A1: Private profile** - Show limited info with lock icon                                                                                                                                                     |

### UC-02.6: Search Users

| Field                 | Description                                                                                                                                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**       | UC-02.6                                                                                                                                                                                                                                                               |
| **Use Case Name**     | Search Users                                                                                                                                                                                                                                                          |
| **Actor(s)**          | Authenticated User                                                                                                                                                                                                                                                    |
| **Description**       | Search for users by username/name to discover people and open their profiles                                                                                                                                                                                          |
| **Preconditions**     | User is authenticated                                                                                                                                                                                                                                                 |
| **Postconditions**    | A list of matching users is displayed; user may open a selected profile                                                                                                                                                                                               |
| **Main Flow**         | 1. User opens the user search (directory/search field)<br>2. User enters a query (min 2 chars)<br>3. System retrieves matching users (privacy-aware, if applicable)<br>4. System displays results<br>5. User selects a result<br>6. System opens the selected profile |
| **Alternative Flows** | **A1: Query too short** - Show no results / prompt to type more<br>**A2: No matches** - Show empty state<br>**A3: Request failed** - Show error and allow retry                                                                                                       |
| **Includes**          | UC-02.5 View Other Profile                                                                                                                                                                                                                                            |

---

## UC-03: Manage Space Lifecycle

| Field              | Description                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-03                                                                                                                                                                  |
| **Use Case Name**  | Manage Space Lifecycle                                                                                                                                                 |
| **Actor(s)**       | Authenticated User, Space Owner                                                                                                                                        |
| **Description**    | Create, configure, update, and delete collaborative spaces                                                                                                             |
| **Preconditions**  | User is authenticated                                                                                                                                                  |
| **Postconditions** | Space is created/updated/deleted                                                                                                                                       |
| **Main Flow**      | 1. User initiates space action<br>2. System presents appropriate UI<br>3. User completes action<br>4. System applies changes                                           |
| **Sub-Use Cases**  | UC-03.1 Create Space, UC-03.2 Update Space Settings, UC-03.3 Change Space Appearance, UC-03.4 Set Space Visibility, UC-03.5 Delete Space, UC-03.6 Search Public Spaces |

### UC-03.1: Create Space

| Field              | Description                                                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-03.1                                                                                                                                                                                                            |
| **Use Case Name**  | Create Space                                                                                                                                                                                                       |
| **Actor(s)**       | Authenticated User                                                                                                                                                                                                 |
| **Description**    | Create a new collaborative space                                                                                                                                                                                   |
| **Preconditions**  | User is authenticated                                                                                                                                                                                              |
| **Postconditions** | New space created; User is Owner                                                                                                                                                                                   |
| **Main Flow**      | 1. User clicks "Create Space"<br>2. User enters name (max 50 chars)<br>3. User enters description (max 200 chars)<br>4. User selects template/vibe<br>5. System creates space<br>6. User gets invite link to share |

### UC-03.2: Update Space Settings

| Field              | Description                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-03.2                                                                                           |
| **Use Case Name**  | Update Space Settings                                                                             |
| **Actor(s)**       | Space Owner, Admin                                                                                |
| **Description**    | Modify space name and description                                                                 |
| **Preconditions**  | User has Admin/Owner role                                                                         |
| **Postconditions** | Space settings updated                                                                            |
| **Main Flow**      | 1. User opens Space Settings > General<br>2. User edits name/description<br>3. User saves changes |

### UC-03.3: Change Space Appearance

| Field              | Description                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-03.3                                                                                                               |
| **Use Case Name**  | Change Space Appearance                                                                                               |
| **Actor(s)**       | Space Owner, Admin                                                                                                    |
| **Description**    | Update space thumbnail (gradient or image)                                                                            |
| **Preconditions**  | User has Admin/Owner role                                                                                             |
| **Postconditions** | Space appearance updated                                                                                              |
| **Main Flow**      | 1. User opens Space Settings > Appearance<br>2. User selects gradient OR uploads image<br>3. System updates thumbnail |

### UC-03.4: Set Space Visibility

| Field              | Description                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-03.4                                                                                                  |
| **Use Case Name**  | Set Space Visibility                                                                                     |
| **Actor(s)**       | Space Owner, Admin                                                                                       |
| **Description**    | Set space as public or private                                                                           |
| **Preconditions**  | User has Admin/Owner role                                                                                |
| **Postconditions** | Visibility setting updated                                                                               |
| **Main Flow**      | 1. User opens Space Settings > General<br>2. User toggles Public/Private<br>3. System updates visibility |
| **Notes**          | Public: Anyone can find and request to join. Private: Only invited users can access                      |

### UC-03.5: Delete Space

| Field              | Description                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-03.5                                                                                                                                   |
| **Use Case Name**  | Delete Space                                                                                                                              |
| **Actor(s)**       | Space Owner                                                                                                                               |
| **Description**    | Permanently delete a space                                                                                                                |
| **Preconditions**  | User is Space Owner                                                                                                                       |
| **Postconditions** | Space and all data deleted                                                                                                                |
| **Main Flow**      | 1. User opens Space Settings > Danger Zone<br>2. User clicks Delete Space<br>3. User types "DELETE" to confirm<br>4. System deletes space |

### UC-03.6: Search Public Spaces

| Field              | Description                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-03.6                                                                                                                                 |
| **Use Case Name**  | Search Public Spaces                                                                                                                    |
| **Actor(s)**       | Authenticated User                                                                                                                      |
| **Description**    | Search and browse public spaces                                                                                                         |
| **Preconditions**  | User is authenticated                                                                                                                   |
| **Postconditions** | Search results displayed                                                                                                                |
| **Main Flow**      | 1. User clicks "Find Spaces"<br>2. System loads public spaces<br>3. User searches by name/description<br>4. Results filter in real-time |

---

## UC-04: Manage Membership

| Field              | Description                                                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04                                                                                                                                                                                                                                               |
| **Use Case Name**  | Manage Membership                                                                                                                                                                                                                                   |
| **Actor(s)**       | User, Member, Admin, Owner                                                                                                                                                                                                                          |
| **Description**    | Handle all aspects of space membership                                                                                                                                                                                                              |
| **Preconditions**  | User is authenticated                                                                                                                                                                                                                               |
| **Postconditions** | Membership status updated                                                                                                                                                                                                                           |
| **Sub-Use Cases**  | UC-04.1 Invite by Email, UC-04.2 Generate Invite Link, UC-04.3 Join via Link, UC-04.4 Request to Join, UC-04.5 Approve/Reject Request, UC-04.6 Remove Member, UC-04.7 Ban Member, UC-04.8 Unban Member, UC-04.9 Leave Space, UC-04.10 Revoke Invite |

### UC-04.1: Invite by Email

| Field              | Description                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04.1                                                                                                                     |
| **Use Case Name**  | Invite by Email                                                                                                             |
| **Actor(s)**       | Member (public), Admin/Owner (private)                                                                                      |
| **Description**    | Send email invitations to join space                                                                                        |
| **Preconditions**  | User has invite permission                                                                                                  |
| **Postconditions** | Invite notifications sent                                                                                                   |
| **Main Flow**      | 1. User opens Invite modal<br>2. User enters email addresses<br>3. User clicks Send<br>4. System sends invite notifications |

### UC-04.2: Generate Invite Link

| Field              | Description                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04.2                                                                                                                                                                   |
| **Use Case Name**  | Generate Invite Link                                                                                                                                                      |
| **Actor(s)**       | Admin/Owner                                                                                                                                                               |
| **Description**    | Create shareable invite link with optional expiration                                                                                                                     |
| **Preconditions**  | User can invite to space                                                                                                                                                  |
| **Postconditions** | Invite link created                                                                                                                                                       |
| **Main Flow**      | 1. User opens Invite modal > Link tab<br>2. User sets expiration (optional)<br>3. User sets max uses (optional)<br>4. User generates link<br>5. User copies link to share |

### UC-04.3: Join via Link

| Field                 | Description                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**       | UC-04.3                                                                                                                                                                   |
| **Use Case Name**     | Join via Link                                                                                                                                                             |
| **Actor(s)**          | Authenticated User                                                                                                                                                        |
| **Description**       | Join a space using an invite link/code                                                                                                                                    |
| **Preconditions**     | User is authenticated; Valid invite link                                                                                                                                  |
| **Postconditions**    | User becomes member                                                                                                                                                       |
| **Main Flow**         | 1. User clicks "Join via Code"<br>2. User enters invite code/URL<br>3. System validates and shows space preview<br>4. User confirms join<br>5. System adds user as member |
| **Alternative Flows** | **A1: Expired link** - Show error<br>**A2: Already member** - Navigate to space                                                                                           |

### UC-04.4: Request to Join

| Field              | Description                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04.4                                                                                                                      |
| **Use Case Name**  | Request to Join                                                                                                              |
| **Actor(s)**       | Authenticated User                                                                                                           |
| **Description**    | Request to join a public space                                                                                               |
| **Preconditions**  | Space is public; User not a member                                                                                           |
| **Postconditions** | Join request created                                                                                                         |
| **Main Flow**      | 1. User finds public space<br>2. User clicks "Request Join"<br>3. System creates pending request<br>4. Admins/Owner notified |

### UC-04.5: Approve/Reject Request

| Field              | Description                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04.5                                                                                                                                             |
| **Use Case Name**  | Approve/Reject Request                                                                                                                              |
| **Actor(s)**       | Admin, Owner                                                                                                                                        |
| **Description**    | Process pending join requests                                                                                                                       |
| **Preconditions**  | User has Admin/Owner role; Pending requests exist                                                                                                   |
| **Postconditions** | Request approved (user joins) or rejected                                                                                                           |
| **Main Flow**      | 1. Admin opens Members modal > Requests tab<br>2. Admin views pending requests<br>3. Admin clicks Approve or Reject<br>4. System updates membership |

### UC-04.6: Remove Member

| Field              | Description                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04.6                                                                                                                                       |
| **Use Case Name**  | Remove Member                                                                                                                                 |
| **Actor(s)**       | Admin, Owner                                                                                                                                  |
| **Description**    | Remove a member from space (kick)                                                                                                             |
| **Preconditions**  | User has Admin/Owner role; Target is not Owner; Admin can't kick another admin                                                                |
| **Postconditions** | Member removed from space                                                                                                                     |
| **Main Flow**      | 1. Admin opens Members modal<br>2. Admin clicks Remove on member<br>3. System shows confirmation<br>4. Admin confirms<br>5. Member is removed |

### UC-04.7: Ban Member

| Field              | Description                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04.7                                                                                                                                 |
| **Use Case Name**  | Ban Member                                                                                                                              |
| **Actor(s)**       | Admin, Owner                                                                                                                            |
| **Description**    | Ban a member from space (cannot rejoin)                                                                                                 |
| **Preconditions**  | User has Admin/Owner role; Target is not Owner; Admin can't ban another admin                                                           |
| **Postconditions** | Member banned and removed                                                                                                               |
| **Main Flow**      | 1. Admin opens Members modal<br>2. Admin clicks Ban on member<br>3. Admin enters reason (optional)<br>4. System bans and removes member |

### UC-04.8: Unban Member

| Field              | Description                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04.8                                                                                        |
| **Use Case Name**  | Unban Member                                                                                   |
| **Actor(s)**       | Admin, Owner                                                                                   |
| **Description**    | Remove ban from user                                                                           |
| **Preconditions**  | User has Admin/Owner role; User is banned                                                      |
| **Postconditions** | Ban removed                                                                                    |
| **Main Flow**      | 1. Admin opens Space Settings > Banned Users<br>2. Admin clicks Unban<br>3. System removes ban |

### UC-04.9: Leave Space

| Field              | Description                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04.9                                                                                               |
| **Use Case Name**  | Leave Space                                                                                           |
| **Actor(s)**       | Member                                                                                                |
| **Description**    | Voluntarily leave a space                                                                             |
| **Preconditions**  | User is member; User is not sole Owner                                                                |
| **Postconditions** | User removed from space                                                                               |
| **Main Flow**      | 1. User opens space options<br>2. User clicks Leave Space<br>3. System confirms<br>4. User is removed |

### UC-04.10: Revoke Invite

| Field              | Description                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-04.10                                                                                                        |
| **Use Case Name**  | Revoke Invite                                                                                                   |
| **Actor(s)**       | Admin, Owner                                                                                                    |
| **Description**    | Cancel a pending invite or invite link                                                                          |
| **Preconditions**  | User has Admin/Owner role                                                                                       |
| **Postconditions** | Invite revoked                                                                                                  |
| **Main Flow**      | 1. Admin opens Space Settings > Pending Invites<br>2. Admin clicks Revoke on invite<br>3. System cancels invite |

---

## UC-05: Manage Roles & Ownership

| Field              | Description                                            |
| ------------------ | ------------------------------------------------------ |
| **Use Case ID**    | UC-05                                                  |
| **Use Case Name**  | Manage Roles & Ownership                               |
| **Actor(s)**       | Admin, Owner                                           |
| **Description**    | Manage member roles and space ownership                |
| **Preconditions**  | User has Admin/Owner role                              |
| **Postconditions** | Roles/ownership updated                                |
| **Sub-Use Cases**  | UC-05.1 Change Member Role, UC-05.2 Transfer Ownership |

### UC-05.1: Change Member Role

| Field               | Description                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**     | UC-05.1                                                                                                          |
| **Use Case Name**   | Change Member Role                                                                                               |
| **Actor(s)**        | Admin, Owner                                                                                                     |
| **Description**     | Promote or demote member role                                                                                    |
| **Preconditions**   | User has Admin/Owner role; Target is not Owner, Admin can't demote other admins                                  |
| **Postconditions**  | Member role updated                                                                                              |
| **Main Flow**       | 1. Admin opens Members modal<br>2. Admin selects new role from dropdown (Admin/Member)<br>3. System updates role |
| **Roles Available** | Owner, Admin, Member                                                                                             |

### UC-05.2: Transfer Ownership

| Field              | Description                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-05.2                                                                                                                                                     |
| **Use Case Name**  | Transfer Ownership                                                                                                                                          |
| **Actor(s)**       | Owner                                                                                                                                                       |
| **Description**    | Transfer space ownership to another member                                                                                                                  |
| **Preconditions**  | User is current Owner                                                                                                                                       |
| **Postconditions** | New owner assigned; Previous owner becomes Admin                                                                                                            |
| **Main Flow**      | 1. Owner opens Members modal<br>2. Owner selects "Make Owner" for a member<br>3. System shows confirmation<br>4. Owner confirms<br>5. Ownership transferred |

---

## UC-06: Collaborate in Chat

| Field              | Description                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-06                                                                                                                                                              |
| **Use Case Name**  | Collaborate in Chat                                                                                                                                                |
| **Actor(s)**       | Member                                                                                                                                                             |
| **Description**    | Real-time messaging within space channels                                                                                                                          |
| **Preconditions**  | User is member of space                                                                                                                                            |
| **Postconditions** | Messages sent/received                                                                                                                                             |
| **Sub-Use Cases**  | UC-06.1 Send Message, UC-06.2 Reply to Message, UC-06.3 Forward Message, UC-06.4 Mention Users, UC-06.5 Edit Message, UC-06.6 Delete Message, UC-06.7 Attach Files |

### UC-06.1: Send Message

| Field              | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-06.1                                                                                 |
| **Use Case Name**  | Send Message                                                                            |
| **Actor(s)**       | Member                                                                                  |
| **Description**    | Send a text message to a channel                                                        |
| **Preconditions**  | User is in a channel                                                                    |
| **Postconditions** | Message sent and displayed                                                              |
| **Main Flow**      | 1. User types message<br>2. User presses Enter or Send<br>3. Message appears in channel |

### UC-06.2: Reply to Message

| Field              | Description                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-06.2                                                                                                                                   |
| **Use Case Name**  | Reply to Message                                                                                                                          |
| **Actor(s)**       | Member                                                                                                                                    |
| **Description**    | Reply to a specific message                                                                                                               |
| **Preconditions**  | Message exists in channel                                                                                                                 |
| **Postconditions** | Reply sent with reference                                                                                                                 |
| **Main Flow**      | 1. User clicks Reply on message<br>2. Reply preview shows in input<br>3. User types reply<br>4. User sends<br>5. Reply linked to original |

### UC-06.3: Forward Message

| Field              | Description                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-06.3                                                                                                                                           |
| **Use Case Name**  | Forward Message                                                                                                                                   |
| **Actor(s)**       | Member                                                                                                                                            |
| **Description**    | Forward a message to another channel                                                                                                              |
| **Preconditions**  | Multiple channels exist                                                                                                                           |
| **Postconditions** | Message forwarded to target channel                                                                                                               |
| **Main Flow**      | 1. User clicks Forward on message<br>2. Modal shows available channels<br>3. User selects target channel<br>4. Message forwarded with attribution |

### UC-06.4: Mention Users

| Field                | Description                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Use Case ID**      | UC-06.4                                                                                                                                                                              |
| **Use Case Name**    | Mention Users                                                                                                                                                                        |
| **Actor(s)**         | Member                                                                                                                                                                               |
| **Description**      | Mention users or groups in messages                                                                                                                                                  |
| **Preconditions**    | User is composing message                                                                                                                                                            |
| **Postconditions**   | Mentioned users notified                                                                                                                                                             |
| **Main Flow**        | 1. User types @ in message<br>2. Mention list appears<br>3. User selects member or @everyone/@admins/@owner<br>4. Mention inserted<br>5. Message sent<br>6. Mentioned users notified |
| **Special Mentions** | @everyone, @admins, @owner                                                                                                                                                           |

### UC-06.5: Edit Message

| Field              | Description                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-06.5                                                                                                     |
| **Use Case Name**  | Edit Message                                                                                                |
| **Actor(s)**       | Message Author                                                                                              |
| **Description**    | Edit own message content                                                                                    |
| **Preconditions**  | User authored the message, and before the edit time window expires                                          |
| **Postconditions** | Message updated with edited indicator                                                                       |
| **Main Flow**      | 1. User clicks Edit on own message<br>2. Message becomes editable<br>3. User modifies text<br>4. User saves |

### UC-06.6: Delete Message

| Field              | Description                                                                         |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-06.6                                                                             |
| **Use Case Name**  | Delete Message                                                                      |
| **Actor(s)**       | Message Author, Admin, Owner                                                        |
| **Description**    | Delete a message (soft delete)                                                      |
| **Preconditions**  | User authored message OR has Admin/Owner role                                       |
| **Postconditions** | Message marked as deleted                                                           |
| **Main Flow**      | 1. User clicks Delete on message<br>2. System confirms<br>3. Message deleted/hidden |

### UC-06.7: Attach Files

| Field              | Description                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-06.7                                                                                                                                                |
| **Use Case Name**  | Attach Files                                                                                                                                           |
| **Actor(s)**       | Member                                                                                                                                                 |
| **Description**    | Attach files to chat messages                                                                                                                          |
| **Preconditions**  | User is composing message                                                                                                                              |
| **Postconditions** | Files uploaded and attached                                                                                                                            |
| **Main Flow**      | 1. User clicks attachment button<br>2. User selects files (max 5)<br>3. Files preview shown<br>4. User sends message<br>5. Files uploaded with message |

---

## UC-07: Manage Files

| Field              | Description                                                                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-07                                                                                                                                                                                                                                   |
| **Use Case Name**  | Manage Files                                                                                                                                                                                                                            |
| **Actor(s)**       | Member                                                                                                                                                                                                                                  |
| **Description**    | Upload, organize, and manage files within spaces                                                                                                                                                                                        |
| **Preconditions**  | User is member of space                                                                                                                                                                                                                 |
| **Postconditions** | Files managed                                                                                                                                                                                                                           |
| **Sub-Use Cases**  | UC-07.1 Upload File, UC-07.2 Create Folder, UC-07.3 Navigate Folders, UC-07.4 Rename File/Folder, UC-07.5 Delete File/Folder, UC-07.6 Move Files, UC-07.7 Copy Files, UC-07.8 Preview File, UC-07.9 Download File, UC-07.10 Create Link |

### UC-07.1: Upload File

| Field              | Description                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-07.1                                                                                                                  |
| **Use Case Name**  | Upload File                                                                                                              |
| **Actor(s)**       | Member                                                                                                                   |
| **Description**    | Upload files to current folder                                                                                           |
| **Preconditions**  | User has access to space                                                                                                 |
| **Postconditions** | File uploaded and displayed                                                                                              |
| **Main Flow**      | 1. User clicks Upload button<br>2. User selects file<br>3. Progress bar shows upload status<br>4. File appears in folder |

### UC-07.2: Create Folder

| Field              | Description                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-07.2                                                                                             |
| **Use Case Name**  | Create Folder                                                                                       |
| **Actor(s)**       | Admin/Owner                                                                                         |
| **Description**    | Create a new folder                                                                                 |
| **Preconditions**  | User has access to space                                                                            |
| **Postconditions** | Folder created                                                                                      |
| **Main Flow**      | 1. User clicks Create Folder<br>2. User enters folder name<br>3. Folder created in current location |

### UC-07.3: Navigate Folders

| Field                 | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| **Use Case ID**       | UC-07.3                                                                          |
| **Use Case Name**     | Navigate Folders                                                                 |
| **Actor(s)**          | Member                                                                           |
| **Description**       | Browse folder hierarchy                                                          |
| **Preconditions**     | Folders exist                                                                    |
| **Postconditions**    | Current folder changed                                                           |
| **Main Flow**         | 1. User clicks folder to enter<br>2. Breadcrumb updates<br>3. Contents displayed |
| **Alternative Flows** | **A1: Click breadcrumb** - Navigate to parent folder                             |

### UC-07.4: Rename File

| Field              | Description                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-07.4                                                                                          |
| **Use Case Name**  | Rename Folder                                                                                    |
| **Actor(s)**       | File Owner, Admin, Owner                                                                         |
| **Description**    | Change file name                                                                                 |
| **Preconditions**  | User owns file OR has Admin/Owner role                                                           |
| **Postconditions** | Name updated                                                                                     |
| **Main Flow**      | 1. User clicks Rename<br>2. Name becomes editable<br>3. User enters new name<br>4. User confirms |

### UC-07.5: Rename Folder

| Field              | Description                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-07.5                                                                                          |
| **Use Case Name**  | Rename Folder                                                                                    |
| **Actor(s)**       | Admin, Owner                                                                                     |
| **Description**    | Change folder name                                                                               |
| **Preconditions**  | User has Admin/Owner role                                                                        |
| **Postconditions** | Name updated                                                                                     |
| **Main Flow**      | 1. User clicks Rename<br>2. Name becomes editable<br>3. User enters new name<br>4. User confirms |

### UC-07.6: Delete Folder

| Field              | Description                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-07.6                                                                                  |
| **Use Case Name**  | Delete Folder                                                                            |
| **Actor(s)**       | Admin, Owner                                                                             |
| **Description**    | Delete folder                                                                            |
| **Preconditions**  | User has Admin/Owner role                                                                |
| **Postconditions** | Item deleted                                                                             |
| **Main Flow**      | 1. User selects items<br>2. User clicks Delete<br>3. System confirms<br>4. Items deleted |

### UC-07.7: Delete File

| Field              | Description                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-07.7                                                                                  |
| **Use Case Name**  | Delete File                                                                              |
| **Actor(s)**       | File Owner, Admin, Owner                                                                 |
| **Description**    | Delete file(s)                                                                           |
| **Preconditions**  | User owns file OR has Admin/Owner role                                                   |
| **Postconditions** | Item(s) deleted                                                                          |
| **Main Flow**      | 1. User selects items<br>2. User clicks Delete<br>3. System confirms<br>4. Items deleted |

### UC-07.8: Move Files

| Field              | Description                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-07.8                                                                                                                   |
| **Use Case Name**  | Move Files                                                                                                                |
| **Actor(s)**       | Member                                                                                                                    |
| **Description**    | Cut and paste files to different folder                                                                                   |
| **Preconditions**  | Files selected                                                                                                            |
| **Postconditions** | Files moved                                                                                                               |
| **Main Flow**      | 1. User selects files<br>2. User clicks Cut<br>3. User navigates to destination<br>4. User clicks Paste<br>5. Files moved |

### UC-07.9: Copy Files

| Field              | Description                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-07.9                                                                                                                         |
| **Use Case Name**  | Copy Files                                                                                                                      |
| **Actor(s)**       | Member                                                                                                                          |
| **Description**    | Copy files to different folder                                                                                                  |
| **Preconditions**  | Files selected                                                                                                                  |
| **Postconditions** | Files duplicated                                                                                                                |
| **Main Flow**      | 1. User selects files<br>2. User clicks Copy<br>3. User navigates to destination<br>4. User clicks Paste<br>5. Files duplicated |

### UC-07.10: Preview File

| Field              | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| **Use Case ID**    | UC-07.10                                                                      |
| **Use Case Name**  | Preview File                                                                  |
| **Actor(s)**       | Member                                                                        |
| **Description**    | View file in preview modal                                                    |
| **Preconditions**  | File supports preview                                                         |
| **Postconditions** | Preview displayed                                                             |
| **Main Flow**      | 1. User clicks on file<br>2. Preview modal opens<br>3. File content displayed |

### UC-07.11: Download File

| Field              | Description                                              |
| ------------------ | -------------------------------------------------------- |
| **Use Case ID**    | UC-07.11                                                 |
| **Use Case Name**  | Download File                                            |
| **Actor(s)**       | Member                                                   |
| **Description**    | Download file to local system                            |
| **Preconditions**  | File exists                                              |
| **Postconditions** | File downloaded                                          |
| **Main Flow**      | 1. User clicks Download<br>2. Browser initiates download |

### UC-07.12: Create Link

| Field              | Description                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-07.12                                                                                   |
| **Use Case Name**  | Create Link                                                                                |
| **Actor(s)**       | Member                                                                                     |
| **Description**    | Create an external URL link in files                                                       |
| **Preconditions**  | User has access to space                                                                   |
| **Postconditions** | Link created                                                                               |
| **Main Flow**      | 1. User clicks Create Link<br>2. User enters name and URL<br>3. Link created as file entry |

---

## UC-08: View & Act on Notifications

| Field              | Description                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-08                                                                                                                  |
| **Use Case Name**  | View & Act on Notifications                                                                                            |
| **Actor(s)**       | Authenticated User                                                                                                     |
| **Description**    | View and respond to system notifications                                                                               |
| **Preconditions**  | User is authenticated                                                                                                  |
| **Postconditions** | Notifications viewed/actioned                                                                                          |
| **Sub-Use Cases**  | UC-08.1 View Notifications, UC-08.2 Accept Invite, UC-08.3 Decline Invite, UC-08.4 Mark as Read, UC-08.5 Mark All Read |

### UC-08.1: View Notifications

| Field                  | Description                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| **Use Case ID**        | UC-08.1                                                                                               |
| **Use Case Name**      | View Notifications                                                                                    |
| **Actor(s)**           | Authenticated User                                                                                    |
| **Description**        | Open and browse notifications panel                                                                   |
| **Preconditions**      | User is authenticated                                                                                 |
| **Postconditions**     | Notifications displayed                                                                               |
| **Main Flow**          | 1. User clicks notification bell<br>2. Panel opens showing notifications<br>3. Unread count displayed |
| **Notification Types** | Invite, Mention, Session, File, System                                                                |

### UC-08.2: Accept Invite

| Field              | Description                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-08.2                                                                                                          |
| **Use Case Name**  | Accept Invite                                                                                                    |
| **Actor(s)**       | Authenticated User                                                                                               |
| **Description**    | Accept a space invitation                                                                                        |
| **Preconditions**  | Pending invite exists                                                                                            |
| **Postconditions** | User joins space                                                                                                 |
| **Main Flow**      | 1. User views invite notification<br>2. User clicks Accept<br>3. User becomes member<br>4. Spaces list refreshes |

### UC-08.3: Decline Invite

| Field              | Description                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-08.3                                                                          |
| **Use Case Name**  | Decline Invite                                                                   |
| **Actor(s)**       | Authenticated User                                                               |
| **Description**    | Decline a space invitation                                                       |
| **Preconditions**  | Pending invite exists                                                            |
| **Postconditions** | Invite dismissed                                                                 |
| **Main Flow**      | 1. User views invite notification<br>2. User clicks Decline<br>3. Invite removed |

### UC-08.4: Mark as Read

| Field              | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| **Use Case ID**    | UC-08.4                                                                  |
| **Use Case Name**  | Mark as Read                                                             |
| **Actor(s)**       | Authenticated User                                                       |
| **Description**    | Mark single notification as read                                         |
| **Preconditions**  | Unread notification exists                                               |
| **Postconditions** | Notification marked read                                                 |
| **Main Flow**      | 1. User clicks check mark on notification<br>2. Notification marked read |

### UC-08.5: Mark All Read

| Field              | Description                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-08.5                                                                                           |
| **Use Case Name**  | Mark All Read                                                                                     |
| **Actor(s)**       | Authenticated User                                                                                |
| **Description**    | Mark all notifications as read                                                                    |
| **Preconditions**  | Unread notifications exist                                                                        |
| **Postconditions** | All notifications marked read                                                                     |
| **Main Flow**      | 1. User clicks "Mark all read"<br>2. All notifications marked read<br>3. Unread count resets to 0 |

---

## UC-09: Favorite Spaces

| Field              | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Use Case ID**    | UC-09                                                                                |
| **Use Case Name**  | Favorite Spaces                                                                      |
| **Actor(s)**       | Member                                                                               |
| **Description**    | Mark and manage favorite spaces for quick access                                     |
| **Preconditions**  | User is authenticated and is member of the target space                              |
| **Postconditions** | Favorites updated                                                                    |
| **Sub-Use Cases**  | UC-09.1 Add to Favorites, UC-09.2 Remove from Favorites, UC-09.3 Filter by Favorites |

### UC-09.1: Add to Favorites

| Field              | Description                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-09.1                                                                                                        |
| **Use Case Name**  | Add to Favorites                                                                                               |
| **Actor(s)**       | Member                                                                                                         |
| **Description**    | Mark a space as favorite                                                                                       |
| **Preconditions**  | User is member of space                                                                                        |
| **Postconditions** | Space added to favorites                                                                                       |
| **Main Flow**      | 1. User clicks star/heart icon on space card<br>2. Space added to user's favorites<br>3. Icon fills/highlights |

### UC-09.2: Remove from Favorites

| Field              | Description                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **Use Case ID**    | UC-09.2                                                                                     |
| **Use Case Name**  | Remove from Favorites                                                                       |
| **Actor(s)**       | Member                                                                                      |
| **Description**    | Remove space from favorites                                                                 |
| **Preconditions**  | Space is in favorites                                                                       |
| **Postconditions** | Space removed from favorites                                                                |
| **Main Flow**      | 1. User clicks filled star/heart icon<br>2. Space removed from favorites<br>3. Icon unfills |

### UC-09.3: Filter by Favorites

| Field              | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| **Use Case ID**    | UC-09.3                                                                  |
| **Use Case Name**  | Filter by Favorites                                                      |
| **Actor(s)**       | Member                                                                   |
| **Description**    | View only favorited spaces                                               |
| **Preconditions**  | Favorites exist                                                          |
| **Postconditions** | Only favorites displayed                                                 |
| **Main Flow**      | 1. User selects "Favorites" filter tab<br>2. Only favorited spaces shown |
