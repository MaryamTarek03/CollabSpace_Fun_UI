/**
 * API Member Repository
 * Implements IMemberRepository using HTTP API
 */

import { httpClient } from './httpClient.js';
import { MemberMapper } from '../../domain/mappers/index.js';

/**
 * Create a Member Repository that uses the HTTP API
 * @returns {IMemberRepository}
 */
export function createApiMemberRepository() {
    return {
        async getBySpace(spaceId) {
            const data = await httpClient.get(`/spaces/${spaceId}/members`);
            return MemberMapper.fromApiList(data);
        },

        async add(spaceId, data) {
            const result = await httpClient.post(`/spaces/${spaceId}/members`, data);
            return MemberMapper.fromApi(result);
        },

        async updateRole(spaceId, memberId, role) {
            return httpClient.put(`/spaces/${spaceId}/members/${memberId}`, { role });
        },

        async remove(spaceId, memberId) {
            return httpClient.delete(`/spaces/${spaceId}/members/${memberId}`);
        },

        async ban(spaceId, memberId, bannedBy, reason) {
            return httpClient.post(`/spaces/${spaceId}/members/${memberId}/ban`, {
                bannedBy,
                reason
            });
        },

        async leave(spaceId, userId) {
            return httpClient.post(`/spaces/${spaceId}/leave`, { userId });
        },

        async invite(spaceId, data) {
            return httpClient.post(`/spaces/${spaceId}/invite`, data);
        },

        async inviteUser(spaceId, userId, inviterId) {
            return httpClient.post(`/spaces/${spaceId}/invite-user`, { userId, inviterId });
        },
    };
}
