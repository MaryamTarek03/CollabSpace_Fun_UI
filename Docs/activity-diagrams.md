# Activity Diagrams

## Activity Diagram Notation

| Symbol | Meaning |
|--------|---------|
| `([*])` | Initial/Final State |
| `[ ]` | Action/Activity |
| `{ }` | Decision/Branch |
| `-->` | Transition |
| `fork` | Parallel Split |
| `join` | Parallel Join |

---

## UC-01: Authenticate

### UC-01.1: Register Account

```mermaid
flowchart TD
    Start([Start]) --> OpenAuth[Open Auth Page]
    OpenAuth --> SelectRegister[Select Register Tab]
    SelectRegister --> EnterName[Enter Name]
    EnterName --> EnterUsername[Enter Username]
    EnterUsername --> EnterEmail[Enter Email]
    EnterEmail --> EnterPassword[Enter Password]
    EnterPassword --> EnterConfirm[Enter Confirm Password]
    EnterConfirm --> ClickRegister[Click Register]
    
    ClickRegister --> ValidateName{Name Valid?\n2-30 chars}
    ValidateName -->|No| ShowNameError[Show Name Error]
    ShowNameError --> EnterName
    ValidateName -->|Yes| ValidateUsername{Username Valid?\n3-20 chars, a-z, 0-9, _}
    
    ValidateUsername -->|No| ShowUsernameError[Show Username Error]
    ShowUsernameError --> EnterUsername
    ValidateUsername -->|Yes| ValidateEmail{Email Valid?}
    
    ValidateEmail -->|No| ShowEmailError[Show Email Error]
    ShowEmailError --> EnterEmail
    ValidateEmail -->|Yes| ValidatePassword{Password Strong?\nMin 8, upper, lower,\nnumber, special}
    
    ValidatePassword -->|No| ShowPasswordHint[Show Next Requirement Hint]
    ShowPasswordHint --> EnterPassword
    ValidatePassword -->|Yes| ValidateConfirm{Passwords Match?}
    
    ValidateConfirm -->|No| ShowConfirmError[Show Mismatch Error]
    ShowConfirmError --> EnterConfirm
    ValidateConfirm -->|Yes| CheckUsername{Username\nAvailable?}
    
    CheckUsername -->|No| ShowUsernameTaken[Show Username Taken]
    ShowUsernameTaken --> EnterUsername
    CheckUsername -->|Yes| CheckEmail{Email\nAvailable?}
    
    CheckEmail -->|No| ShowEmailExists[Show Email Exists]
    ShowEmailExists --> EnterEmail
    CheckEmail -->|Yes| HashPassword[Hash Password]
    
    HashPassword --> CreateUser[Create User Record]
    CreateUser --> CreateSession[Create Session]
    CreateSession --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End([End])
```

### UC-01.2: Login

```mermaid
flowchart TD
    Start([Start]) --> OpenAuth[Open Auth Page]
    OpenAuth --> SelectLogin[Select Login Tab]
    SelectLogin --> EnterIdentifier[Enter Email/Username]
    EnterIdentifier --> EnterPassword[Enter Password]
    EnterPassword --> ClickLogin[Click Login]
    
    ClickLogin --> CheckLockout{Account\nLocked?}
    CheckLockout -->|Yes| ShowLockout[Show Lockout Countdown]
    ShowLockout --> WaitUnlock{Wait for\nUnlock?}
    WaitUnlock -->|No| End1([End])
    WaitUnlock -->|Yes| CheckLockout
    
    CheckLockout -->|No| FindUser{User\nExists?}
    FindUser -->|No| ShowInvalid1[Show Invalid Credentials]
    ShowInvalid1 --> EnterIdentifier
    
    FindUser -->|Yes| VerifyPassword{Password\nCorrect?}
    VerifyPassword -->|No| IncrementAttempts[Increment Failed Attempts]
    IncrementAttempts --> CheckAttempts{5+ Failed\nAttempts?}
    CheckAttempts -->|Yes| LockAccount[Lock Account]
    LockAccount --> ShowLockout
    CheckAttempts -->|No| ShowInvalid2[Show Invalid Credentials]
    ShowInvalid2 --> EnterPassword
    
    VerifyPassword -->|Yes| ResetAttempts[Reset Failed Attempts]
    ResetAttempts --> CreateSession[Create Session]
    CreateSession --> StoreUser[Store User in State]
    StoreUser --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End2([End])
```

### UC-01.3: Logout

```mermaid
flowchart TD
    Start([Start]) --> ClickLogout[Click Logout Button]
    ClickLogout --> ClearSession[Clear Session Data]
    ClearSession --> ClearAuthStore[Clear Auth Store]
    ClearAuthStore --> ClearSpacesStore[Clear Spaces Store]
    ClearSpacesStore --> ClearChatStore[Clear Chat Store]
    ClearChatStore --> ClearNotifications[Clear Notifications Store]
    ClearNotifications --> RedirectAuth[Redirect to Auth Page]
    RedirectAuth --> End([End])
```

---

## UC-02: Manage Profile

### UC-02.1: Edit Profile Info

```mermaid
flowchart TD
    Start([Start]) --> OpenSettings[Open Settings Modal]
    OpenSettings --> SelectProfile[Select Profile Tab]
    SelectProfile --> ViewCurrent[View Current Profile]
    
    ViewCurrent --> EditName{Edit Name?}
    EditName -->|Yes| EnterName[Enter New Name]
    EnterName --> ValidateName{Valid?\n2-30 chars}
    ValidateName -->|No| ShowNameError[Show Error]
    ShowNameError --> EnterName
    ValidateName -->|Yes| EditUsername
    EditName -->|No| EditUsername{Edit Username?}
    
    EditUsername -->|Yes| EnterUsername[Enter New Username]
    EnterUsername --> ValidateFormat{Valid Format?\na-z, 0-9, _}
    ValidateFormat -->|No| ShowFormatError[Show Format Error]
    ShowFormatError --> EnterUsername
    ValidateFormat -->|Yes| EditBio
    EditUsername -->|No| EditBio{Edit Bio?}
    
    EditBio -->|Yes| EnterBio[Enter Bio]
    EnterBio --> ValidateBio{Valid?\nMax 160 chars}
    ValidateBio -->|No| ShowBioError[Show Error]
    ShowBioError --> EnterBio
    ValidateBio -->|Yes| ClickSave
    EditBio -->|No| ClickSave[Click Save]
    
    ClickSave --> CheckUnique{Username\nUnique?}
    CheckUnique -->|No| ShowTakenError[Show Username Taken]
    ShowTakenError --> EnterUsername
    CheckUnique -->|Yes| UpdateDatabase[Update User in Database]
    UpdateDatabase --> UpdateStore[Update Auth Store]
    UpdateStore --> ShowSuccess[Show Success Toast]
    ShowSuccess --> End([End])
```

