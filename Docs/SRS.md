# Software Requirements Specification (SRS)

## CollabSpace - Collaborative Workspace Platform

**Version:** 1.0  
**Date:** December 27, 2025  
**Document Status:** Final

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Other Requirements](#6-other-requirements)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete description of the functional and non-functional requirements for the CollabSpace cross-platform application. It is intended for:

- Development team members
- Project stakeholders
- Quality assurance testers
- System architects

### 1.2 Scope

**CollabSpace** is a cross-platform collaborative workspace platform that enables users to:

- Create and manage collaborative spaces
- Communicate through real-time chat with channels
- Share and organize files
- Manage team membership with role-based access control

The system provides a centralized platform for teams to collaborate, share resources, and communicate effectively.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term    | Definition                                                    |
| ------- | ------------------------------------------------------------- |
| Space   | A collaborative workspace containing members, channels, files |
| Channel | A chat room within a space for organized communication        |
| Member  | A user who has joined a specific space                        |
| Admin   | A space member with elevated moderation privileges            |
| Owner   | The creator or designated controller of a space               |
| Guest   | An unauthenticated user accessing the system                  |
| SRS     | Software Requirements Specification                           |
| API     | Application Programming Interface                             |
| UI      | User Interface                                                |
| CRUD    | Create, Read, Update, Delete                                  |
| JWT     | JSON Web Token                                                |
| MVC     | Model-View-Controller                                         |

### 1.4 References

| Document                                   | Description                        |
| ------------------------------------------ | ---------------------------------- |
| [actors.md](actors.md)                     | System actors and role definitions |
| [use-cases.md](use-cases.md)               | Detailed use case specifications   |
| [use-case-diagram.md](use-case-diagram.md) | Use case diagrams (Mermaid)        |

### 1.5 Overview

This document is organized according to IEEE 830-1998 standard:

- **Section 2** provides an overall description of the product
- **Section 3** details specific functional requirements
- **Section 4** specifies external interface requirements
- **Section 5** defines non-functional requirements
- **Section 6** covers other requirements
- **Section 7** contains appendices

---

## 2. Overall Description

### 2.1 Product Perspective

CollabSpace is a standalone cross-platform application with client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     CollabSpace System                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │   React     │    │   ASP.NET   │    │    SQLServer    │  │
│  │   Flutter   │◄──►│   Backend   │◄──►│    Database     │  │
│  │   Unity     │    │   (REST)    │    │                 │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│        ▲                   ▲                                │
│        │                   │                                │
│  ┌─────┴─────┐       ┌─────┴─────┐                          │
│  │   Cahce   │       │   File    │                          │
│  │  Storage  │       │  System   │                          │
│  └───────────┘       └───────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

**System Context:**

- **Frontend:** React, Flutter, Unity
- **Backend:** ASP.NET REST API server
- **Database:** SQLServer for data persistence
- **File Storage:** Local file system for uploads

### 2.2 Product Functions

The major functions of CollabSpace are organized into nine use case categories:

| ID    | Function                    | Description                                          |
| ----- | --------------------------- | ---------------------------------------------------- |
| UC-01 | Authenticate                | User registration, login, and session management     |
| UC-02 | Manage Profile              | Profile editing, avatar management, privacy settings |
| UC-03 | Manage Space Lifecycle      | Space creation, configuration, and deletion          |
| UC-04 | Manage Membership           | Invitations, join requests, member removal, banning  |
| UC-05 | Manage Roles & Ownership    | Role assignment and ownership transfer               |
| UC-06 | Collaborate in Chat         | Messaging, mentions, replies, forwarding, channels   |
| UC-07 | Manage Files                | File upload, organization, sharing                   |
| UC-08 | View & Act on Notifications | Notification viewing and invite responses            |
| UC-09 | Favorite Spaces             | Quick access to preferred spaces                     |

### 2.3 User Classes and Characteristics

#### 2.3.1 Actor Hierarchy

```
Guest → Authenticated User → Member → Admin → Owner
```

#### 2.3.2 User Class Definitions

| User Class             | Technical Expertise | Frequency of Use | Description                                    |
| ---------------------- | ------------------- | ---------------- | ---------------------------------------------- |
| **Guest**              | Low                 | One-time         | Unauthenticated visitor registering/logging in |
| **Authenticated User** | Low-Medium          | Daily            | Logged-in user browsing and joining spaces     |
| **Member**             | Medium              | Daily            | Active participant in space collaboration      |
| **Admin**              | Medium-High         | Daily            | Moderator managing space members and content   |
| **Owner**              | High                | Weekly           | Space creator with full administrative control |

### 2.4 Operating Environment

| Component     | Requirement                                                   |
| ------------- | ------------------------------------------------------------- |
| **Client OS** | Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+), Android 10+ |
| **Browser**   | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+                 |
| **Server OS** | ASP.NET 8+ compatible OS                                      |
| **Database**  | SQLServer 2022+                                               |
| **Network**   | HTTP/HTTPS, minimum 1 Mbps connection                         |

