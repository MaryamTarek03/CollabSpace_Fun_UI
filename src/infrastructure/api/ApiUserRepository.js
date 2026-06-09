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
            const endpoint = id === 'me' ? '/profile/me' : `/profile/${id}`;
            const data = await httpClient.get(endpoint);
            return UserMapper.fromApi(data);
        },

        async update(id, data) {
            const body = {
                displayName: data.displayName || data.name || '',
                bio: data.bio || ''
            };
            const result = await httpClient.patch('/profile/me', body);
            return UserMapper.fromApi(result);
        },

        async uploadAvatar(id, imageData) {
            // Helper to convert base64 data url to a binary Blob
            function dataURLtoBlob(dataurl) {
                const arr = dataurl.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], { type: mime });
            }

            const blob = dataURLtoBlob(imageData);
            const formData = new FormData();
            formData.append('file', blob, 'avatar.png');

            const result = await httpClient.patch('/profile/avatar', formData);
            return UserMapper.fromApi(result);
        },

        async deleteAvatar(id) {
            const result = await httpClient.delete('/profile/avatar');
            return UserMapper.fromApi(result);
        },

        async getProfile(id, viewerId) {
            try {
                const endpoint = id === 'me' || id === viewerId ? '/profile/me' : `/profile/${id}`;
                const result = await httpClient.get(endpoint);
                return UserMapper.fromApi(result);
            } catch (err) {
                if (err.data && (err.data.id || err.data.username)) {
                    return UserMapper.fromApi(err.data);
                }
                throw err;
            }
        },

        async getSharedSpaces(id, viewerId) {
            try {
                const data = await httpClient.get('/spaces');
                const spacesList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
                return spacesList.filter(space => {
                    const memberIds = space.members?.map(m => m.userId || m.id) || [];
                    return memberIds.includes(id) && memberIds.includes(viewerId);
                });
            } catch (err) {
                console.error('getSharedSpaces error:', err);
                return [];
            }
        },

        async updatePrivacy(id, data) {
            const body = {
                isPrivate: typeof data.isPrivate === 'boolean' ? data.isPrivate : !!data.private
            };
            return httpClient.patch('/profile/privacy', body);
        },

        async search(query, viewerId) {
            const data = await httpClient.get(`/profile?q=${encodeURIComponent(query)}`);
            const profiles = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            return UserMapper.fromApiList(profiles);
        },

        async getFavorites(userId) {
            const data = await httpClient.get('/spaces/favorites');
            const spacesList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            return spacesList.map(s => s.id);
        },

        async toggleFavorite(userId, spaceId) {
            return httpClient.post(`/spaces/${spaceId}/favorite`);
        },

        async getInvites(userId) {
            const data = await httpClient.get('/spaces/my-direct-invites');
            return data && data.data ? data.data : (Array.isArray(data) ? data : []);
        },

        async getSpaces(userId) {
            const data = await httpClient.get('/spaces');
            return data && data.data ? data.data : (Array.isArray(data) ? data : []);
        },
    };
}
