/**
 * Chat Repository Interface
 * Defines the contract for chat/message operations
 */

/**
 * @interface IChatRepository
 */
export const IChatRepository = {
    /**
     * Get messages for a space channel
     * @param {string} spaceId - Space ID
     * @param {string} channelId - Channel ID
     * @returns {Promise<Array<IMessage>>}
     */
    getMessages: async (spaceId, channelId) => { throw new Error('Not implemented'); },

    /**
     * Send a message
     * @param {string} spaceId - Space ID
     * @param {Object} messageData - Message data
     * @returns {Promise<IMessage>}
     */
    sendMessage: async (spaceId, messageData) => { throw new Error('Not implemented'); },

    /**
     * Delete a message
     * @param {string} messageId - Message ID
     * @returns {Promise<void>}
     */
    deleteMessage: async (messageId) => { throw new Error('Not implemented'); },

    /**
     * Get channels for a space
     * @param {string} spaceId - Space ID
     * @returns {Promise<Array>}
     */
    getChannels: async (spaceId) => { throw new Error('Not implemented'); },

    /**
     * Create a channel
     * @param {string} spaceId - Space ID
     * @param {Object} channelData - Channel data
     * @returns {Promise<Object>}
     */
    createChannel: async (spaceId, channelData) => { throw new Error('Not implemented'); },

    /**
     * Delete a channel
     * @param {string} spaceId - Space ID
     * @param {string} channelId - Channel ID
     * @returns {Promise<void>}
     */
    deleteChannel: async (spaceId, channelId) => { throw new Error('Not implemented'); },
};

/**
 * Create a Chat Repository interface for implementation
 * @returns {IChatRepository}
 */
export function createChatRepository() {
    return { ...IChatRepository };
}
