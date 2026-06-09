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
            const data = await httpClient.get(`/spaces/${spaceId}/channels/${channelId}/messages`);
            const messagesList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            const reversed = [...messagesList].reverse();
            return MessageMapper.fromApiList(reversed);
        },

        async sendMessage(spaceId, messageData) {
            const channelId = messageData.channelId || 'general';
            const body = {
                text: messageData.text || messageData.content || '',
                parentId: messageData.parentId || null,
                attachmentFileIds: messageData.attachmentFileIds || [],
                attachmentUrls: messageData.attachmentUrls || []
            };
            const result = await httpClient.post(`/spaces/${spaceId}/channels/${channelId}/messages`, body);
            return MessageMapper.fromApi(result);
        },

        async deleteMessage(messageId, senderId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const spaceId = useChatStore.getState().activeChatSpace?.id || useSpacesStore.getState().activeSpace?.id || 'default';
            const channelId = useChatStore.getState().activeChannel?.id || 'default';
            return httpClient.delete(`/spaces/${spaceId}/channels/${channelId}/messages/${messageId}`);
        },

        async updateMessage(messageId, text, senderId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const spaceId = useChatStore.getState().activeChatSpace?.id || useSpacesStore.getState().activeSpace?.id || 'default';
            const channelId = useChatStore.getState().activeChannel?.id || 'default';
            const body = { text };
            const result = await httpClient.put(`/spaces/${spaceId}/channels/${channelId}/messages/${messageId}`, body);
            return MessageMapper.fromApi(result);
        },

        async forwardMessage(messageId, targetChannelId, senderId, spaceId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const currentSpaceId = spaceId || useChatStore.getState().activeChatSpace?.id || useSpacesStore.getState().activeSpace?.id || 'default';
            const sourceChannelId = useChatStore.getState().activeChannel?.id || 'default';
            return httpClient.post(`/spaces/${currentSpaceId}/channels/${sourceChannelId}/messages/${messageId}/forward`, {
                targetChannelId
            });
        },

        async getChannels(spaceId) {
            const data = await httpClient.get(`/spaces/${spaceId}/channels`);
            const channelsList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            return ChannelMapper.fromApiList(channelsList);
        },

        async createChannel(spaceId, channelData) {
            const body = {
                name: channelData.name || '',
                description: channelData.description || ''
            };
            const result = await httpClient.post(`/spaces/${spaceId}/channels`, body);
            return ChannelMapper.fromApi(result);
        },

        async updateChannel(channelId, data) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const spaceId = useChatStore.getState().activeChatSpace?.id || useSpacesStore.getState().activeSpace?.id || 'default';
            const body = {
                name: data.name || '',
                description: data.description || ''
            };
            return httpClient.put(`/spaces/${spaceId}/channels/${channelId}`, body);
        },

        async deleteChannel(channelId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const spaceId = useChatStore.getState().activeChatSpace?.id || useSpacesStore.getState().activeSpace?.id || 'default';
            return httpClient.delete(`/spaces/${spaceId}/channels/${channelId}`);
        },
    };
}