### UC-02.2: Upload Avatar

```mermaid
flowchart TD
    Start([Start]) --> OpenSettings[Open Settings Modal]
    OpenSettings --> SelectProfile[Select Profile Tab]
    SelectProfile --> ClickAvatar[Click Avatar Area]
    
    ClickAvatar --> SelectFile{Select File\nor Drag?}
    SelectFile -->|Select| OpenFilePicker[Open File Picker]
    OpenFilePicker --> ChooseFile[Choose Image File]
    SelectFile -->|Drag| DropFile[Drop Image File]
    
    ChooseFile --> ValidateType{Valid Type?\nJPEG/PNG/WebP/GIF}
    DropFile --> ValidateType
    ValidateType -->|No| ShowTypeError[Show Invalid Type Error]
    ShowTypeError --> ClickAvatar
    
    ValidateType -->|Yes| ValidateSize{Size ≤ 2MB?}
    ValidateSize -->|No| ShowSizeError[Show File Too Large]
    ShowSizeError --> ClickAvatar
    
    ValidateSize -->|Yes| OpenCropper[Open Image Cropper]
    OpenCropper --> AdjustZoom[Adjust Zoom]
    AdjustZoom --> AdjustPosition[Adjust Position]
    AdjustPosition --> PreviewCrop[Preview Cropped Image]
    
    PreviewCrop --> Satisfied{Satisfied?}
    Satisfied -->|No| AdjustZoom
    Satisfied -->|Yes| ApplyCrop[Click Apply]
    
    ApplyCrop --> ConvertBase64[Convert to Base64]
    ConvertBase64 --> UploadServer[Upload to Server]
    UploadServer --> SavePath[Save Image Path]
    SavePath --> UpdateUser[Update User Record]
    UpdateUser --> UpdateStore[Update Auth Store]
    UpdateStore --> ShowNewAvatar[Display New Avatar]
    ShowNewAvatar --> End([End])
```

### UC-02.3: Configure Privacy

```mermaid
flowchart TD
    Start([Start]) --> OpenSettings[Open Settings Modal]
    OpenSettings --> SelectPrivacy[Select Privacy Tab]
    SelectPrivacy --> ViewSettings[View Current Settings]
    
    ViewSettings --> ToggleEmail{Toggle\nShow Email?}
    ToggleEmail -->|Yes| SetEmailVisibility[Set Email Visibility]
    SetEmailVisibility --> SetProfileVis
    ToggleEmail -->|No| SetProfileVis{Set Profile\nVisibility?}
    
    SetProfileVis -->|Yes| SelectVisibility[Select Visibility Level]
    SelectVisibility --> ChooseLevel{Choose Level}
    ChooseLevel -->|Public| SetPublic[Set Public]
    ChooseLevel -->|Members Only| SetMembers[Set Members Only]
    ChooseLevel -->|Private| SetPrivate[Set Private]
    SetPublic --> SaveChanges
    SetMembers --> SaveChanges
    SetPrivate --> SaveChanges
    SetProfileVis -->|No| SaveChanges[Click Save]
    
    SaveChanges --> UpdatePrivacy[Update Privacy in Database]
    UpdatePrivacy --> ShowSuccess[Show Success Toast]
    ShowSuccess --> End([End])
```

### UC-02.4: Delete Account

```mermaid
flowchart TD
    Start([Start]) --> OpenSettings[Open Settings Modal]
    OpenSettings --> SelectGeneral[Select General Tab]
    SelectGeneral --> ScrollDanger[Scroll to Danger Zone]
    ScrollDanger --> ClickDelete[Click Delete Account]
    
    ClickDelete --> ShowConfirm[Show Confirmation Modal]
    ShowConfirm --> TypeDelete[Type 'DELETE' to Confirm]
    TypeDelete --> ValidateInput{Input = 'DELETE'?}
    ValidateInput -->|No| ShowError[Show Error Message]
    ShowError --> TypeDelete
    
    ValidateInput -->|Yes| ClickConfirm[Click Confirm Delete]
    ClickConfirm --> CheckOwner{Owner of\nAny Spaces?}
    
    CheckOwner -->|Yes| ShowOwnerWarning[Show Must Transfer Ownership]
    ShowOwnerWarning --> End1([End - Cancelled])
    
    CheckOwner -->|No| RemoveFromSpaces[Remove from All Spaces]
    RemoveFromSpaces --> DeleteFiles[Delete User Files]
    DeleteFiles --> DeleteNotifications[Delete Notifications]
    DeleteNotifications --> DeleteUser[Delete User Record]
    DeleteUser --> ClearSession[Clear Session]
    ClearSession --> RedirectAuth[Redirect to Auth Page]
    RedirectAuth --> End2([End])
```

### UC-02.5: View Other Profile

```mermaid
flowchart TD
    Start([Start]) --> ClickUser[Click on User Avatar/Name]
    ClickUser --> OpenModal[Open Profile Modal]
    OpenModal --> FetchProfile[Fetch User Profile]
    
    FetchProfile --> CheckPrivacy{Check Privacy\nSettings}
    CheckPrivacy -->|Private| ShowLimited[Show Limited Info Only]
    ShowLimited --> DisplayBasic[Display Name & Avatar]
    DisplayBasic --> End1([End])
    
    CheckPrivacy -->|Members Only| CheckShared{Share Any\nSpaces?}
    CheckShared -->|No| ShowLimited
    CheckShared -->|Yes| ShowFull
    
    CheckPrivacy -->|Public| ShowFull[Show Full Profile]
    ShowFull --> DisplayAll[Display Name, Username, Bio]
    DisplayAll --> CheckEmailVisible{Email\nVisible?}
    CheckEmailVisible -->|Yes| DisplayEmail[Display Email]
    CheckEmailVisible -->|No| HideEmail[Hide Email]
    DisplayEmail --> ShowSharedSpaces
    HideEmail --> ShowSharedSpaces[Show Shared Spaces]
    
    ShowSharedSpaces --> CanInvite{Can Invite\nto Space?}
    CanInvite -->|Yes| ShowInviteButton[Show Invite Button]
    CanInvite -->|No| End2([End])
    ShowInviteButton --> End3([End])
```

