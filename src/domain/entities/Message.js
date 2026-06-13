/**
 * Message Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

const AVATAR_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
    '#8b5cf6', '#ef4444', '#14b8a6', '#f97316',
];

function getRandomColor() {
    return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/**
 * @typedef {Object} IMessage
 * @property {string} id - Unique identifier
 * @property {string} spaceId - Space ID
 * @property {string} channelId - Channel ID
 * @property {string} senderId - Sender user ID
 * @property {string} sender - Sender name
 * @property {string} avatarColor - Sender avatar color
 * @property {string|null} avatarImage - Sender avatar image
 * @property {string} text - Message text
 * @property {string} type - Message type ('user' | 'system')
 * @property {Array} mentions - Mentioned user IDs
 * @property {string} time - Time display
 * @property {string} createdAt - Creation timestamp
 * @property {string|null} replyToId - ID of message being replied to
 * @property {Object|null} replyTo - Reply context { text, sender }
 * @property {string|null} forwardedFromChannel - Source channel for forwards
 * @property {string|null} deletedAt - Soft delete timestamp
 * @property {string|null} deletedBy - Who deleted the message
 * @property {string|null} deletedByRole - Role of deleter
 * @property {Array} attachments - Message attachments
 */

/**
 * Message entity factory - creates a pure data object
 * @param {Object} data - Raw message data
 * @returns {IMessage}
 */
export function createMessage(data = {}) {
    return {
        id: data.id || null,
        spaceId: data.spaceId || null,
        channelId: data.channelId || 'general',
        senderId: data.senderId || null,
        sender: data.sender || 'Unknown',
        avatarColor: data.avatarColor || getRandomColor(),
        avatarImage: data.avatarImage || null,
        text: data.text || '',
        type: data.type || 'user',
        mentions: data.mentions || [],
        createdAt: data.createdAt || new Date().toISOString(),
        time: data.time || '',

        // Reply fields
        replyToId: data.replyToId || null,
        replyTo: data.replyTo || null,

        // Forward fields
        forwardedFromChannel: data.forwardedFromChannel || null,
        isForwarded: data.isForwarded || false,
        forwardedFrom: data.forwardedFrom || null,

        // Soft delete fields
        deletedAt: data.deletedAt || (data.isDeleted ? (data.updatedAt || data.createdAt || new Date().toISOString()) : null),
        deletedBy: data.deletedBy || null,
        deletedByRole: data.deletedByRole || null,

        // Attachments
        attachments: data.attachments || [],

        // Methods
        isFromUser(userId) {
            return this.senderId === userId;
        },

        get isDeleted() {
            return !!this.deletedAt || !!data.isDeleted;
        }
    };
}
