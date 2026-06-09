in the class diagram of usecase 4, the entities arent connected with anything, fix their connections (connect with the appropriate adapters and create the necessary dtos, reference the previous diagrams 01, 02, 03 so you know how it looks), also update the reference to represent the class diagram + dont add anything that reference the current user like (inviterid, userid) since it will be passed in an interceptor

```mermaid
class IMemberRepository {
        <<Interface>>
        +getBySpace(spaceId)* Member[]
        +add(spaceId)* Member
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
        +add(spaceId) Member
        +remove(spaceId, memberId) void
        +leave(spaceId) void
    }

    class InviteRepositoryAdapter {
        <<Adapter>>
        +getByCode(code) Invite
        +createLink(spaceId) Invite
        +revoke(inviteId) void
        +inviteUsers(spaceId, identifiers) void
        +getBySpace(spaceId) Invite[]
    }

    class MemberDtoMapper {
        <<Mapper>>
        +fromDto(data) Member$
        +toDto(member) Object$
    }

    class InviteDtoMapper {
        <<Mapper>>
        +fromDto(data) Invite$
        +toDto(invite) Object$
    }

    class JoinRequestDtoMapper {
        <<Mapper>>
        +fromDto(data) JoinRequest$
        +toDto(request) Object$
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

    JoinSpace --> IMemberRepository : depends on
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

    MemberRepositoryAdapter --> MemberDtoMapper : uses
    InviteRepositoryAdapter --> InviteDtoMapper : uses
    JoinRequestRepositoryAdapter --> JoinRequestDtoMapper : uses

    MemberDtoMapper ..> Member : maps
    InviteDtoMapper ..> Invite : maps
    JoinRequestDtoMapper ..> JoinRequest : maps

    Member --> Space : belongs to
    JoinRequest --> Space : to
    Invite --> Space : for
```