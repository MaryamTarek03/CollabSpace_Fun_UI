/**
 * Invite Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

/**
 * @typedef {Object} IInvite
 * @property {string} id - Unique identifier
 * @property {string} spaceId - Space ID
 * @property {string} spaceName - Space name
 * @property {string} userId - Invited user ID
 * @property {string} inviterId - Inviter user ID
 * @property {string} inviterName - Inviter name
 * @property {string} code - Invite code
 * @property {string} status - 'pending' | 'accepted' | 'declined'
 * @property {string} createdAt - Creation timestamp
 * @property {string} respondedAt - Response timestamp
 * @property {string} expiresAt - Expiration timestamp
 * @property {string} time - Time display
 */

/**
 * Invite entity factory - creates a pure data object
 * @param {Object} data - Raw invite data
 * @returns {IInvite}
 */
export function createInvite(data = {}) {
    return {
        id: data.id || null,
        spaceId: data.spaceId || null,
        spaceName: data.spaceName || '',
        userId: data.userId || null,
        inviterId: data.inviterId || null,
        inviterName: data.inviterName || '',
        code: data.code || null,
        status: data.status || 'pending',
        createdAt: data.createdAt || new Date().toISOString(),
        respondedAt: data.respondedAt || null,
        expiresAt: data.expiresAt || null,
        time: data.time || '',
        space: data.space || null,
    };
}