---

## UC-03: Manage Space Lifecycle

### UC-03.1: Create Space

```mermaid
flowchart TD
    Start([Start]) --> ClickCreate[Click Create Space Button]
    ClickCreate --> OpenModal[Open Create Space Modal]
    OpenModal --> Step1[Step 1: Basic Info]
    
    Step1 --> EnterName[Enter Space Name]
    EnterName --> EnterDesc[Enter Description]
    EnterDesc --> SelectCategory[Select Category]
    SelectCategory --> ClickNext1[Click Next]
    
    ClickNext1 --> ValidateName{Name Valid?\nRequired, max 100}
    ValidateName -->|No| ShowNameError[Show Error]
    ShowNameError --> EnterName
    ValidateName -->|Yes| Step2[Step 2: Settings]
    
    Step2 --> SelectVisibility{Select Visibility}
    SelectVisibility -->|Public| SetPublic[Set Public]
    SelectVisibility -->|Private| SetPrivate[Set Private]
    SetPublic --> ClickNext2[Click Next]
    SetPrivate --> ClickNext2
    
    ClickNext2 --> Step3[Step 3: Appearance]
    Step3 --> UploadThumbnail{Upload\nThumbnail?}
    UploadThumbnail -->|Yes| SelectImage[Select Image]
    SelectImage --> CropImage[Crop Image]
    CropImage --> ClickCreate2
    UploadThumbnail -->|No| ClickCreate2[Click Create]
    
    ClickCreate2 --> CreateSpace[Create Space Record]
    CreateSpace --> AddOwner[Add Creator as Owner]
    AddOwner --> CreateChannel[Create Default Channel]
    CreateChannel --> GenerateLink[Generate Invite Link]
    GenerateLink --> ShowSuccess[Show Success]
    ShowSuccess --> DisplayLink[Display Invite Link]
    DisplayLink --> CopyLink{Copy Link?}
    CopyLink -->|Yes| CopyToClipboard[Copy to Clipboard]
    CopyLink -->|No| CloseModal[Close Modal]
    CopyToClipboard --> CloseModal
    CloseModal --> End([End])
```

### UC-03.2: Update Space Settings

```mermaid
flowchart TD
    Start([Start]) --> OpenSpace[Open Space Details]
    OpenSpace --> ClickSettings[Click Settings Icon]
    ClickSettings --> CheckRole{Role = Admin\nor Owner?}
    CheckRole -->|No| ShowError[Show Permission Denied]
    ShowError --> End1([End])
    
    CheckRole -->|Yes| OpenSettings[Open Space Settings Modal]
    OpenSettings --> SelectTab[Select Settings Tab]
    
    SelectTab --> EditName{Edit Name?}
    EditName -->|Yes| EnterName[Enter New Name]
    EnterName --> EditDesc
    EditName -->|No| EditDesc{Edit Description?}
    
    EditDesc -->|Yes| EnterDesc[Enter New Description]
    EnterDesc --> EditCategory
    EditDesc -->|No| EditCategory{Change Category?}
    
    EditCategory -->|Yes| SelectCategory[Select New Category]
    SelectCategory --> EditVisibility
    EditCategory -->|No| EditVisibility{Change Visibility?}
    
    EditVisibility -->|Yes| SelectVisibility[Select Visibility]
    SelectVisibility --> ClickSave
    EditVisibility -->|No| ClickSave[Click Save]
    
    ClickSave --> UpdateSpace[Update Space in Database]
    UpdateSpace --> UpdateStore[Update Spaces Store]
    UpdateStore --> ShowSuccess[Show Success Toast]
    ShowSuccess --> End2([End])
```

### UC-03.3: Delete Space

```mermaid
flowchart TD
    Start([Start]) --> OpenSettings[Open Space Settings]
    OpenSettings --> CheckOwner{Role = Owner?}
    CheckOwner -->|No| HideDelete[Delete Option Hidden]
    HideDelete --> End1([End])
    
    CheckOwner -->|Yes| SelectDanger[Select Danger Zone Tab]
    SelectDanger --> ClickDelete[Click Delete Space]
    ClickDelete --> ShowConfirm[Show Confirmation Modal]
    
    ShowConfirm --> DisplayWarning[Display Warning:\nAll data will be deleted]
    DisplayWarning --> EnterName[Enter Space Name to Confirm]
    EnterName --> ValidateName{Name Matches?}
    ValidateName -->|No| ShowError[Show Error]
    ShowError --> EnterName
    
    ValidateName -->|Yes| ClickConfirm[Click Confirm Delete]
    ClickConfirm --> DeleteMessages[Delete All Messages]
    DeleteMessages --> DeleteFiles[Delete All Files]
    DeleteFiles --> DeleteChannels[Delete All Channels]
    DeleteChannels --> DeleteMembers[Delete All Members]
    DeleteMembers --> DeleteInvites[Delete All Invites]
    DeleteInvites --> DeleteSpace[Delete Space Record]
    DeleteSpace --> UpdateStore[Update Spaces Store]
    UpdateStore --> NotifyMembers[Notify Former Members]
    NotifyMembers --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> End2([End])
```

### UC-03.4: Search Public Spaces

```mermaid
flowchart TD
    Start([Start]) --> ClickSearch[Click Search Public Spaces]
    ClickSearch --> OpenModal[Open Search Modal]
    OpenModal --> EnterQuery[Enter Search Query]
    
    EnterQuery --> ClickSearch2[Click Search]
    ClickSearch2 --> QueryDatabase[Query Public Spaces]
    QueryDatabase --> FilterResults[Filter: Exclude User's Spaces]
    FilterResults --> HasResults{Results Found?}
    
    HasResults -->|No| ShowNoResults[Show No Results Message]
    ShowNoResults --> EnterQuery
    
    HasResults -->|Yes| DisplayResults[Display Space Cards]
    DisplayResults --> SelectSpace{Select a Space?}
    SelectSpace -->|No| EnterQuery
    
    SelectSpace -->|Yes| ViewDetails[View Space Details]
    ViewDetails --> CheckVisibility{Visibility?}
    
    CheckVisibility -->|Public Auto-Join| ShowJoinButton[Show Join Button]
    CheckVisibility -->|Public Request| ShowRequestButton[Show Request Button]
    
    ShowJoinButton --> ClickJoin{Click Join?}
    ClickJoin -->|Yes| JoinSpace[Join Space]
    JoinSpace --> End1([End])
    ClickJoin -->|No| End2([End])
    
    ShowRequestButton --> ClickRequest{Click Request?}
    ClickRequest -->|Yes| SendRequest[Send Join Request]
    SendRequest --> End3([End])
    ClickRequest -->|No| End4([End])
```

