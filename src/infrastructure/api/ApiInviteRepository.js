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
            return httpClient.post(`/invites/${inviteId}/accept`);
        },

        async decline(inviteId) {
            return httpClient.post(`/invites/${inviteId}/decline`);
        },

        async getBySpace(spaceId) {
            const data = await httpClient.get(`/spaces/${spaceId}/invites`);
            return InviteMapper.fromApiList(data);
        },

        async getByCode(code) {
            const data = await httpClient.get(`/invites/code/${code}`);
            return InviteMapper.fromApi(data);
        },

        async revoke(inviteId) {
            return httpClient.delete(`/invites/${inviteId}`);
        },

        async getByUser(userId) {
            const data = await httpClient.get(`/users/${userId}/invites`);
            return InviteMapper.fromApiList(data);
        },
    };
}
