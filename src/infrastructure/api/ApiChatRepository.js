/**
 * API Chat Repository
 * Implements IChatRepository using HTTP API
 */

import { httpClient } from './httpClient.js';
import { MessageMapper, ChannelMapper } from '../../domain/mappers/index.js';

/**
 * Create a Chat Repository that uses the HTTP API
 * @returns {IChatRepository}
 */
export function createApiChatRepository() {
    return {
        async getMessages(spaceId, channelId) {
            const data = await httpClient.get(`/messages/${channelId}`);
            return MessageMapper.fromApiList(data);
        },

        async sendMessage(spaceId, messageData) {
            const channelId = messageData.channelId || 'general';
            const result = await httpClient.post(`/messages/${channelId}`, messageData);
            return MessageMapper.fromApi(result);
        },

        async deleteMessage(messageId, senderId) {
            return httpClient.delete(`/messages/${messageId}`, { senderId });
        },

        async updateMessage(messageId, text, senderId) {
            const result = await httpClient.put(`/messages/${messageId}`, { text, senderId });
            return MessageMapper.fromApi(result);
        },

        async forwardMessage(messageId, targetChannelId, senderId, spaceId) {
            return httpClient.post(`/messages/${messageId}/forward`, {
                targetChannelId,
                senderId,
                spaceId
            });
        },

        async getChannels(spaceId) {
            const data = await httpClient.get(`/channels/${spaceId}`);
            return ChannelMapper.fromApiList(data);
        },

        async createChannel(spaceId, channelData) {
            const result = await httpClient.post(`/channels/${spaceId}`, channelData);
            return ChannelMapper.fromApi(result);
        },

        async updateChannel(channelId, data) {
            return httpClient.put(`/channels/${channelId}`, data);
        },

        async deleteChannel(channelId) {
            return httpClient.delete(`/channels/${channelId}`);
        },
    };
}