---

## UC-04: Manage Membership

### UC-04.1: Invite User

```mermaid
flowchart TD
    Start([Start]) --> OpenMembers[Open Members Modal]
    OpenMembers --> ClickInvite[Click Invite Button]
    ClickInvite --> CheckPermission{Can Invite?}
    
    CheckPermission -->|No - Private & Member| ShowError[Show Permission Denied]
    ShowError --> End1([End])
    
    CheckPermission -->|Yes| OpenInviteModal[Open Invite Modal]
    OpenInviteModal --> SearchUser[Search for User]
    SearchUser --> EnterQuery[Enter Name/Username]
    EnterQuery --> QueryUsers[Query Users]
    QueryUsers --> DisplayResults[Display Matching Users]
    
    DisplayResults --> SelectUser{Select User?}
    SelectUser -->|No| EnterQuery
    SelectUser -->|Yes| CheckMember{Already\nMember?}
    
    CheckMember -->|Yes| ShowAlreadyMember[Show Already Member]
    ShowAlreadyMember --> SearchUser
    
    CheckMember -->|No| CheckPending{Pending\nInvite?}
    CheckPending -->|Yes| ShowPendingInvite[Show Already Invited]
    ShowPendingInvite --> SearchUser
    
    CheckPending -->|No| SendInvite[Send Invite]
    SendInvite --> CreateInviteRecord[Create Invite Record]
    CreateInviteRecord --> CreateNotification[Create Notification]
    CreateNotification --> ShowSuccess[Show Invite Sent]
    ShowSuccess --> End2([End])
```

### UC-04.2: Generate Invite Link

```mermaid
flowchart TD
    Start([Start]) --> OpenMembers[Open Members/Settings]
    OpenMembers --> ClickInviteLink[Click Generate Link]
    ClickInviteLink --> CheckPermission{Member+?}
    
    CheckPermission -->|No| ShowError[Show Permission Denied]
    ShowError --> End1([End])
    
    CheckPermission -->|Yes| GenerateCode[Generate Unique Code]
    GenerateCode --> CreateLinkRecord[Create Invite Link Record]
    CreateLinkRecord --> BuildURL[Build Full URL]
    BuildURL --> DisplayLink[Display Invite Link]
    
    DisplayLink --> ClickCopy{Click Copy?}
    ClickCopy -->|Yes| CopyClipboard[Copy to Clipboard]
    CopyClipboard --> ShowCopied[Show Copied Toast]
    ShowCopied --> End2([End])
    ClickCopy -->|No| End3([End])
```

### UC-04.3: Join via Link

```mermaid
flowchart TD
    Start([Start]) --> ClickJoinByLink[Click Join by Link]
    ClickJoinByLink --> OpenModal[Open Join Modal]
    OpenModal --> EnterCode[Enter Invite Code/Link]
    EnterCode --> ClickJoin[Click Join]
    
    ClickJoin --> ParseCode[Parse Invite Code]
    ParseCode --> ValidateCode{Code Valid?}
    ValidateCode -->|No| ShowInvalid[Show Invalid Code]
    ShowInvalid --> EnterCode
    
    ValidateCode -->|Yes| CheckExpired{Code Expired?}
    CheckExpired -->|Yes| ShowExpired[Show Link Expired]
    ShowExpired --> End1([End])
    
    CheckExpired -->|No| FetchSpace[Fetch Space Info]
    FetchSpace --> DisplayPreview[Display Space Preview]
    DisplayPreview --> ConfirmJoin{Confirm Join?}
    
    ConfirmJoin -->|No| End2([End])
    ConfirmJoin -->|Yes| CheckBanned{User Banned?}
    
    CheckBanned -->|Yes| ShowBanned[Show Banned Message]
    ShowBanned --> End3([End])
    
    CheckBanned -->|No| CheckMember{Already Member?}
    CheckMember -->|Yes| ShowAlready[Show Already Member]
    ShowAlready --> End4([End])
    
    CheckMember -->|No| AddMember[Add User as Member]
    AddMember --> UpdateSpaces[Refresh Spaces List]
    UpdateSpaces --> ShowSuccess[Show Success]
    ShowSuccess --> NavigateSpace[Navigate to Space]
    NavigateSpace --> End5([End])
```

### UC-04.4: Request to Join

```mermaid
flowchart TD
    Start([Start]) --> FindSpace[Find Space in Search]
    FindSpace --> ClickRequest[Click Request to Join]
    ClickRequest --> CheckExisting{Existing\nRequest?}
    
    CheckExisting -->|Yes| ShowPending[Show Request Pending]
    ShowPending --> End1([End])
    
    CheckExisting -->|No| CreateRequest[Create Join Request]
    CreateRequest --> NotifyAdmins[Notify Space Admins/Owner]
    NotifyAdmins --> ShowSent[Show Request Sent]
    ShowSent --> End2([End])
```

### UC-04.5: Approve/Reject Request

```mermaid
flowchart TD
    Start([Start]) --> OpenSettings[Open Space Settings]
    OpenSettings --> SelectRequests[Select Requests Tab]
    SelectRequests --> ViewRequests[View Pending Requests]
    
    ViewRequests --> HasRequests{Has Requests?}
    HasRequests -->|No| ShowEmpty[Show No Requests]
    ShowEmpty --> End1([End])
    
    HasRequests -->|Yes| SelectRequest[Select a Request]
    SelectRequest --> ViewUser[View User Info]
    ViewUser --> Decision{Approve or\nReject?}
    
    Decision -->|Approve| ClickApprove[Click Approve]
    ClickApprove --> AddMember[Add User as Member]
    AddMember --> DeleteRequest1[Delete Request]
    DeleteRequest1 --> NotifyUser1[Notify User: Approved]
    NotifyUser1 --> UpdateList1[Update Request List]
    UpdateList1 --> End2([End])
    
    Decision -->|Reject| ClickReject[Click Reject]
    ClickReject --> DeleteRequest2[Delete Request]
    DeleteRequest2 --> NotifyUser2[Notify User: Rejected]
    NotifyUser2 --> UpdateList2[Update Request List]
    UpdateList2 --> End3([End])
```

