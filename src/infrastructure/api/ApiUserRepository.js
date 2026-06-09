/**
 * API User Repository
 * Implements IUserRepository using HTTP API
 */

import { httpClient } from './httpClient.js';
import { UserMapper } from '../../domain/mappers/index.js';

/**
 * Create a User Repository that uses the HTTP API
 * @returns {IUserRepository}
 */
export function createApiUserRepository() {
    return {
        async getById(id) {
            const data = await httpClient.get(`/users/${id}`);
            return UserMapper.fromApi(data);
        },

        async update(id, data) {
            const result = await httpClient.put(`/users/${id}`, data);
            return UserMapper.fromApi(result);
        },

        async uploadAvatar(id, imageData) {
            const result = await httpClient.post(`/users/${id}/avatar`, { imageData });
            return UserMapper.fromApi(result);
        },

        async deleteAvatar(id) {
            const result = await httpClient.delete(`/users/${id}/avatar`);
            return UserMapper.fromApi(result);
        },

        async getProfile(id, viewerId) {
            return httpClient.get(`/users/${id}/profile?viewerId=${viewerId}`);
        },

        async updatePrivacy(id, data) {
            return httpClient.put(`/users/${id}/privacy`, data);
        },

        async search(query, viewerId) {
            const data = await httpClient.get(`/users/search?q=${encodeURIComponent(query)}&viewerId=${viewerId}`);
            return UserMapper.fromApiList(data);
        },

        async getFavorites(userId) {
            return httpClient.get(`/users/${userId}/favorites`);
        },

        async toggleFavorite(userId, spaceId) {
            return httpClient.post(`/users/${userId}/favorites/${spaceId}/toggle`);
        },

        async getInvites(userId) {
            return httpClient.get(`/users/${userId}/invites`);
        },

        async getSpaces(userId) {
            return httpClient.get(`/users/${userId}/spaces`);
        },
    };
}