### 2.5 Design and Implementation Constraints

| Constraint          | Description                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **Architecture**    | Must follow MVC/MVVM pattern with state management                                                        |
| **Frontend**        | React 18+ with functional components and hooks, Flutter with BLoC, Hive and clean architecture principles |
| **Styling**         | Tailwind CSS for responsive design                                                                        |
| **API Design**      | RESTful API with JSON payloads                                                                            |
| **Authentication**  | Session-based authentication with secure password hashing and JWT                                         |
| **File Size**       | Maximum upload size: 50MB per file                                                                        |
| **Browser Support** | Must support latest 2 versions of major browsers                                                          |

### 2.6 Assumptions and Dependencies

**Assumptions:**

1. Users have access to a modern web browser (for the web application)
2. Users have stable internet connectivity
3. Server has sufficient storage for file uploads
4. Single-server deployment (no horizontal scaling required)
5. Users have access to an Android and/or iOS device for the application
6. Mobile devices have sufficient storage to install and run the mobile application

**Dependencies:**

| Dependency   | Version | Purpose                 |
| ------------ | ------- | ----------------------- |
| React        | 18.x    | Frontend framework      |
| Vite         | 5.x     | Build tool              |
| Zustand      | 4.x     | Web state management    |
| Tailwind CSS | 3.x     | Styling                 |
| Lucide React | Latest  | Icon library            |
| Flutter      | 3.x     | Mobile framework        |
| BLoC         | Latest  | Mobile state management |
| Unity        | 2022.x  | Game engine             |
| Netcode      | Latest  | Multiplayer framework   |
| ASP.NET      | 8.x     | Backend framework       |
| SQLServer    | 2022    | Database driver         |

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 UC-01: Authenticate

##### FR-01.1: User Registration

| ID         | FR-01.1                                                       |
| ---------- | ------------------------------------------------------------- |
| Priority   | High                                                          |
| Input      | Name, username, email, password, confirm password             |
| Processing | Validate inputs, check uniqueness, hash password, create user |
| Output     | Success: User logged in; Failure: Error message               |

**Requirements:**

| Req ID    | Description                                                                                 |
| --------- | ------------------------------------------------------------------------------------------- |
| FR-01.1.1 | System SHALL accept name (2-30 characters)                                                  |
| FR-01.1.2 | System SHALL accept username (3-20 chars, lowercase, numbers, underscores)                  |
| FR-01.1.3 | System SHALL validate email format                                                          |
| FR-01.1.4 | System SHALL enforce password strength (min 8 chars, uppercase, lowercase, number, special) |
| FR-01.1.5 | System SHALL verify password confirmation matches                                           |
| FR-01.1.6 | System SHALL reject duplicate username or email                                             |
| FR-01.1.7 | System SHALL hash password using bcrypt before storage                                      |
| FR-01.1.8 | System SHALL auto-login user after successful registration                                  |

##### FR-01.2: User Login

| ID         | FR-01.2                                                     |
| ---------- | ----------------------------------------------------------- |
| Priority   | High                                                        |
| Input      | Email/username, password                                    |
| Processing | Validate credentials, check lockout, create session         |
| Output     | Success: Dashboard redirect; Failure: Error/lockout message |

**Requirements:**

| Req ID    | Description                                            |
| --------- | ------------------------------------------------------ |
| FR-01.2.1 | System SHALL accept email or username as identifier    |
| FR-01.2.2 | System SHALL validate password against stored hash     |
| FR-01.2.3 | System SHALL track failed login attempts               |
| FR-01.2.4 | System SHALL lock account after 5 consecutive failures |
| FR-01.2.5 | System SHALL display lockout countdown timer           |
| FR-01.2.6 | System SHALL redirect to Dashboard on success          |

##### FR-01.3: User Logout

| Req ID    | Description                               |
| --------- | ----------------------------------------- |
| FR-01.3.1 | System SHALL clear user session on logout |
| FR-01.3.2 | System SHALL clear local state (stores)   |
| FR-01.3.3 | System SHALL redirect to Auth page        |

---

#### 3.1.2 UC-02: Manage Profile

##### FR-02.1: View Own Profile

| Req ID    | Description                                            |
| --------- | ------------------------------------------------------ |
| FR-02.1.1 | System SHALL display user's name, username, email, bio |
| FR-02.1.2 | System SHALL display avatar (image or initials)        |
| FR-02.1.3 | System SHALL display account creation date             |

##### FR-02.2: Edit Profile Information

| Req ID    | Description                                         |
| --------- | --------------------------------------------------- |
| FR-02.2.1 | System SHALL allow editing name (2-30 characters)   |
| FR-02.2.2 | System SHALL allow editing username with validation |
| FR-02.2.3 | System SHALL allow editing bio (max 160 characters) |
| FR-02.2.4 | System SHALL validate username uniqueness on change |
| FR-02.2.5 | System SHALL persist changes to database            |

