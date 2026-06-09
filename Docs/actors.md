# System Actors & Roles

This document defines the actors within the CollabSpace system, analyzed from the codebase.

---

## Actor Hierarchy

The system follows a hierarchical actor model with inheritance. Higher-level actors inherit all capabilities from lower-level actors.

```
Guest → Authenticated User → Member → Admin → Owner
```

| Level | Actor                  | Scope  | Inherits From      |
| :---: | :--------------------- | :----- | :----------------- |
|   0   | **Guest**              | System | —                  |
|   1   | **Authenticated User** | System | Guest              |
|   2   | **Member**             | Space  | Authenticated User |
|   3   | **Admin**              | Space  | Member             |
|   4   | **Owner**              | Space  | Admin              |

---

## Actor Definitions

| Actor                  | Scope  | Description                                                                                                                     |
| :--------------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------ |
| **Guest**              | System | Unauthenticated user accessing the system. Can register or login.                                                               |
| **Authenticated User** | System | Logged-in user with a valid session. Can manage profile, view notifications, search spaces, and request to join.                |
| **Member**             | Space  | Authenticated user who has joined a specific space. Can chat, upload files, and invite others (public spaces only).             |
| **Admin**              | Space  | Trusted member with moderation privileges. Can manage members, approve requests, update settings, and invite to private spaces. |
| **Owner**              | Space  | Creator or designated owner with full control. Can delete space, transfer ownership, and promote/demote admins.                 |

---

## Actor Capabilities by Use Case

| Use Case                               | Guest | Authenticated User | Member | Admin | Owner |
| :------------------------------------- | :---: | :----------------: | :----: | :---: | :---: |
| **UC-01: Authenticate**                |  ✅   |         ✅         |   ✅   |  ✅   |  ✅   |
| **UC-02: Manage Profile**              |  ❌   |         ✅         |   ✅   |  ✅   |  ✅   |
| **UC-03: Manage Space Lifecycle**      |  ❌   |        ✅\*        |  ✅\*  |  ✅   |  ✅   |
| **UC-04: Manage Membership**           |  ❌   |        ✅\*        |  ✅\*  |  ✅   |  ✅   |
| **UC-05: Manage Roles & Ownership**    |  ❌   |         ❌         |   ❌   | ✅\*  |  ✅   |
| **UC-06: Collaborate in Chat**         |  ❌   |         ❌         |   ✅   |  ✅   |  ✅   |
| **UC-07: Manage Files**                |  ❌   |         ❌         |   ✅   |  ✅   |  ✅   |
| **UC-08: View & Act on Notifications** |  ❌   |         ✅         |   ✅   |  ✅   |  ✅   |
| **UC-09: Favorite Spaces**             |  ❌   |         ✅         |   ✅   |  ✅   |  ✅   |

_\*Limited sub-use cases available (see Permission Matrix below)_

---

## Permission Matrix (Detailed)

| Action                      | Owner  | Admin | Member | Auth User | Guest |
| :-------------------------- | :----: | :---: | :----: | :-------: | :---: |
| **Register / Login**        |   —    |   —   |   —    |     —     |  ✅   |
| **Logout**                  |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Edit Own Profile**        |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Upload Avatar**           |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Configure Privacy**       |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Delete Own Account**      |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **View Other Profile**      |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Search Users**            |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Create Space**            |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Search Public Spaces**    |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Update Space Settings**   |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Change Space Appearance** |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Set Space Visibility**    |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Delete Space**            |   ✅   |  ❌   |   ❌   |    ❌     |  ❌   |
| **Invite (Public Space)**   |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Invite (Private Space)**  |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Generate Invite Link**    |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Join via Link**           |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Request to Join**         |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Approve/Reject Requests** |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Remove Member (Kick)**    |   ✅   | ✅\*  |   ❌   |    ❌     |  ❌   |
| **Ban Member**              |   ✅   | ✅\*  |   ❌   |    ❌     |  ❌   |
| **Unban Member**            |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Revoke Invite**           |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Leave Space**             | ❌\*\* |  ✅   |   ✅   |    ❌     |  ❌   |
| **Change Member Role**      |   ✅   | ✅\*  |   ❌   |    ❌     |  ❌   |
| **Transfer Ownership**      |   ✅   |  ❌   |   ❌   |    ❌     |  ❌   |
| **Send Message**            |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Reply to Message**        |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Forward Message**         |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Mention Users**           |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Edit Own Message**        |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Delete Own Message**      |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Delete Any Message**      |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Attach Files to Chat**    |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Upload File**             |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Create Folder**           |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Rename Folder**           |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Delete Folder**           |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Navigate Folders**        |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Rename Own File**         |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Rename Any File**         |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Delete Own File**         |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Delete Any File**         |   ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| **Move/Copy Files**         |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Preview File**            |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Download File**           |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Create Link**             |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **View Notifications**      |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Accept/Decline Invite**   |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Mark Notifications Read** |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| **Add/Remove Favorites**    |   ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| **Filter by Favorites**     |   ✅   |  ✅   |   ✅   |    ✅     |  ❌   |

_\*Admin cannot kick/ban/demote Owner or other Admins_  
_\*\*Owner must transfer ownership before leaving_

---

## Notes

- **Inheritance**: Each actor inherits all permissions from actors below them in the hierarchy
- **Space Context**: Member, Admin, and Owner roles are space-specific. A user can be Owner in one space and Member in another
- **Authenticated User** vs **Member**: An authenticated user becomes a Member only after joining a specific space
