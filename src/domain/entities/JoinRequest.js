/**
 * JoinRequest Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

/**
 * @typedef {Object} IJoinRequest
 * @property {string} id - Unique identifier
 * @property {string} spaceId - Space ID
 * @property {string} userId - Requesting user ID
 * @property {string} userName - Requesting user name
 * @property {string} userEmail - Requesting user email
 * @property {string} userAvatar - User avatar color
 * @property {string} userAvatarImage - User avatar image
 * @property {string} status - 'pending' | 'approved' | 'rejected'
 * @property {string} createdAt - Creation timestamp
 * @property {string} respondedAt - Response timestamp
 * @property {string} time - Time display
 */

/**
 * JoinRequest entity factory - creates a pure data object
 * @param {Object} data - Raw join request data
 * @returns {IJoinRequest}
 */
export function createJoinRequest(data = {}) {
    return {
        id: data.id || null,
        spaceId: data.spaceId || null,
        userId: data.userId || null,
        userName: data.userName || data.name || '',
        userEmail: data.userEmail || data.email || '',
        userAvatar: data.userAvatar || data.avatarColor || '#3b82f6',
        userAvatarImage: data.userAvatarImage || data.avatarImage || null,
        status: data.status || 'pending',
        createdAt: data.createdAt || new Date().toISOString(),
        respondedAt: data.respondedAt || null,
        time: data.time || '',
        // UI compatibility properties
        name: data.userName || data.name || '',
        username: data.username || '',
        avatarImage: data.userAvatarImage || data.avatarImage || null,
        message: data.message || null,
        // Space details
        spaceName: data.spaceName || '',
        spaceDescription: data.spaceDescription || '',
        spaceThumbnail: data.spaceThumbnail || null,
        spaceOwner: data.spaceOwner || '',
    };
}