##### FR-02.3: Manage Avatar

| Req ID    | Description                                              |
| --------- | -------------------------------------------------------- |
| FR-02.3.1 | System SHALL accept image uploads (JPEG, PNG, GIF, WebP) |
| FR-02.3.2 | System SHALL provide image cropping functionality        |
| FR-02.3.3 | System SHALL allow avatar deletion                       |
| FR-02.3.4 | System SHALL display initials when no avatar is set      |
| FR-02.3.5 | System SHALL use avatarColor for initial background      |

##### FR-02.4: Configure Privacy Settings

| Req ID    | Description                                      |
| --------- | ------------------------------------------------ |
| FR-02.4.1 | System SHALL allow setting profile visibility    |
| FR-02.4.2 | System SHALL allow hiding email from other users |
| FR-02.4.3 | System SHALL allow hiding shared spaces list     |

##### FR-02.5: Delete Account

| Req ID    | Description                                       |
| --------- | ------------------------------------------------- |
| FR-02.5.1 | System SHALL require confirmation before deletion |
| FR-02.5.2 | System SHALL remove user from all spaces          |
| FR-02.5.3 | System SHALL transfer/delete owned spaces         |
| FR-02.5.4 | System SHALL anonymize user identity data         |
| FR-02.5.5 | System SHALL log out user after deletion          |

##### FR-02.6: View Other User Profile

| Req ID    | Description                                                 |
| --------- | ----------------------------------------------------------- |
| FR-02.6.1 | System SHALL display profile based on privacy settings      |
| FR-02.6.2 | System SHALL show shared spaces (if permitted)              |
| FR-02.6.3 | System SHALL provide invite option (if user has permission) |

---

#### 3.1.3 UC-03: Manage Space Lifecycle

##### FR-03.1: Create Space

| Req ID    | Description                                               |
| --------- | --------------------------------------------------------- |
| FR-03.1.1 | System SHALL accept space name (required, max 100 chars)  |
| FR-03.1.2 | System SHALL accept description (optional, max 500 chars) |
| FR-03.1.3 | System SHALL accept category selection                    |
| FR-03.1.4 | System SHALL accept visibility (public/private)           |
| FR-03.1.5 | System SHALL set creator as Owner                         |
| FR-03.1.6 | System SHALL create default "General" channel             |
| FR-03.1.7 | System SHALL generate invite link                         |

##### FR-03.2: Update Space Settings

| Req ID    | Description                                     |
| --------- | ----------------------------------------------- |
| FR-03.2.1 | Admin/Owner SHALL be able to update space name  |
| FR-03.2.2 | Admin/Owner SHALL be able to update description |
| FR-03.2.3 | Admin/Owner SHALL be able to change visibility  |

##### FR-03.3: Change Space Appearance

| Req ID    | Description                                      |
| --------- | ------------------------------------------------ |
| FR-03.3.1 | System SHALL accept thumbnail image upload       |
| FR-03.3.2 | System SHALL allow thumbnail position adjustment |
| FR-03.3.3 | System SHALL allow thumbnail removal             |

##### FR-03.4: Delete Space

| Req ID    | Description                                       |
| --------- | ------------------------------------------------- |
| FR-03.4.1 | Only Owner SHALL be able to delete space          |
| FR-03.4.2 | System SHALL require confirmation                 |
| FR-03.4.3 | System SHALL delete all channels, messages, files |
| FR-03.4.4 | System SHALL remove all member associations       |
| FR-03.4.5 | System SHALL notify members of deletion           |

##### FR-03.5: Search Public Spaces

| Req ID    | Description                           |
| --------- | ------------------------------------- |
| FR-03.5.1 | System SHALL search by space name     |
| FR-03.5.2 | System SHALL filter by category       |
| FR-03.5.3 | System SHALL display member count     |
| FR-03.5.4 | System SHALL show join/request button |

---

#### 3.1.4 UC-04: Manage Membership

##### FR-04.1: Invite User

| Req ID    | Description                                           |
| --------- | ----------------------------------------------------- |
| FR-04.1.1 | Member SHALL be able to invite to public spaces       |
| FR-04.1.2 | Admin/Owner SHALL be able to invite to private spaces |
| FR-04.1.3 | System SHALL search users by name/username            |
| FR-04.1.4 | System SHALL create invite notification               |
| FR-04.1.5 | System SHALL prevent duplicate invites                |

##### FR-04.2: Generate Invite Link

| Req ID    | Description                                      |
| --------- | ------------------------------------------------ |
| FR-04.2.1 | System SHALL generate unique invite code         |
| FR-04.2.2 | System SHALL allow copying link to clipboard     |
| FR-04.2.3 | Admin/Owner SHALL be able to revoke invite links |

##### FR-04.3: Join via Link

