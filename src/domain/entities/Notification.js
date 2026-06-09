/**
 * Notification Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

/**
 * @typedef {Object} INotification
 * @property {string} id - Unique identifier
 * @property {string} userId - Target user ID
 * @property {string} type - Notification type ('invite' | 'system' | 'mention')
 * @property {string} author - Author/sender name
 * @property {string} text - Notification text/message
 * @property {string} target - Target entity name
 * @property {string} spaceId - Related space ID
 * @property {string} inviteId - Related invite ID
 * @property {string} action - Action type
 * @property {boolean} read - Read status
 * @property {Object} data - Additional data
 * @property {string} createdAt - Creation timestamp
 * @property {string} time - Time display
 */

/**
 * Notification entity factory - creates a pure data object
 * @param {Object} data - Raw notification data
 * @returns {INotification}
 */
export function createNotification(data = {}) {
    return {
        id: data.id || null,
        userId: data.userId || null,
        type: data.type || 'system',
        author: data.author || '',
        text: data.text || data.message || '',
        target: data.target || '',
        spaceId: data.spaceId || null,
        inviteId: data.inviteId || null,
        action: data.action || null,
        read: data.read ?? false,
        data: data.data || {},
        createdAt: data.createdAt || new Date().toISOString(),
        time: data.time || '',
    };
}
