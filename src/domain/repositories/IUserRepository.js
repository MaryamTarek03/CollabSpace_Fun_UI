/**
 * User Repository Interface
 * Defines the contract for user operations
 */

/**
 * @interface IUserRepository
 */
export const IUserRepository = {
    /**
     * Get user by ID
     * @param {string} id - User ID
     * @returns {Promise<IUser>}
     */
    getById: async (id) => { throw new Error('Not implemented'); },

    /**
     * Update user profile
     * @param {string} id - User ID
     * @param {Object} data - Profile data to update
     * @returns {Promise<IUser>}
     */
    update: async (id, data) => { throw new Error('Not implemented'); },

    /**
     * Upload user avatar
     * @param {string} id - User ID
     * @param {string} imageData - Base64 image data
     * @returns {Promise<IUser>}
     */
    uploadAvatar: async (id, imageData) => { throw new Error('Not implemented'); },

    /**
     * Delete user avatar
     * @param {string} id - User ID
     * @returns {Promise<IUser>}
     */
    deleteAvatar: async (id) => { throw new Error('Not implemented'); },

    /**
     * Get user profile with privacy settings
     * @param {string} id - User ID
     * @param {string} viewerId - Viewer user ID
     * @returns {Promise<Object>}
     */
    getProfile: async (id, viewerId) => { throw new Error('Not implemented'); },

    /**
     * Update privacy settings
     * @param {string} id - User ID
     * @param {Object} data - Privacy settings
     * @returns {Promise<Object>}
     */
    updatePrivacy: async (id, data) => { throw new Error('Not implemented'); },

    /**
     * Search users
     * @param {string} query - Search query
     * @param {string} viewerId - Current user ID
     * @returns {Promise<Array>}
     */
    search: async (query, viewerId) => { throw new Error('Not implemented'); },

    /**
     * Get user's favorites
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    getFavorites: async (userId) => { throw new Error('Not implemented'); },

    /**
     * Toggle space favorite
     * @param {string} userId - User ID
     * @param {string} spaceId - Space ID
     * @returns {Promise<Object>}
     */
    toggleFavorite: async (userId, spaceId) => { throw new Error('Not implemented'); },
};

/**
 * Create a User Repository interface for implementation
 * @returns {IUserRepository}
 */
export function createUserRepository() {
    return { ...IUserRepository };
}
