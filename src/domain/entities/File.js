/**
 * File Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

/**
 * @typedef {Object} IFile
 * @property {string} id - Unique identifier
 * @property {string} spaceId - Space ID
 * @property {string} folderId - Folder ID (null for root)
 * @property {string} name - File name
 * @property {string} type - File type
 * @property {number|string} size - File size
 * @property {string} uploadedBy - Uploader user ID
 * @property {string} uploaderName - Uploader name
 * @property {string} url - File URL
 * @property {string} downloadUrl - Download URL
 * @property {string} storedFilename - Stored filename on server
 * @property {string} createdAt - Creation timestamp
 * @property {string} mimeType - MIME type
 * @property {string} time - Time display
 */

/**
 * File entity factory - creates a pure data object
 * @param {Object} data - Raw file data
 * @returns {IFile}
 */
export function createFile(data = {}) {
    return {
        id: data.id || null,
        spaceId: data.spaceId || null,
        folderId: data.folderId || null,
        name: data.name || 'Untitled',
        type: data.type || 'file',
        size: data.size || 0,
        uploadedBy: data.uploadedBy || data.user || null,
        uploaderName: data.uploaderName || data.user || 'Unknown',
        url: data.url || null,
        downloadUrl: data.downloadUrl || null,
        storedFilename: data.storedFilename || null,
        createdAt: data.createdAt || new Date().toISOString(),
        mimeType: data.mimeType || null,
        time: data.time || '',
    };
}
