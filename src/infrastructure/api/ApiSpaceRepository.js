/**
 * API Space Repository
 * Implements ISpaceRepository using HTTP API
 */

import { httpClient } from './httpClient.js';
import { SpaceMapper } from '../../domain/mappers/index.js';

/**
 * Create a Space Repository that uses the HTTP API
 * @returns {ISpaceRepository}
 */
export function createApiSpaceRepository() {
    return {
        async getAll(userId) {
            const data = await httpClient.get(`/spaces${userId ? `?userId=${userId}` : ''}`);
            return SpaceMapper.fromApiList(data);
        },

        async getById(id) {
            const data = await httpClient.get(`/spaces/${id}`);
            return SpaceMapper.fromApi(data);
        },

        async search(query, userId) {
            const data = await httpClient.get(`/spaces/search?q=${encodeURIComponent(query)}&userId=${userId}`);
            return SpaceMapper.fromApiList(data);
        },

        async create(data) {
            const result = await httpClient.post('/spaces', data);
            return SpaceMapper.fromApi(result);
        },

        async update(id, data) {
            const result = await httpClient.put(`/spaces/${id}`, data);
            return SpaceMapper.fromApi(result);
        },

        async delete(id) {
            return httpClient.delete(`/spaces/${id}`);
        },

        async join(spaceId, userId) {
            return httpClient.post(`/spaces/${spaceId}/join`, { userId });
        },

        async getRequests(spaceId) {
            return httpClient.get(`/spaces/${spaceId}/requests`);
        },

        async approveRequest(spaceId, requestId) {
            return httpClient.post(`/spaces/${spaceId}/requests/${requestId}/approve`);
        },

        async rejectRequest(spaceId, requestId) {
            return httpClient.post(`/spaces/${spaceId}/requests/${requestId}/reject`);
        },

        async transferOwnership(spaceId, currentOwnerId, newOwnerId) {
            return httpClient.post(`/spaces/${spaceId}/transfer-ownership`, {
                currentOwnerId,
                newOwnerId
            });
        },

        async uploadThumbnail(spaceId, imageData) {
            return httpClient.post(`/spaces/${spaceId}/thumbnail`, { imageData });
        },

        async getBans(spaceId) {
            return httpClient.get(`/spaces/${spaceId}/bans`);
        },

        async unban(spaceId, banId) {
            return httpClient.delete(`/spaces/${spaceId}/bans/${banId}`);
        },
    };
}
