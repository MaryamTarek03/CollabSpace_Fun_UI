/**
 * Space Repository Interface
 * Defines the contract for space operations
 */

/**
 * @interface ISpaceRepository
 */
export const ISpaceRepository = {
    /**
     * Get all spaces for a user
     * @param {string} userId - User ID
     * @returns {Promise<Array<ISpace>>}
     */
    getAll: async (userId) => { throw new Error('Not implemented'); },

    /**
     * Get space by ID
     * @param {string} id - Space ID
     * @returns {Promise<ISpace>}
     */
    getById: async (id) => { throw new Error('Not implemented'); },

    /**
     * Search spaces
     * @param {string} query - Search query
     * @param {string} userId - User ID
     * @returns {Promise<Array<ISpace>>}
     */
    search: async (query, userId) => { throw new Error('Not implemented'); },

    /**
     * Create a new space
     * @param {Object} data - Space data
     * @returns {Promise<ISpace>}
     */
    create: async (data) => { throw new Error('Not implemented'); },

    /**
     * Update a space
     * @param {string} id - Space ID
     * @param {Object} data - Update data
     * @returns {Promise<ISpace>}
     */
    update: async (id, data) => { throw new Error('Not implemented'); },

    /**
     * Delete a space
     * @param {string} id - Space ID
     * @returns {Promise<void>}
     */
    delete: async (id) => { throw new Error('Not implemented'); },

    /**
     * Join a space (request)
     * @param {string} spaceId - Space ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>}
     */
    join: async (spaceId, userId) => { throw new Error('Not implemented'); },

    /**
     * Get join requests for a space
     * @param {string} spaceId - Space ID
     * @returns {Promise<Array>}
     */
    getRequests: async (spaceId) => { throw new Error('Not implemented'); },

    /**
     * Approve join request
     * @param {string} spaceId - Space ID
     * @param {string} requestId - Request ID
     * @returns {Promise<void>}
     */
    approveRequest: async (spaceId, requestId) => { throw new Error('Not implemented'); },

    /**
     * Reject join request
     * @param {string} spaceId - Space ID
     * @param {string} requestId - Request ID
     * @returns {Promise<void>}
     */
    rejectRequest: async (spaceId, requestId) => { throw new Error('Not implemented'); },

    /**
     * Transfer ownership
     * @param {string} spaceId - Space ID
     * @param {string} currentOwnerId - Current owner ID
     * @param {string} newOwnerId - New owner ID
     * @returns {Promise<void>}
     */
    transferOwnership: async (spaceId, currentOwnerId, newOwnerId) => { throw new Error('Not implemented'); },

    /**
     * Upload space thumbnail
     * @param {string} spaceId - Space ID
     * @param {string} imageData - Base64 image data
     * @returns {Promise<Object>}
     */
    uploadThumbnail: async (spaceId, imageData) => { throw new Error('Not implemented'); },
};

/**
 * Create a Space Repository interface for implementation
 * @returns {ISpaceRepository}
 */
export function createSpaceRepository() {
    return { ...ISpaceRepository };
}