| Req ID    | Description                                     |
| --------- | ----------------------------------------------- |
| FR-04.3.1 | System SHALL validate invite code               |
| FR-04.3.2 | System SHALL display space preview              |
| FR-04.3.3 | System SHALL add user as Member on confirmation |
| FR-04.3.4 | System SHALL handle expired/invalid codes       |

##### FR-04.4: Request to Join

| Req ID    | Description                                                    |
| --------- | -------------------------------------------------------------- |
| FR-04.4.1 | System SHALL create join request for spaces requiring approval |
| FR-04.4.2 | System SHALL notify Admins/Owner of request                    |
| FR-04.4.3 | System SHALL prevent duplicate requests                        |
| FR-04.4.4 | User SHALL be able to cancel pending request                   |

##### FR-04.5: Approve/Reject Request

| Req ID    | Description                                  |
| --------- | -------------------------------------------- |
| FR-04.5.1 | Admin/Owner SHALL view pending requests      |
| FR-04.5.2 | Admin/Owner SHALL be able to approve request |
| FR-04.5.3 | Admin/Owner SHALL be able to reject request  |
| FR-04.5.4 | System SHALL notify requester of decision    |

##### FR-04.6: Remove Member (Kick)

| Req ID    | Description                                    |
| --------- | ---------------------------------------------- |
| FR-04.6.1 | Admin SHALL be able to kick Members            |
| FR-04.6.2 | Owner SHALL be able to kick Members and Admins |
| FR-04.6.3 | System SHALL require confirmation              |
| FR-04.6.4 | System SHALL remove member from space          |

##### FR-04.7: Ban Member

| Req ID    | Description                                     |
| --------- | ----------------------------------------------- |
| FR-04.7.1 | Admin/Owner SHALL be able to ban members        |
| FR-04.7.2 | System SHALL accept ban reason                  |
| FR-04.7.3 | System SHALL prevent banned user from rejoining |
| FR-04.7.4 | System SHALL log ban with timestamp and banner  |

##### FR-04.8: Unban Member

| Req ID    | Description                                |
| --------- | ------------------------------------------ |
| FR-04.8.1 | Admin/Owner SHALL view banned users list   |
| FR-04.8.2 | Admin/Owner SHALL be able to unban users   |
| FR-04.8.3 | System SHALL allow unbanned user to rejoin |

##### FR-04.9: Leave Space

| Req ID    | Description                                                     |
| --------- | --------------------------------------------------------------- |
| FR-04.9.1 | Member/Admin SHALL be able to leave space                       |
| FR-04.9.2 | Owner SHALL NOT be able to leave without transferring ownership |
| FR-04.9.3 | System SHALL require confirmation                               |

---

#### 3.1.5 UC-05: Manage Roles & Ownership

##### FR-05.1: Change Member Role

| Req ID    | Description                                         |
| --------- | --------------------------------------------------- |
| FR-05.1.1 | Owner SHALL be able to promote Member to Admin      |
| FR-05.1.2 | Owner SHALL be able to demote Admin to Member       |
| FR-05.1.3 | Admin SHALL NOT be able to change other Admin roles |
| FR-05.1.4 | System SHALL update role immediately                |

##### FR-05.2: Transfer Ownership

| Req ID    | Description                            |
| --------- | -------------------------------------- |
| FR-05.2.1 | Only Owner SHALL initiate transfer     |
| FR-05.2.2 | System SHALL require confirmation      |
| FR-05.2.3 | System SHALL set new owner             |
| FR-05.2.4 | System SHALL demote old owner to Admin |

---

#### 3.1.6 UC-06: Collaborate in Chat

##### FR-06.1: Manage Channels

| Req ID    | Description                                           |
| --------- | ----------------------------------------------------- |
| FR-06.1.1 | System SHALL display channel list                     |
| FR-06.1.2 | Admin/Owner SHALL create channels (name, description) |
| FR-06.1.3 | Admin/Owner SHALL edit channel details                |
| FR-06.1.4 | Admin/Owner SHALL delete channels (except default)    |
| FR-06.1.5 | Member SHALL be able to switch between channels       |

##### FR-06.2: Send Message

| Req ID    | Description                                         |
| --------- | --------------------------------------------------- |
| FR-06.2.1 | Member SHALL compose text messages                  |
| FR-06.2.2 | System SHALL display sender info and timestamp      |
| FR-06.2.3 | System SHALL render messages in chronological order |
| FR-06.2.4 | System SHALL support emoji input                    |

##### FR-06.3: Reply to Message

| Req ID    | Description                                       |
| --------- | ------------------------------------------------- |
| FR-06.3.1 | Member SHALL reply to specific messages           |
| FR-06.3.2 | System SHALL display reply preview                |
| FR-06.3.3 | System SHALL link reply to original message       |
| FR-06.3.4 | System SHALL allow navigation to original message |

##### FR-06.4: Forward Message

