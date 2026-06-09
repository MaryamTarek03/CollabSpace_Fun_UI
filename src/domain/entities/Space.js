/**
 * Space Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

/**
 * @typedef {Object} ISpace
 * @property {string} id - Unique identifier
 * @property {string} name - Space name
 * @property {string} description - Space description
 * @property {string} category - Space category
 * @property {string} ownerId - Owner user ID
 * @property {string} thumbnail - Thumbnail URL or gradient
 * @property {string} thumbnailPosition - Thumbnail position
 * @property {string} visibility - 'public' or 'private'
 * @property {boolean} isOnline - Online status
 * @property {number} requestsCount - Pending join requests count
 * @property {string} createdAt - Creation timestamp
 * @property {Array} members - Space members (populated separately)
 * @property {Array} files - Space files (populated separately)
 */

/**
 * Space entity factory - creates a pure data object
 * @param {Object} data - Raw space data
 * @returns {ISpace}
 */
export function createSpace(data = {}) {
    return {
        id: data.id || null,
        name: data.name || '',
        description: data.description || '',
        category: data.category || data.type || 'General',
        ownerId: data.ownerId || null,
        thumbnail: data.thumbnail || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        thumbnailPosition: data.thumbnailPosition || data.thumbnailposition || '50% 50%',
        visibility: data.visibility || 'public',
        isOnline: data.isOnline ?? false,
        requestsCount: data.requestsCount || 0,
        createdAt: data.createdAt || null,
        members: data.members || [],  // Pre-mapped or empty
        files: data.files || [],      // Pre-mapped or empty

        // Computed properties
        get memberCount() {
            return this.members?.length || 0;
        },
        get isPrivate() {
            return this.visibility === 'private';
        }
    };
}
