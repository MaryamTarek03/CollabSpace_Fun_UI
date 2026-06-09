/**
 * API Invite Repository
 * Implements IInviteRepository using HTTP API
 */

import { httpClient } from './httpClient.js';
import { InviteMapper } from '../../domain/mappers/index.js';

/**
 * Create an Invite Repository that uses the HTTP API
 * @returns {IInviteRepository}
 */
export function createApiInviteRepository() {
    return {
        async accept(inviteId) {
            return httpClient.put(`/spaces/invites/direct/${inviteId}/respond`, { accept: true });
        },

        async decline(inviteId) {
            return httpClient.put(`/spaces/invites/direct/${inviteId}/respond`, { accept: false });
        },

        async getBySpace(spaceId) {
            const data = await httpClient.get(`/spaces/${spaceId}/invites/direct`);
            const invitesList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            return InviteMapper.fromApiList(invitesList);
        },

        async getByCode(code) {
            // Real API doesn't support resolving code without joining.
            // Return a mock preview object to satisfy the UI preview flow.
            return InviteMapper.fromApi({
                id: code,
                code: code,
                space: {
                    id: code,
                    name: 'CollabSpace Space',
                    description: 'You have been invited to join this space via code.',
                    thumbnail: null,
                    memberCount: 1
                }
            });
        },

        async revoke(inviteId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const spaceId = useChatStore.getState().activeChatSpace?.id || useSpacesStore.getState().activeSpace?.id || 'default-space';
            return httpClient.delete(`/spaces/${spaceId}/invites/direct/${inviteId}`);
        },

        async getByUser(userId) {
            const data = await httpClient.get('/spaces/my-direct-invites');
            const invitesList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            return InviteMapper.fromApiList(invitesList);
        },

        async getMyJoinRequests() {
            const data = await httpClient.get('/spaces/my-join-requests');
            const requestsList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            
            const mappedRequests = await Promise.all(
                requestsList.map(async (req) => {
                    let spaceName = 'Unknown Space';
                    try {
                        const space = await httpClient.get(`/spaces/${req.spaceId}`);
                        if (space) {
                            spaceName = space.name || space.spaceName || 'Unknown Space';
                        }
                    } catch (e) {
                        console.error('Failed to fetch space name for join request:', e);
                    }
                    return {
                        ...req,
                        spaceName
                    };
                })
            );
            
            const { JoinRequestMapper } = await import('../../domain/mappers/index.js');
            return JoinRequestMapper.fromApiList(mappedRequests);
        },
    };
}
