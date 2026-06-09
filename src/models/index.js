// Color palette for user avatars
const AVATAR_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#ef4444', // red
    '#14b8a6', // teal
    '#f97316', // orange
];

function getRandomColor() {
    return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

import { formatRelativeTime } from '../shared/utils/helpers';

/**
 * User Model
 * Represents a user in the system
 */
export class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.username = data.username || '';
        this.email = data.email || '';
        this.avatarColor = data.avatarColor || getRandomColor();
        this.avatarImage = data.avatarImage || null;
        this.bio = data.bio || '';
        this.createdAt = data.createdAt || null;
    }

    // Get initials from name for avatar display
    get initials() {
        return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    }

    static fromApi(data) {
        return new User(data);
    }

    toApi() {
        return {
            name: this.name,
            username: this.username,
            email: this.email,
            avatarColor: this.avatarColor,
            bio: this.bio,
        };
    }
}

/**
 * Space Model
 * Represents a collaborative space
 */
export class Space {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.thumbnail = data.thumbnail || 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)';
        this.thumbnailPosition = data.thumbnailPosition || data.thumbnailposition || '50% 50%';
        this.category = data.category || data.type || 'MEETING'; // Support legacy 'type' field
        this.ownerId = data.ownerId || null;
        this.createdAt = data.createdAt || null;
        this.visibility = data.visibility || 'public';
        this.requestsCount = data.requestsCount || 0;
        this.files = (data.files || []).map(f => new SpaceFile(f));
        this.members = (data.members || []).map(m => new SpaceMember(m));
    }

    // Computed: member count from members array
    get memberCount() {
        return this.members.length;
    }

    get isPrivate() {
        return this.visibility === 'private';
    }

    static fromApi(data) {
        return new Space(data);
    }

    static fromApiList(dataList) {
        return (dataList || []).map(data => Space.fromApi(data));
    }

    toApi() {
        return {
            name: this.name,
            description: this.description,
            thumbnail: this.thumbnail,
            thumbnailPosition: this.thumbnailPosition,
            category: this.category,
            ownerId: this.ownerId,
            visibility: this.visibility,
        };
    }
}

/**
 * SpaceMember Model
 * Represents a member of a space (joins user data with membership data)
 * 
 * When fetched from API, this combines:
 * - User data: id, name, username, email, avatarColor, avatarImage
 * - Membership data: memberId, spaceId, role, joinedAt
 */
export class SpaceMember {
    constructor(data = {}) {
        // Membership-specific fields
        this.id = data.id || data.memberId || null; // Ensure ID is accessible as .id
        this.memberId = data.memberId || data.id || null;
        this.spaceId = data.spaceId || null;
        this.role = data.role || 'Member';
        this.joinedAt = data.joinedAt || null;

        // User fields (populated when fetching members with user data)
        this.userId = data.userId || null;
        this.name = data.name || '';
        this.username = data.username || '';
        this.email = data.email || '';
        this.avatarColor = data.avatarColor || data.avatar || getRandomColor();
        this.avatarImage = data.avatarImage || null;
    }

    // Get initials from name for avatar display
    get initials() {
        return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    }

    static fromApi(data) {
        return new SpaceMember(data);
    }

    static fromApiList(dataList) {
        return (dataList || []).map(data => SpaceMember.fromApi(data));
    }
}

/**
 * SpaceFile Model
 * Represents a file in a space
 */
export class SpaceFile {
    constructor(data = {}) {
        this.id = data.id || null;
        this.spaceId = data.spaceId || null;
        this.name = data.name || 'Untitled';
        this.type = data.type || 'doc';
        this.size = data.size || '0 KB';
        this.uploadedBy = data.uploadedBy || data.user || 'Unknown';
        this.uploaderName = data.uploaderName || data.user || 'Unknown User';
        this.createdAt = data.createdAt || null;
        this.downloadUrl = data.downloadUrl || null;
        this.storedFilename = data.storedFilename || null;
        this.mimeType = data.mimeType || null;
        // Calculate time dynamically from createdAt
        this.time = formatRelativeTime(this.createdAt || new Date());
    }

    static fromApi(data) {
        return new SpaceFile(data);
    }

    static fromApiList(dataList) {
        return (dataList || []).map(data => SpaceFile.fromApi(data));
    }
}

/**
 * Message Model
 * Represents a chat message
 * 
 * Stored fields: id, spaceId, senderId, text, type, mentions, time, createdAt
 * Joined fields (from users): sender, avatarColor, avatarImage
 */
export class Message {
    constructor(data = {}) {
        this.id = data.id || null;
        this.spaceId = data.spaceId || null;
        this.channelId = data.channelId || null;
        this.senderId = data.senderId || null;
        this.sender = data.sender || 'User'; // Display name (joined from users)
        this.avatarColor = data.avatarColor || getRandomColor();
        this.avatarImage = data.avatarImage || null; // Full URL from server
        this.text = data.text || '';
        this.type = data.type || 'user'; // 'user' or 'system'
        this.mentions = data.mentions || [];
        this.time = data.time || '';
        this.createdAt = data.createdAt || null;
        // Reply fields
        this.replyToId = data.replyToId || null;
        this.replyTo = data.replyTo || null; // { text, sender }
        // Forward fields
        this.forwardedFromChannel = data.forwardedFromChannel || null;
        // Soft delete fields
        this.deletedAt = data.deletedAt || null;
        this.deletedBy = data.deletedBy || null;
        this.deletedByRole = data.deletedByRole || null;
        // Attachments
        this.attachments = data.attachments || [];
    }

    // Check if this message is from a specific user
    isFromUser(userId) {
        return this.senderId && this.senderId === userId;
    }

    static fromApi(data) {
        return new Message(data);
    }

    static fromApiList(dataList) {
        return (dataList || []).map(data => Message.fromApi(data));
    }

    // Send only essential data - server joins with user data
    toApi() {
        return {
            senderId: this.senderId,
            text: this.text,
            type: this.type,
            mentions: this.mentions,
        };
    }
}

/**
 * Notification Model
 * Represents a user notification
 */
export class Notification {
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.type = data.type || 'system'; // 'invite', 'system', 'mention'
        this.author = data.author || '';
        this.text = data.text || '';
        this.target = data.target || '';
        this.spaceId = data.spaceId || null;
        this.inviteId = data.inviteId || null;
        this.action = data.action || null;
        this.read = data.read ?? false;
        this.createdAt = data.createdAt || null;
        this.time = formatRelativeTime(this.createdAt || data.time || new Date());
    }

    static fromApi(data) {
        return new Notification(data);
    }

    static fromApiList(dataList) {
        return (dataList || []).map(data => Notification.fromApi(data));
    }
}

/**
 * Invite Model
 * Represents a space invite
 */
export class Invite {
    constructor(data = {}) {
        this.id = data.id || null;
        this.spaceId = data.spaceId || null;
        this.spaceName = data.spaceName || '';
        this.userId = data.userId || null;
        this.inviterId = data.inviterId || null;
        this.inviterName = data.inviterName || '';
        this.status = data.status || 'pending'; // 'pending', 'accepted', 'declined'
        this.createdAt = data.createdAt || null;
        this.respondedAt = data.respondedAt || null;
    }

    static fromApi(data) {
        return new Invite(data);
    }

    static fromApiList(dataList) {
        return (dataList || []).map(data => Invite.fromApi(data));
    }
}

// Export color palette for use elsewhere
export { AVATAR_COLORS, getRandomColor };

export default {
    User,
    Space,
    SpaceMember,
    SpaceFile,
    Message,
    Notification,
    Invite,
    AVATAR_COLORS,
    getRandomColor,
};
