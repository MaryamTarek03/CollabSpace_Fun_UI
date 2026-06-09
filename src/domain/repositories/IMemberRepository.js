/**
 * Member Repository Interface
 * Defines the contract for space member operations
 */

/**
 * @interface IMemberRepository
 */
export const IMemberRepository = {
    /**
     * Get members of a space
     * @param {string} spaceId - Space ID
     * @returns {Promise<Array<IMember>>}
     */
    getBySpace: async (spaceId) => { throw new Error('Not implemented'); },

    /**
     * Add member to space
     * @param {string} spaceId - Space ID
     * @param {Object} data - Member data
     * @returns {Promise<IMember>}
     */
    add: async (spaceId, data) => { throw new Error('Not implemented'); },

    /**
     * Update member role
     * @param {string} spaceId - Space ID
     * @param {string} memberId - Member ID
     * @param {string} role - New role
     * @returns {Promise<void>}
     */
    updateRole: async (spaceId, memberId, role) => { throw new Error('Not implemented'); },

    /**
     * Remove member from space
     * @param {string} spaceId - Space ID
     * @param {string} memberId - Member ID
     * @returns {Promise<void>}
     */
    remove: async (spaceId, memberId) => { throw new Error('Not implemented'); },

    /**
     * Ban member from space
     * @param {string} spaceId - Space ID
     * @param {string} memberId - Member ID
     * @param {string} bannedBy - Admin user ID
     * @param {string} reason - Ban reason
     * @returns {Promise<void>}
     */
    ban: async (spaceId, memberId, bannedBy, reason) => { throw new Error('Not implemented'); },

    /**
     * Leave space
     * @param {string} spaceId - Space ID
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    leave: async (spaceId, userId) => { throw new Error('Not implemented'); },

    /**
     * Invite users to space
     * @param {string} spaceId - Space ID
     * @param {Object} data - Invite data
     * @returns {Promise<Object>}
     */
    invite: async (spaceId, data) => { throw new Error('Not implemented'); },

    /**
     * Invite specific user
     * @param {string} spaceId - Space ID
     * @param {string} userId - User ID to invite
     * @param {string} inviterId - Inviter user ID
     * @returns {Promise<Object>}
     */
    inviteUser: async (spaceId, userId, inviterId) => { throw new Error('Not implemented'); },
};

/**
 * Create a Member Repository interface for implementation
 * @returns {IMemberRepository}
 */
export function createMemberRepository() {
    return { ...IMemberRepository };
}