| Req ID    | Description                                     |
| --------- | ----------------------------------------------- |
| FR-06.4.1 | Member SHALL forward messages to other channels |
| FR-06.4.2 | System SHALL indicate forwarded messages        |
| FR-06.4.3 | System SHALL show original channel name         |

##### FR-06.5: Mention Users

| Req ID    | Description                                         |
| --------- | --------------------------------------------------- |
| FR-06.5.1 | System SHALL trigger mention popup on "@" character |
| FR-06.5.2 | System SHALL filter members as user types           |
| FR-06.5.3 | System SHALL highlight mentions in messages         |
| FR-06.5.4 | System SHALL create notification for mentioned user |

##### FR-06.6: Edit Message

| Req ID    | Description                           |
| --------- | ------------------------------------- |
| FR-06.6.1 | Author SHALL edit own messages        |
| FR-06.6.2 | System SHALL indicate edited messages |

##### FR-06.7: Delete Message

| Req ID    | Description                                        |
| --------- | -------------------------------------------------- |
| FR-06.7.1 | Author SHALL delete own messages                   |
| FR-06.7.2 | Admin/Owner SHALL delete any message               |
| FR-06.7.3 | System SHALL soft-delete (mark as deleted)         |
| FR-06.7.4 | System SHALL display "Message deleted" placeholder |

##### FR-06.8: Attach Files

| Req ID    | Description                             |
| --------- | --------------------------------------- |
| FR-06.8.1 | Member SHALL attach files to messages   |
| FR-06.8.2 | System SHALL display attachment preview |
| FR-06.8.3 | System SHALL link attachment to message |

---

#### 3.1.7 UC-07: Manage Files

##### FR-07.1: View Files

| Req ID    | Description                                       |
| --------- | ------------------------------------------------- |
| FR-07.1.1 | System SHALL display files in grid or list view   |
| FR-07.1.2 | System SHALL show file name, type, size, uploader |
| FR-07.1.3 | System SHALL support filtering by file type       |
| FR-07.1.4 | System SHALL support sorting options              |

##### FR-07.2: Upload File

| Req ID    | Description                                  |
| --------- | -------------------------------------------- |
| FR-07.2.1 | Member SHALL upload files up to 50MB         |
| FR-07.2.2 | System SHALL display upload progress         |
| FR-07.2.3 | System SHALL store file with unique filename |
| FR-07.2.4 | System SHALL record uploader and timestamp   |
| FR-07.2.5 | System SHALL support multiple file upload    |

##### FR-07.3: Manage Folders

| Req ID    | Description                                |
| --------- | ------------------------------------------ |
| FR-07.3.1 | Admin/Owner SHALL create folders           |
| FR-07.3.2 | System SHALL support nested folders        |
| FR-07.3.3 | Member SHALL navigate folder hierarchy     |
| FR-07.3.4 | System SHALL display breadcrumb navigation |
| FR-07.3.5 | Admin/Owner SHALL rename any folder        |
| FR-07.3.6 | Admin/Owner SHALL delete any folder        |

##### FR-07.4: Rename File

| Req ID    | Description                          |
| --------- | ------------------------------------ |
| FR-07.4.1 | Uploader SHALL rename own files      |
| FR-07.4.2 | Admin/Owner SHALL rename any file    |
| FR-07.4.3 | System SHALL preserve file extension |

##### FR-07.5: Delete File

| Req ID    | Description                       |
| --------- | --------------------------------- |
| FR-07.5.1 | Uploader SHALL delete own files   |
| FR-07.5.2 | Admin/Owner SHALL delete any file |
| FR-07.5.3 | System SHALL require confirmation |
| FR-07.5.4 | System SHALL remove physical file |

##### FR-07.6: Move/Copy Files

| Req ID    | Description                                 |
| --------- | ------------------------------------------- |
| FR-07.6.1 | Member SHALL select multiple files          |
| FR-07.6.2 | Member SHALL move files to different folder |
| FR-07.6.3 | Member SHALL copy files to different folder |
| FR-07.6.4 | System SHALL handle duplicate names         |

##### FR-07.7: Preview File

| Req ID    | Description                                      |
| --------- | ------------------------------------------------ |
| FR-07.7.1 | System SHALL preview images inline               |
| FR-07.7.2 | System SHALL preview videos with player          |
| FR-07.7.3 | System SHALL show info for non-previewable files |

##### FR-07.8: Download File

| Req ID    | Description                               |
| --------- | ----------------------------------------- |
| FR-07.8.1 | Member SHALL download any file in space   |
| FR-07.8.2 | System SHALL provide direct download link |
| FR-07.8.3 | System SHALL preserve original filename   |

##### FR-07.9: Create Link

| Req ID    | Description                            |
| --------- | -------------------------------------- |
| FR-07.9.1 | Member SHALL create external URL links |
| FR-07.9.2 | System SHALL validate URL format       |
| FR-07.9.3 | System SHALL display links with icon   |

---

