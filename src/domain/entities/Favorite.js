/**
 * Favorite Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

/**
 * @typedef {Object} IFavorite
 * @property {string} id - Unique identifier
 * @property {string} userId - User ID
 * @property {string} spaceId - Favorited space ID
 * @property {string} createdAt - When favorited
 */

/**
 * Favorite entity factory - creates a pure data object
 * @param {Object} data - Raw favorite data
 * @returns {IFavorite}
 */
export function createFavorite(data = {}) {
    return {
        id: data.id || null,
        userId: data.userId || null,
        spaceId: data.spaceId || null,
        createdAt: data.createdAt || new Date().toISOString(),
    };
}
