/**
 * Ban Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

/**
 * @typedef {Object} IBan
 * @property {string} id - Unique identifier
 * @property {string} spaceId - Space ID
 * @property {string} userId - Banned user ID
 * @property {string} userName - Banned user name
 * @property {string} userAvatar - User avatar color
 * @property {string} userAvatarImage - User avatar image
 * @property {string} bannedBy - Admin who banned
 * @property {string} bannedByName - Admin name
 * @property {string} reason - Ban reason
 * @property {string} createdAt - Ban timestamp
 * @property {string} time - Time display
 */

/**
 * Ban entity factory - creates a pure data object
 * @param {Object} data - Raw ban data
 * @returns {IBan}
 */
export function createBan(data = {}) {
    return {
        id: data.id || null,
        spaceId: data.spaceId || null,
        userId: data.userId || null,
        userName: data.userName || data.name || '',
        userAvatar: data.userAvatar || data.avatarColor || '#3b82f6',
        userAvatarImage: data.userAvatarImage || data.avatarImage || null,
        bannedBy: data.bannedBy || null,
        bannedByName: data.bannedByName || '',
        reason: data.reason || '',
        createdAt: data.createdAt || new Date().toISOString(),
        time: data.time || '',
    };
}
