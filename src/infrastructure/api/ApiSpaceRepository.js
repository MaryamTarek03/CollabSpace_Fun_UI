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
            const data = await httpClient.get('/spaces');
            const spacesList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            return SpaceMapper.fromApiList(spacesList);
        },

        async getById(id) {
            const data = await httpClient.get(`/spaces/${id}`);
            return SpaceMapper.fromApi(data);
        },

        async search(query, userId) {
            const data = await httpClient.get(`/spaces/public?q=${encodeURIComponent(query)}`);
            const spacesList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            return SpaceMapper.fromApiList(spacesList);
        },

        async create(data) {
            const formData = new FormData();
            formData.append('Name', data.name || '');
            formData.append('Description', data.description || '');
            
            const code = data.code || Math.random().toString(36).substring(2, 5).toUpperCase();
            formData.append('Code', code);
            
            let hexColor = data.thumbnailColor || data.thumbnail || '';
            if (hexColor.startsWith('linear-gradient')) {
                const match = hexColor.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
                hexColor = match ? match[0] : '';
            }
            if (hexColor) {
                formData.append('ThumbnailColor', hexColor);
            }
            
            const spaceTypeStr = data.spaceType || data.templateId || data.template || '1';
            const matchedDigits = String(spaceTypeStr).match(/\d+/);
            const spaceType = matchedDigits ? parseInt(matchedDigits[0], 10) : 1;
            formData.append('SpaceType', spaceType);
            
            if (data.thumbnailImage) {
                formData.append('ThumbnailImage', data.thumbnailImage);
            }

            const result = await httpClient.post('/spaces', formData);
            return SpaceMapper.fromApi(result);
        },

        async update(id, data) {
            if (data.name !== undefined || data.description !== undefined) {
                const infoBody = {
                    name: data.name || '',
                    description: data.description || ''
                };
                await httpClient.patch(`/spaces/${id}/info`, infoBody);
            }
            
            let privacyValue = null;
            if (data.visibility !== undefined) {
                privacyValue = data.visibility.toLowerCase() === 'public' ? 'Public' : 'Private';
            } else if (data.privacy !== undefined) {
                privacyValue = data.privacy.toLowerCase() === 'public' ? 'Public' : 'Private';
            } else if (data.isPrivate !== undefined || data.private !== undefined) {
                const isPrivate = data.isPrivate !== undefined ? data.isPrivate : data.private;
                privacyValue = isPrivate ? 'Private' : 'Public';
            }

            if (privacyValue !== null) {
                const privacyBody = {
                    privacy: privacyValue
                };
                await httpClient.patch(`/spaces/${id}/privacy`, privacyBody);
            }

            if (data.thumbnail !== undefined) {
                const isGradient = data.thumbnail.startsWith('linear-gradient');
                const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                const isHex = hexRegex.test(data.thumbnail);
                
                if (isGradient || isHex) {
                    let hexColor = data.thumbnail;
                    if (isGradient) {
                        const match = data.thumbnail.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
                        hexColor = match ? match[0] : '#667eea';
                    }
                    const emptyFormData = new FormData();
                    await httpClient.patch(`/spaces/${id}/thumbnail?color=${encodeURIComponent(hexColor)}`, emptyFormData);
                }
            }

            const updatedSpace = await httpClient.get(`/spaces/${id}`);
            return SpaceMapper.fromApi(updatedSpace);
        },

        async delete(id) {
            return httpClient.delete(`/spaces/${id}`);
        },

        async join(spaceId, userId) {
            return httpClient.post(`/spaces/${spaceId}/invites/join-requests`, {});
        },

        async getRequests(spaceId) {
            const data = await httpClient.get(`/spaces/${spaceId}/invites/join-requests`);
            return data && data.data ? data.data : (Array.isArray(data) ? data : []);
        },

        async approveRequest(spaceId, requestId) {
            return httpClient.put(`/spaces/${spaceId}/invites/join-requests/${requestId}/respond`, { accept: true });
        },

        async rejectRequest(spaceId, requestId) {
            return httpClient.put(`/spaces/${spaceId}/invites/join-requests/${requestId}/respond`, { accept: false });
        },

        async transferOwnership(spaceId, currentOwnerId, newOwnerId) {
            return httpClient.put(`/spaces/${spaceId}/ownership/transfer`, {
                newOwnerId
            });
        },

        async uploadThumbnail(spaceId, imageData) {
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
            formData.append('image', blob, 'thumbnail.png');

            await httpClient.patch(`/spaces/${spaceId}/thumbnail`, formData);
            const updated = await httpClient.get(`/spaces/${spaceId}`);
            return SpaceMapper.fromApi(updated);
        },

        async getBans(spaceId) {
            const data = await httpClient.get(`/spaces/${spaceId}/bans`);
            return data && data.data ? data.data : (Array.isArray(data) ? data : []);
        },

        async unban(spaceId, banId) {
            return httpClient.delete(`/spaces/${spaceId}/bans/${banId}`);
        },
    };
}