#### 3.1.8 UC-08: View & Act on Notifications

##### FR-08.1: View Notifications

| Req ID    | Description                                                    |
| --------- | -------------------------------------------------------------- |
| FR-08.1.1 | System SHALL display notification bell with unread count       |
| FR-08.1.2 | System SHALL list notifications in reverse chronological order |
| FR-08.1.3 | System SHALL categorize by type (invite, mention, system)      |
| FR-08.1.4 | System SHALL visually distinguish read/unread                  |

##### FR-08.2: Accept Invite

| Req ID    | Description                              |
| --------- | ---------------------------------------- |
| FR-08.2.1 | User SHALL accept space invite           |
| FR-08.2.2 | System SHALL add user to space as Member |
| FR-08.2.3 | System SHALL mark notification as read   |
| FR-08.2.4 | System SHALL refresh space list          |

##### FR-08.3: Decline Invite

| Req ID    | Description                            |
| --------- | -------------------------------------- |
| FR-08.3.1 | User SHALL decline space invite        |
| FR-08.3.2 | System SHALL update invite status      |
| FR-08.3.3 | System SHALL mark notification as read |

##### FR-08.4: Mark as Read

| Req ID    | Description                                     |
| --------- | ----------------------------------------------- |
| FR-08.4.1 | User SHALL mark individual notification as read |
| FR-08.4.2 | User SHALL mark all notifications as read       |
| FR-08.4.3 | System SHALL update unread count                |

---

#### 3.1.9 UC-09: Favorite Spaces

##### FR-09.1: Add to Favorites

| Req ID    | Description                            |
| --------- | -------------------------------------- |
| FR-09.1.1 | User SHALL add space to favorites      |
| FR-09.1.2 | System SHALL display filled heart icon |
| FR-09.1.3 | System SHALL persist favorite status   |

##### FR-09.2: Remove from Favorites

| Req ID    | Description                              |
| --------- | ---------------------------------------- |
| FR-09.2.1 | User SHALL remove space from favorites   |
| FR-09.2.2 | System SHALL display unfilled heart icon |

##### FR-09.3: Filter by Favorites

| Req ID    | Description                                        |
| --------- | -------------------------------------------------- |
| FR-09.3.1 | User SHALL filter dashboard to show only favorites |
| FR-09.3.2 | System SHALL persist filter preference             |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 General UI Requirements

| Req ID | Description                                                  |
| ------ | ------------------------------------------------------------ |
| UI-01  | System SHALL be responsive (mobile, tablet, desktop)         |
| UI-02  | System SHALL support light and dark themes                   |
| UI-03  | System SHALL use consistent color palette and typography     |
| UI-04  | System SHALL display loading indicators for async operations |
| UI-05  | System SHALL display toast notifications for user feedback   |
| UI-06  | System SHALL use modal dialogs for focused tasks             |

#### 4.1.2 Screen Layout

| Screen             | Description                                              |
| ------------------ | -------------------------------------------------------- |
| **Auth Page**      | Login/Register forms with toggle                         |
| **Dashboard**      | Space grid with filtering, searching, and categorization |
| **Space Details**  | Space overview with quick actions and statistics         |
| **Chat View**      | Channel sidebar, message area, input section             |
| **Files Modal**    | Folder tree, file grid/list, toolbar                     |
| **Members Modal**  | Member list with role badges and action menus            |
| **Settings Modal** | Tabbed interface for profile, privacy, appearance        |

### 4.2 Hardware Interfaces

| Req ID | Description                                            |
| ------ | ------------------------------------------------------ |
| HW-01  | System SHALL support standard keyboard and mouse input |
| HW-02  | System SHALL support touch input on mobile devices     |
| HW-03  | System SHALL access device camera                      |
| HW-04  | System SHALL access device file system for uploads     |

### 4.3 Software Interfaces

#### 4.3.1 API Interface

| Endpoint Category | Base Path                | Description                |
| ----------------- | ------------------------ | -------------------------- |
| Authentication    | `/auth`                  | Login, register            |
| Users             | `/users`                 | Profile, search, favorites |
| Spaces            | `/spaces`                | CRUD, search, join         |
| Members           | `/spaces/:id/members`    | Member management          |
| Channels          | `/spaces/:id/channels`   | Channel CRUD               |
| Messages          | `/channels/:id/messages` | Message CRUD               |
| Files             | `/spaces/:id/files`      | File management            |
| Folders           | `/spaces/:id/folders`    | Folder management          |
| Notifications     | `/notifications`         | Notification management    |
| Invites           | `/invites`               | Invite management          |

#### 4.3.2 API Response Format

```json
{
  "isSuccess": true,
  "data": {},
  "errors": null,
  "message": "Operation successful"
}
```

### 4.4 Communications Interfaces

