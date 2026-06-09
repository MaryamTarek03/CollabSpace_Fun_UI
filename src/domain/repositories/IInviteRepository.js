/**
 * Invite Repository Interface
 * Defines the contract for invite operations
 */

/**
 * @interface IInviteRepository
 */
export const IInviteRepository = {
    /**
     * Accept an invite
     * @param {string} inviteId - Invite ID
     * @returns {Promise<Object>}
     */
    accept: async (inviteId) => { throw new Error('Not implemented'); },

    /**
     * Decline an invite
     * @param {string} inviteId - Invite ID
     * @returns {Promise<void>}
     */
    decline: async (inviteId) => { throw new Error('Not implemented'); },

    /**
     * Get invites for a space
     * @param {string} spaceId - Space ID
     * @returns {Promise<Array>}
     */
    getBySpace: async (spaceId) => { throw new Error('Not implemented'); },

    /**
     * Get invite by code
     * @param {string} code - Invite code
     * @returns {Promise<Object>}
     */
    getByCode: async (code) => { throw new Error('Not implemented'); },

    /**
     * Revoke an invite
     * @param {string} inviteId - Invite ID
     * @returns {Promise<void>}
     */
    revoke: async (inviteId) => { throw new Error('Not implemented'); },

    /**
     * Get user's pending invites
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    getByUser: async (userId) => { throw new Error('Not implemented'); },
};

/**
 * Create an Invite Repository interface for implementation
 * @returns {IInviteRepository}
 */
export function createInviteRepository() {
    return { ...IInviteRepository };
}
