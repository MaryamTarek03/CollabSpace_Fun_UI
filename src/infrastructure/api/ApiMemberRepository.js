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
            const membersList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            return MemberMapper.fromApiList(membersList);
        },

        async add(spaceId, data) {
            const memberId = data.id || data.userId;
            const result = await httpClient.post(`/dev/spaces/${spaceId}/members/${memberId}`);
            return MemberMapper.fromApi(result);
        },

        async updateRole(spaceId, memberId, role) {
            return httpClient.put(`/spaces/${spaceId}/members/${memberId}/role`, { role });
        },

        async remove(spaceId, memberId) {
            return httpClient.delete(`/spaces/${spaceId}/members/${memberId}`);
        },

        async ban(spaceId, memberId, bannedBy, reason) {
            return httpClient.post(`/spaces/${spaceId}/bans`, {
                userId: memberId,
                reason: reason || ''
            });
        },

        async leave(spaceId, userId) {
            return httpClient.delete(`/spaces/${spaceId}/leave`);
        },

        async invite(spaceId, data) {
            const invitedUsers = data.invitedUsers || data.emails || (data.userId ? [data.userId] : (data.email ? [data.email] : []));
            return httpClient.post(`/spaces/${spaceId}/invites/direct`, { invitedUsers });
        },

        async inviteUser(spaceId, identifier, inviterId) {
            return httpClient.post(`/spaces/${spaceId}/invites/direct`, {
                invitedUsers: [identifier]
            });
        },
    };
}
