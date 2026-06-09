/**
 * File Repository Interface
 * Defines the contract for file operations
 */

/**
 * @interface IFileRepository
 */
export const IFileRepository = {
    /**
     * Get files for a space
     * @param {string} spaceId - Space ID
     * @param {string|null} folderId - Folder ID (null for root)
     * @returns {Promise<Array<IFile>>}
     */
    getBySpace: async (spaceId, folderId) => { throw new Error('Not implemented'); },

    /**
     * Upload a file
     * @param {string} spaceId - Space ID
     * @param {Object} fileData - File data with content
     * @returns {Promise<IFile>}
     */
    upload: async (spaceId, fileData) => { throw new Error('Not implemented'); },

    /**
     * Delete a file
     * @param {string} fileId - File ID
     * @param {string} userId - User ID (for permission check)
     * @returns {Promise<void>}
     */
    delete: async (fileId, userId) => { throw new Error('Not implemented'); },

    /**
     * Rename a file
     * @param {string} fileId - File ID
     * @param {string} name - New name
     * @param {string} userId - User ID
     * @returns {Promise<Object>}
     */
    rename: async (fileId, name, userId) => { throw new Error('Not implemented'); },

    /**
     * Move files to folder
     * @param {Array<string>} fileIds - File IDs
     * @param {string|null} folderId - Target folder ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>}
     */
    move: async (fileIds, folderId, userId) => { throw new Error('Not implemented'); },

    /**
     * Create folder
     * @param {string} spaceId - Space ID
     * @param {Object} folderData - Folder data
     * @returns {Promise<Object>}
     */
    createFolder: async (spaceId, folderData) => { throw new Error('Not implemented'); },

    /**
     * Delete folder
     * @param {string} folderId - Folder ID
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    deleteFolder: async (folderId, userId) => { throw new Error('Not implemented'); },
};

/**
 * Create a File Repository interface for implementation
 * @returns {IFileRepository}
 */
export function createFileRepository() {
    return { ...IFileRepository };
}