### UC-04.6: Remove Member (Kick)

```mermaid
flowchart TD
    Start([Start]) --> OpenMembers[Open Members Modal]
    OpenMembers --> FindMember[Find Member in List]
    FindMember --> ClickMenu[Click Member Menu]
    ClickMenu --> CheckPermission{Can Kick?}
    
    CheckPermission -->|No| HideOption[Kick Option Hidden]
    HideOption --> End1([End])
    
    CheckPermission -->|Yes - Admin can kick Members| ShowKick[Show Kick Option]
    CheckPermission -->|Yes - Owner can kick Anyone| ShowKick
    
    ShowKick --> ClickKick[Click Kick]
    ClickKick --> ShowConfirm[Show Confirmation]
    ShowConfirm --> Confirm{Confirm?}
    
    Confirm -->|No| End2([End])
    Confirm -->|Yes| RemoveMember[Remove Member Record]
    RemoveMember --> UpdateList[Update Members List]
    UpdateList --> ShowSuccess[Show Member Removed]
    ShowSuccess --> End3([End])
```

### UC-04.7: Ban Member

```mermaid
flowchart TD
    Start([Start]) --> OpenMembers[Open Members Modal]
    OpenMembers --> FindMember[Find Member in List]
    FindMember --> ClickMenu[Click Member Menu]
    ClickMenu --> CheckPermission{Can Ban?}
    
    CheckPermission -->|No| HideOption[Ban Option Hidden]
    HideOption --> End1([End])
    
    CheckPermission -->|Yes| ShowBan[Show Ban Option]
    ShowBan --> ClickBan[Click Ban]
    ClickBan --> OpenReasonModal[Open Reason Modal]
    OpenReasonModal --> EnterReason[Enter Ban Reason]
    EnterReason --> ClickConfirm[Click Confirm]
    
    ClickConfirm --> RemoveMember[Remove Member Record]
    RemoveMember --> CreateBan[Create Ban Record]
    CreateBan --> UpdateList[Update Members List]
    UpdateList --> ShowSuccess[Show Member Banned]
    ShowSuccess --> End2([End])
```

### UC-04.8: Leave Space

```mermaid
flowchart TD
    Start([Start]) --> OpenSpace[Open Space Details]
    OpenSpace --> ClickLeave[Click Leave Space]
    ClickLeave --> CheckOwner{Is Owner?}
    
    CheckOwner -->|Yes| ShowWarning[Show Must Transfer Ownership First]
    ShowWarning --> End1([End])
    
    CheckOwner -->|No| ShowConfirm[Show Confirmation]
    ShowConfirm --> Confirm{Confirm Leave?}
    
    Confirm -->|No| End2([End])
    Confirm -->|Yes| RemoveSelf[Remove Self from Members]
    RemoveSelf --> UpdateSpaces[Refresh Spaces List]
    UpdateSpaces --> RedirectDashboard[Redirect to Dashboard]
    RedirectDashboard --> ShowSuccess[Show Left Space]
    ShowSuccess --> End3([End])
```

---

## UC-05: Manage Roles & Ownership

### UC-05.1: Change Member Role

```mermaid
flowchart TD
    Start([Start]) --> OpenMembers[Open Members Modal]
    OpenMembers --> FindMember[Find Member in List]
    FindMember --> ClickMenu[Click Member Menu]
    ClickMenu --> CheckPermission{Can Change Role?}
    
    CheckPermission -->|No - Member| HideOption[Role Options Hidden]
    HideOption --> End1([End])
    
    CheckPermission -->|Admin - Limited| ShowLimited[Show: Promote to Admin only for Members]
    CheckPermission -->|Owner - Full| ShowFull[Show All Role Options]
    
    ShowLimited --> SelectRole{Select New Role}
    ShowFull --> SelectRole
    
    SelectRole -->|Member| SetMember[Set Role = Member]
    SelectRole -->|Admin| SetAdmin[Set Role = Admin]
    
    SetMember --> ValidateChange{Valid Change?}
    SetAdmin --> ValidateChange
    
    ValidateChange -->|No - Cannot demote self| ShowError[Show Error]
    ShowError --> End2([End])
    
    ValidateChange -->|Yes| UpdateRole[Update Member Role]
    UpdateRole --> UpdateList[Update Members List]
    UpdateList --> ShowSuccess[Show Role Changed]
    ShowSuccess --> End3([End])
```

### UC-05.2: Transfer Ownership

```mermaid
flowchart TD
    Start([Start]) --> OpenSettings[Open Space Settings]
    OpenSettings --> CheckOwner{Is Owner?}
    
    CheckOwner -->|No| HideOption[Transfer Option Hidden]
    HideOption --> End1([End])
    
    CheckOwner -->|Yes| SelectDanger[Select Danger Zone Tab]
    SelectDanger --> ClickTransfer[Click Transfer Ownership]
    ClickTransfer --> OpenModal[Open Transfer Modal]
    OpenModal --> DisplayMembers[Display Space Members]
    
    DisplayMembers --> SelectNewOwner[Select New Owner]
    SelectNewOwner --> ShowConfirm[Show Confirmation Warning]
    ShowConfirm --> Confirm{Confirm Transfer?}
    
    Confirm -->|No| End2([End])
    Confirm -->|Yes| UpdateSpaceOwner[Update Space Owner ID]
    UpdateSpaceOwner --> SetNewOwnerRole[Set New Owner Role = Owner]
    SetNewOwnerRole --> DemoteOldOwner[Set Old Owner Role = Admin]
    DemoteOldOwner --> UpdateStore[Update Stores]
    UpdateStore --> ShowSuccess[Show Ownership Transferred]
    ShowSuccess --> End3([End])
```

---

## UC-06: Collaborate in Chat

### UC-06.1: Send Message