| Req ID | Description                                           |
| ------ | ----------------------------------------------------- |
| CI-01  | System SHALL use HTTP/HTTPS protocol                  |
| CI-02  | System SHALL use JSON for data exchange               |
| CI-03  | System SHALL use multipart/form-data for file uploads |
| CI-04  | System SHALL handle CORS for cross-origin requests    |

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| Req ID | Requirement                                                |
| ------ | ---------------------------------------------------------- |
| PR-01  | Page load time SHALL be < 3 seconds on 4G connection       |
| PR-02  | API response time SHALL be < 500ms for standard operations |
| PR-03  | File upload SHALL support files up to 50MB                 |
| PR-04  | System SHALL handle 100 concurrent users                   |
| PR-05  | Message list SHALL load < 2 seconds for 500 messages       |
| PR-06  | Search results SHALL return < 1 second                     |

### 5.2 Security Requirements

| Req ID | Requirement                                                    |
| ------ | -------------------------------------------------------------- |
| SR-01  | Passwords SHALL be hashed                                      |
| SR-02  | System SHALL implement account lockout after 5 failed attempts |
| SR-03  | System SHALL validate and sanitize all user inputs             |
| SR-04  | System SHALL prevent SQL injection attacks                     |
| SR-05  | System SHALL prevent XSS attacks                               |
| SR-06  | System SHALL enforce role-based access control                 |
| SR-07  | API endpoints SHALL validate user authorization                |
| SR-08  | File uploads SHALL validate file types                         |

### 5.3 Reliability Requirements

| Req ID | Requirement                                            |
| ------ | ------------------------------------------------------ |
| RL-01  | System availability SHALL be 99% during business hours |
| RL-02  | System SHALL gracefully handle API errors              |
| RL-03  | System SHALL persist user data reliably                |
| RL-04  | System SHALL recover from browser refresh              |

### 5.4 Availability Requirements

| Req ID | Requirement                                                   |
| ------ | ------------------------------------------------------------- |
| AV-01  | System SHALL be accessible 24/7                               |
| AV-02  | Planned maintenance SHALL be scheduled outside business hours |
| AV-03  | System SHALL display maintenance message when unavailable     |

### 5.5 Usability Requirements

| Req ID | Requirement                                          |
| ------ | ---------------------------------------------------- |
| US-01  | New users SHALL complete registration in < 2 minutes |
| US-02  | Common tasks SHALL require < 3 clicks                |
| US-03  | Error messages SHALL be clear and actionable         |
| US-04  | System SHALL provide keyboard navigation             |
| US-05  | System SHALL support screen readers (WCAG 2.1 AA)    |
| US-06  | System SHALL provide visual feedback for all actions |

### 5.6 Scalability Requirements

| Req ID | Requirement                                                   |
| ------ | ------------------------------------------------------------- |
| SC-01  | Database schema SHALL support future feature additions        |
| SC-02  | API design SHALL follow RESTful conventions for extensibility |
| SC-03  | Component architecture SHALL support code splitting           |

### 5.7 Maintainability Requirements

| Req ID | Requirement                                            |
| ------ | ------------------------------------------------------ |
| MN-01  | Code SHALL follow consistent style guidelines (ESLint) |
| MN-02  | Components SHALL be modular and reusable               |
| MN-03  | API changes SHALL maintain backward compatibility      |

---

## 6. Other Requirements

### 6.1 Database Requirements

#### 6.1.1 Entity Tables

| Table            | Description                         |
| ---------------- | ----------------------------------- |
| `users`          | User accounts and profiles          |
| `spaces`         | Collaborative workspace metadata    |
| `space_members`  | User-space membership relationships |
| `channels`       | Chat channels within spaces         |
| `messages`       | Chat messages                       |
| `files`          | File metadata and storage info      |
| `folders`        | Folder hierarchy                    |
| `notifications`  | User notifications                  |
| `invites`        | Space invitations                   |
| `space_codes`    | Invite link codes                   |
| `join_requests`  | Pending join requests               |
| `space_bans`     | Banned user records                 |
| `user_favorites` | User space favorites                |

### 6.2 Internationalization Requirements

| Req ID  | Requirement                                           |
| ------- | ----------------------------------------------------- |
| I18N-01 | System SHALL support UTF-8 encoding                   |
| I18N-02 | Date/time SHALL use user's locale                     |
| I18N-03 | UI text SHALL be externalized for future localization |

### 6.3 Legal Requirements

| Req ID | Requirement                                         |
| ------ | --------------------------------------------------- |
| LG-01  | System SHALL provide privacy policy                 |
| LG-02  | System SHALL not share user data with third parties |

---

## 7. Appendices

### Appendix A: Use Case Summary

| UC ID     | Use Case                    | Sub-Use Cases |
| --------- | --------------------------- | ------------- |
| UC-01     | Authenticate                | 3             |
| UC-02     | Manage Profile              | 5             |
| UC-03     | Manage Space Lifecycle      | 6             |
| UC-04     | Manage Membership           | 10            |
| UC-05     | Manage Roles & Ownership    | 4             |
| UC-06     | Collaborate in Chat         | 8             |
| UC-07     | Manage Files                | 10            |
| UC-08     | View & Act on Notifications | 5             |
| UC-09     | Favorite Spaces             | 3             |
| **Total** |                             | **54**        |

