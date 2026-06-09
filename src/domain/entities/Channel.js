/**
 * Channel Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

/**
 * @typedef {Object} IChannel
 * @property {string} id - Unique identifier
 * @property {string} spaceId - Space ID
 * @property {string} name - Channel name
 * @property {string} description - Channel description
 * @property {string} createdBy - Creator user ID
 * @property {string} createdAt - Creation timestamp
 * @property {boolean} isDefault - Whether this is the default channel
 * @property {string} time - Time display
 */

/**
 * Channel entity factory - creates a pure data object
 * @param {Object} data - Raw channel data
 * @returns {IChannel}
 */
export function createChannel(data = {}) {
    return {
        id: data.id || null,
        spaceId: data.spaceId || null,
        name: data.name || 'general',
        description: data.description || '',
        createdBy: data.createdBy || null,
        createdAt: data.createdAt || new Date().toISOString(),
        isDefault: data.isDefault ?? (data.name === 'general'),
        time: data.time || '',
    };
}