```mermaid
flowchart TD
    Start([Start]) --> OpenChat[Open Chat View]
    OpenChat --> SelectChannel[Select Channel]
    SelectChannel --> TypeMessage[Type Message in Input]
    TypeMessage --> ClickSend{Send?}
    
    ClickSend -->|Press Enter| ValidateMessage{Message\nNot Empty?}
    ClickSend -->|Click Button| ValidateMessage
    
    ValidateMessage -->|No| End1([End])
    ValidateMessage -->|Yes| ParseMentions[Parse @mentions]
    ParseMentions --> CreateMessage[Create Message Object]
    CreateMessage --> SendToServer[Send to Server]
    SendToServer --> StoreMessage[Store in Database]
    StoreMessage --> CreateNotifications{Has Mentions?}
    
    CreateNotifications -->|Yes| NotifyMentioned[Create Mention Notifications]
    NotifyMentioned --> AddToList
    CreateNotifications -->|No| AddToList[Add to Messages List]
    
    AddToList --> ClearInput[Clear Input Field]
    ClearInput --> ScrollToBottom[Scroll to Bottom]
    ScrollToBottom --> End2([End])
```

### UC-06.2: Reply to Message

```mermaid
flowchart TD
    Start([Start]) --> FindMessage[Find Message in Chat]
    FindMessage --> ClickReply[Click Reply Button]
    ClickReply --> SetReplyingTo[Set Replying To State]
    SetReplyingTo --> ShowPreview[Show Reply Preview Above Input]
    ShowPreview --> TypeReply[Type Reply Text]
    TypeReply --> SendReply[Send Message]
    
    SendReply --> CreateMessage[Create Message with replyToId]
    CreateMessage --> StoreMessage[Store in Database]
    StoreMessage --> ClearReplyingTo[Clear Replying To State]
    ClearReplyingTo --> HidePreview[Hide Reply Preview]
    HidePreview --> AddToList[Add to Messages List]
    AddToList --> End([End])
```

### UC-06.3: Forward Message

```mermaid
flowchart TD
    Start([Start]) --> FindMessage[Find Message in Chat]
    FindMessage --> ClickForward[Click Forward Button]
    ClickForward --> OpenModal[Open Channel Select Modal]
    OpenModal --> DisplayChannels[Display Available Channels]
    
    DisplayChannels --> SelectChannel{Select Channel?}
    SelectChannel -->|No| Cancel[Cancel]
    Cancel --> End1([End])
    
    SelectChannel -->|Yes| ConfirmForward[Confirm Forward]
    ConfirmForward --> CreateForward[Create Forwarded Message]
    CreateForward --> SetForwardedFrom[Set forwardedFromChannel]
    SetForwardedFrom --> StoreMessage[Store in Target Channel]
    StoreMessage --> ShowSuccess[Show Message Forwarded]
    ShowSuccess --> End2([End])
```

### UC-06.4: Edit Message

```mermaid
flowchart TD
    Start([Start]) --> FindMessage[Find Own Message]
    FindMessage --> ClickEdit[Click Edit Button]
    ClickEdit --> EnterEditMode[Enter Edit Mode]
    EnterEditMode --> ShowEditInput[Show Editable Text]
    ShowEditInput --> ModifyText[Modify Message Text]
    
    ModifyText --> SaveOrCancel{Save or Cancel?}
    SaveOrCancel -->|Cancel| ExitEditMode[Exit Edit Mode]
    ExitEditMode --> RestoreOriginal[Restore Original Text]
    RestoreOriginal --> End1([End])
    
    SaveOrCancel -->|Save| ValidateText{Text Not Empty?}
    ValidateText -->|No| ShowError[Show Error]
    ShowError --> ModifyText
    
    ValidateText -->|Yes| UpdateMessage[Update Message in Database]
    UpdateMessage --> SetEdited[Set Edited Flag]
    SetEdited --> UpdateList[Update Messages List]
    UpdateList --> ExitEditMode2[Exit Edit Mode]
    ExitEditMode2 --> End2([End])
```

### UC-06.5: Delete Message

```mermaid
flowchart TD
    Start([Start]) --> FindMessage[Find Message]
    FindMessage --> CheckPermission{Own Message\nor Admin/Owner?}
    
    CheckPermission -->|No| HideDelete[Delete Hidden]
    HideDelete --> End1([End])
    
    CheckPermission -->|Yes| ClickDelete[Click Delete]
    ClickDelete --> ShowConfirm[Show Confirmation]
    ShowConfirm --> Confirm{Confirm?}
    
    Confirm -->|No| End2([End])
    Confirm -->|Yes| SoftDelete[Soft Delete Message]
    SoftDelete --> SetDeletedAt[Set deletedAt Timestamp]
    SetDeletedAt --> SetDeletedBy[Set deletedBy User ID]
    SetDeletedBy --> UpdateList[Update Messages List]
    UpdateList --> ShowDeleted[Show 'Message Deleted' Placeholder]
    ShowDeleted --> End3([End])
```

### UC-06.6: Mention User

```mermaid
flowchart TD
    Start([Start]) --> TypeAt[Type '@' Character]
    TypeAt --> ShowPopup[Show Mention Popup]
    ShowPopup --> DisplayMembers[Display Space Members]
    
    DisplayMembers --> TypeMore{Continue Typing?}
    TypeMore -->|Yes| FilterList[Filter Members by Input]
    FilterList --> DisplayMembers
    
    TypeMore -->|No - Select| SelectMember[Select Member from List]
    SelectMember --> InsertMention[Insert @username in Input]
    InsertMention --> HidePopup[Hide Popup]
    HidePopup --> ContinueTyping[Continue Typing Message]
    ContinueTyping --> SendMessage[Send Message]
    
    SendMessage --> ParseMentions[Parse @mentions from Text]
    ParseMentions --> StoreMentions[Store Mention User IDs]
    StoreMentions --> CreateNotifications[Create Mention Notifications]
    CreateNotifications --> End([End])
```

---

## UC-07: Manage Files

### UC-07.1: Upload File

