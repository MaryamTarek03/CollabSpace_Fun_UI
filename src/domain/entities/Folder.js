/**
 * Folder Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

/**
 * @typedef {Object} IFolder
 * @property {string} id - Unique identifier
 * @property {string} spaceId - Space ID
 * @property {string} parentId - Parent folder ID (null for root)
 * @property {string} name - Folder name
 * @property {string} createdBy - Creator user ID
 * @property {string} createdAt - Creation timestamp
 * @property {string} time - Time display
 */

/**
 * Folder entity factory - creates a pure data object
 * @param {Object} data - Raw folder data
 * @returns {IFolder}
 */
export function createFolder(data = {}) {
    return {
        id: data.id || null,
        spaceId: data.spaceId || null,
        parentId: data.parentId || null,
        name: data.name || 'New Folder',
        createdBy: data.createdBy || null,
        createdAt: data.createdAt || new Date().toISOString(),
        time: data.time || '',
    };
}