### Appendix B: Data Models

| Model        | Key Attributes                                                  |
| ------------ | --------------------------------------------------------------- |
| User         | id, name, username, email, avatarColor, avatarImage, bio        |
| Space        | id, name, description, thumbnail, category, visibility, ownerId |
| SpaceMember  | id, spaceId, userId, role, joinedAt                             |
| Message      | id, channelId, senderId, text, mentions, replyToId, attachments |
| SpaceFile    | id, spaceId, name, type, size, uploadedBy, storedFilename       |
| Notification | id, userId, type, text, read, spaceId, inviteId                 |
| Invite       | id, spaceId, userId, inviterId, status                          |

### Appendix C: Role Permissions Matrix

| Permission         | Owner | Admin | Member | Auth User | Guest |
| ------------------ | :---: | :---: | :----: | :-------: | :---: |
| Register/Login     |   —   |   —   |   —    |     —     |  ✅   |
| Manage Own Profile |  ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| Create Space       |  ✅   |  ✅   |   ✅   |    ✅     |  ❌   |
| Delete Space       |  ✅   |  ❌   |   ❌   |    ❌     |  ❌   |
| Manage Members     |  ✅   |  ✅   |   ❌   |    ❌     |  ❌   |
| Transfer Ownership |  ✅   |  ❌   |   ❌   |    ❌     |  ❌   |
| Send Messages      |  ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| Upload Files       |  ✅   |  ✅   |   ✅   |    ❌     |  ❌   |
| Delete Any File    |  ✅   |  ✅   |   ❌   |    ❌     |  ❌   |

### Appendix D: Technology Stack

| Category                       | Technology/Tool                            | Version (2025) | Justification                                                                                                       |
| ------------------------------ | ------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Backend Framework              | ASP.NET Core 8.0                           | 8.0 LTS        | High performance, native WebSocket support, excellent SignalR integration, mature ecosystem                         |
| Real-time Communication        | ASP.NET Core SignalR                       | 8.0            | Bi-directional WebSocket communication with automatic fallback, built-in hub scaling                                |
| Authentication & Authorization | ASP.NET Core Identity + JWT Bearer         | 8.0            | Built-in user management, role-based access control, stateless JWT tokens                                           |
| Database                       | PostgreSQL or SQLServer                    | 16+            | Open-source, excellent JSONB support for polymorphic content, robust concurrency                                    |
| Object-Relational Mapper       | Entity Framework Core                      | 8.0            | Code-first migrations, LINQ support, async operations                                                               |
| Cloud Storage                  | Azure Blob Storage OR AWS S3               | Latest         | Scalable file storage for PDFs, images, and exported whiteboards                                                    |
| 3D Client & Game Engine        | Unity Engine                               | 2022.3 LTS     | Industry leader for real-time 3D, WebGL export, mature networking (Netcode for GameObjects + custom SignalR client) |
| Unity Networking               | Custom SignalR Client + Unity Netcode      | –              | Full control over synchronization while leveraging Unity’s rendering power                                          |
| Mobile Wrapper                 | Flutter 3.19+                              | 3.24+ (2025)   | Single codebase for iOS & Android, excellent Unity view embedding via `flutter_unity_widget`                        |
| Web                            | React 18 + Vite + TypeScript               | Latest         | Fast development, component-based UI, easy integration with SignalR                                                 |
| API Gateway / Reverse Proxy    | YARP (Yet Another Reverse Proxy)           | 8.0            | Lightweight in-process gateway for clean external API while keeping internal service separation                     |
| Development Methodology        | Agile (Scrum-inspired) with 2-week sprints | –              | Allows rapid iteration, frequent demos, and flexibility within fixed graduation timeline                            |
| Version Control                | Git + GitHub                               | –              | Branching strategy (feature branches, PR reviews), GitHub Actions for CI/CD                                         |
| Project Management             | GitHub Projects (Kanban) + Discord         | –              | Real-time communication, task assignment, daily stand-ups                                                           |
| Design & Prototyping           | Figma & Eraser                             | –              | UI/UX mockups, 3D room layout planning, avatar design                                                               |
| Documentation & Diagrams       | draw.io (diagrams.net) + Mermaid           | –              | Professional UML, sequence, and architecture diagrams                                                               |

### Appendix E: Related Documents

- [actors.md](actors.md) - Detailed actor definitions
- [use-cases.md](use-cases.md) - Complete use case specifications
- [use-case-diagram.md](use-case-diagram.md) - Visual use case diagrams

---

**Document Control**

| Version | Date       | Author | Changes         |
| ------- | ---------- | ------ | --------------- |
| 1.0     | 2025-12-27 | System | Initial release |