```mermaid
flowchart TD
    Start([Start]) --> OpenFiles[Open Files Modal]
    OpenFiles --> ClickUpload[Click Upload Button]
    ClickUpload --> SelectFiles[Select File(s)]
    
    SelectFiles --> ValidateSize{Size ≤ 50MB?}
    ValidateSize -->|No| ShowSizeError[Show File Too Large]
    ShowSizeError --> SelectFiles
    
    ValidateSize -->|Yes| StartUpload[Start Upload]
    StartUpload --> ShowProgress[Show Progress Bar]
    ShowProgress --> UpdateProgress[Update Progress %]
    
    UpdateProgress --> Complete{Upload\nComplete?}
    Complete -->|No| UpdateProgress
    Complete -->|Yes| StoreMetadata[Store File Metadata]
    StoreMetadata --> AddToList[Add to File List]
    AddToList --> ShowSuccess[Show Upload Complete]
    ShowSuccess --> End([End])
```

### UC-07.2: Create Folder

```mermaid
flowchart TD
    Start([Start]) --> OpenFiles[Open Files Modal]
    OpenFiles --> ClickNewFolder[Click New Folder]
    ClickNewFolder --> OpenInput[Open Folder Name Input]
    OpenInput --> EnterName[Enter Folder Name]
    EnterName --> ClickCreate[Click Create]
    
    ClickCreate --> ValidateName{Name Valid?}
    ValidateName -->|No| ShowError[Show Error]
    ShowError --> EnterName
    
    ValidateName -->|Yes| CheckDuplicate{Name Exists\nin Current Folder?}
    CheckDuplicate -->|Yes| ShowDuplicate[Show Duplicate Name Error]
    ShowDuplicate --> EnterName
    
    CheckDuplicate -->|No| CreateFolder[Create Folder Record]
    CreateFolder --> AddToList[Add to Folder List]
    AddToList --> ShowSuccess[Show Folder Created]
    ShowSuccess --> End([End])
```

### UC-07.3: Navigate Folders

```mermaid
flowchart TD
    Start([Start]) --> OpenFiles[Open Files Modal]
    OpenFiles --> ViewRoot[View Root Folder]
    ViewRoot --> DisplayContents[Display Files & Folders]
    
    DisplayContents --> ClickItem{Click Item?}
    ClickItem -->|File| PreviewFile[Open File Preview]
    PreviewFile --> DisplayContents
    
    ClickItem -->|Folder| EnterFolder[Enter Folder]
    EnterFolder --> UpdateBreadcrumb[Update Breadcrumb]
    UpdateBreadcrumb --> FetchContents[Fetch Folder Contents]
    FetchContents --> DisplayContents
    
    ClickItem -->|Breadcrumb| GoToFolder[Go to Selected Level]
    GoToFolder --> FetchContents
    
    ClickItem -->|Back| GoBack{Has Parent?}
    GoBack -->|No| DisplayContents
    GoBack -->|Yes| GoParent[Go to Parent Folder]
    GoParent --> FetchContents
```

### UC-07.4: Delete File/Folder

```mermaid
flowchart TD
    Start([Start]) --> SelectItem[Select File/Folder]
    SelectItem --> ClickDelete[Click Delete]
    ClickDelete --> CheckPermission{Own Item\nor Admin/Owner?}
    
    CheckPermission -->|No| ShowError[Show Permission Denied]
    ShowError --> End1([End])
    
    CheckPermission -->|Yes| CheckFolder{Is Folder?}
    CheckFolder -->|Yes| CheckEmpty{Folder Empty?}
    CheckEmpty -->|No| ShowNotEmpty[Show Folder Not Empty]
    ShowNotEmpty --> End2([End])
    
    CheckEmpty -->|Yes| ShowConfirm
    CheckFolder -->|No - File| ShowConfirm[Show Confirmation]
    
    ShowConfirm --> Confirm{Confirm?}
    Confirm -->|No| End3([End])
    Confirm -->|Yes| DeleteRecord[Delete Database Record]
    DeleteRecord --> DeletePhysical{Is File?}
    DeletePhysical -->|Yes| DeleteFile[Delete Physical File]
    DeleteFile --> UpdateList
    DeletePhysical -->|No| UpdateList[Update File/Folder List]
    UpdateList --> ShowSuccess[Show Deleted]
    ShowSuccess --> End4([End])
```

### UC-07.5: Move/Copy Files

```mermaid
flowchart TD
    Start([Start]) --> SelectFiles[Select File(s)]
    SelectFiles --> ClickAction{Move or Copy?}
    
    ClickAction -->|Move| ClickMove[Click Move]
    ClickAction -->|Copy| ClickCopy[Click Copy]
    
    ClickMove --> OpenFolderSelect[Open Folder Selection]
    ClickCopy --> OpenFolderSelect
    
    OpenFolderSelect --> DisplayFolders[Display Available Folders]
    DisplayFolders --> SelectTarget[Select Target Folder]
    SelectTarget --> ClickConfirm[Click Confirm]
    
    ClickConfirm --> CheckDuplicates{Duplicate Names\nin Target?}
    CheckDuplicates -->|Yes| HandleDuplicates[Rename with (1), (2), etc.]
    HandleDuplicates --> ProcessFiles
    CheckDuplicates -->|No| ProcessFiles{Move or Copy?}
    
    ProcessFiles -->|Move| UpdateReferences[Update File Folder IDs]
    ProcessFiles -->|Copy| CreateCopies[Create File Copies]
    CreateCopies --> CopyPhysical[Copy Physical Files]
    CopyPhysical --> RefreshList
    
    UpdateReferences --> RefreshList[Refresh File List]
    RefreshList --> ShowSuccess[Show Operation Complete]
    ShowSuccess --> End([End])
```

### UC-07.6: Preview File

```mermaid
flowchart TD
    Start([Start]) --> ClickFile[Click on File]
    ClickFile --> OpenPreview[Open Preview Modal]
    OpenPreview --> DetectType{Detect File Type}
    
    DetectType -->|Image| RenderImage[Render Image Tag]
    DetectType -->|PDF| RenderPDF[Render PDF in iFrame]
    DetectType -->|Video| RenderVideo[Render Video Player]
    DetectType -->|Audio| RenderAudio[Render Audio Player]
    DetectType -->|Other| ShowInfo[Show File Info Only]
    
    RenderImage --> DisplayPreview[Display Preview]
    RenderPDF --> DisplayPreview
    RenderVideo --> DisplayPreview
    RenderAudio --> DisplayPreview
    ShowInfo --> DisplayPreview
    
    DisplayPreview --> UserAction{User Action?}
    UserAction -->|Download| DownloadFile[Download File]
    UserAction -->|Close| ClosePreview[Close Preview]
    
    DownloadFile --> End1([End])
    ClosePreview --> End2([End])
```

---

## UC-08: View & Act on Notifications

### UC-08.1: View Notifications

```mermaid
flowchart TD
    Start([Start]) --> ClickBell[Click Notification Bell]
    ClickBell --> OpenPanel[Open Notifications Panel]
    OpenPanel --> FetchNotifications[Fetch User Notifications]
    FetchNotifications --> SortByDate[Sort by Date Descending]
    SortByDate --> DisplayList[Display Notification List]
    
    DisplayList --> HasUnread{Has Unread?}
    HasUnread -->|Yes| ShowBadge[Show Unread Count Badge]
    HasUnread -->|No| HideBadge[Hide Badge]
    
    ShowBadge --> WaitAction{User Action?}
    HideBadge --> WaitAction
    
    WaitAction -->|Click Notification| HandleClick[Handle Notification Type]
    WaitAction -->|Close Panel| End([End])
    
    HandleClick --> CheckType{Notification Type?}
    CheckType -->|Invite| ShowInviteActions[Show Accept/Decline]
    CheckType -->|Mention| NavigateToMessage[Navigate to Message]
    CheckType -->|System| MarkRead[Mark as Read]
    
    ShowInviteActions --> End
    NavigateToMessage --> End
    MarkRead --> End
```

### UC-08.2: Accept Invite

```mermaid
flowchart TD
    Start([Start]) --> FindInvite[Find Invite Notification]
    FindInvite --> ClickAccept[Click Accept]
    ClickAccept --> UpdateInvite[Update Invite Status = Accepted]
    UpdateInvite --> AddMember[Add User to Space Members]
    AddMember --> MarkRead[Mark Notification as Read]
    MarkRead --> RefreshSpaces[Refresh Spaces List]
    RefreshSpaces --> ShowSuccess[Show Joined Space Toast]
    ShowSuccess --> End([End])
```

### UC-08.3: Decline Invite

```mermaid
flowchart TD
    Start([Start]) --> FindInvite[Find Invite Notification]
    FindInvite --> ClickDecline[Click Decline]
    ClickDecline --> UpdateInvite[Update Invite Status = Declined]
    UpdateInvite --> MarkRead[Mark Notification as Read]
    MarkRead --> UpdateList[Update Notifications List]
    UpdateList --> ShowDeclined[Show Invite Declined]
    ShowDeclined --> End([End])
```

### UC-08.4: Mark All as Read

```mermaid
flowchart TD
    Start([Start]) --> OpenNotifications[Open Notifications Panel]
    OpenNotifications --> ClickMarkAll[Click Mark All as Read]
    ClickMarkAll --> UpdateAll[Update All Notifications: read = true]
    UpdateAll --> ClearBadge[Clear Unread Count Badge]
    ClearBadge --> UpdateList[Update Notifications List UI]
    UpdateList --> End([End])
```

---

## UC-09: Favorite Spaces

### UC-09.1: Add to Favorites

```mermaid
flowchart TD
    Start([Start]) --> ViewSpace[View Space Card]
    ViewSpace --> ClickHeart[Click Heart Icon - Unfilled]
    ClickHeart --> SendRequest[Send Toggle Favorite Request]
    SendRequest --> CheckExists{Already\nFavorite?}
    
    CheckExists -->|No| CreateFavorite[Create Favorite Record]
    CreateFavorite --> UpdateStore[Add to Favorites in Store]
    UpdateStore --> FillHeart[Fill Heart Icon]
    FillHeart --> ShowToast[Show Added to Favorites]
    ShowToast --> End([End])
    
    CheckExists -->|Yes| End
```

### UC-09.2: Remove from Favorites

```mermaid
flowchart TD
    Start([Start]) --> ViewSpace[View Space Card]
    ViewSpace --> ClickHeart[Click Heart Icon - Filled]
    ClickHeart --> SendRequest[Send Toggle Favorite Request]
    SendRequest --> CheckExists{Is Favorite?}
    
    CheckExists -->|Yes| DeleteFavorite[Delete Favorite Record]
    DeleteFavorite --> UpdateStore[Remove from Favorites in Store]
    UpdateStore --> UnfillHeart[Unfill Heart Icon]
    UnfillHeart --> ShowToast[Show Removed from Favorites]
    ShowToast --> End([End])
    
    CheckExists -->|No| End
```

### UC-09.3: Filter by Favorites

```mermaid
flowchart TD
    Start([Start]) --> ViewDashboard[View Dashboard]
    ViewDashboard --> ClickFavoritesTab[Click Favorites Tab]
    ClickFavoritesTab --> SetActiveTab[Set Active Tab = Favorites]
    SetActiveTab --> FetchFavorites{Favorites\nLoaded?}
    
    FetchFavorites -->|No| LoadFavorites[Load User Favorites]
    LoadFavorites --> FilterSpaces
    FetchFavorites -->|Yes| FilterSpaces[Filter Spaces by Favorite IDs]
    
    FilterSpaces --> HasFavorites{Has Favorites?}
    HasFavorites -->|No| ShowEmpty[Show No Favorites Message]
    HasFavorites -->|Yes| DisplaySpaces[Display Favorite Spaces]
    
    ShowEmpty --> End1([End])
    DisplaySpaces --> End2([End])
```

---

## Activity Diagram Summary

| Use Case | Activity Diagrams |
|----------|-------------------|
| UC-01: Authenticate | Register, Login, Logout |
| UC-02: Manage Profile | Edit Info, Upload Avatar, Configure Privacy, Delete Account, View Other |
| UC-03: Manage Spaces | Create, Update Settings, Delete, Search Public |
| UC-04: Manage Membership | Invite User, Generate Link, Join via Link, Request, Approve/Reject, Kick, Ban, Leave |
| UC-05: Manage Roles | Change Role, Transfer Ownership |
| UC-06: Chat | Send, Reply, Forward, Edit, Delete, Mention |
| UC-07: Manage Files | Upload, Create Folder, Navigate, Delete, Move/Copy, Preview |
| UC-08: Notifications | View, Accept Invite, Decline Invite, Mark All Read |
| UC-09: Favorites | Add, Remove, Filter |

**Total Activity Diagrams: 35**
