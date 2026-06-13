// api.js - Legacy API adapter delegating to Clean Architecture Repositories
import { createApiAuthRepository } from '../infrastructure/api/ApiAuthRepository.js';
import { createApiUserRepository } from '../infrastructure/api/ApiUserRepository.js';
import { createApiSpaceRepository } from '../infrastructure/api/ApiSpaceRepository.js';
import { createApiMemberRepository } from '../infrastructure/api/ApiMemberRepository.js';
import { createApiInviteRepository } from '../infrastructure/api/ApiInviteRepository.js';
import { createApiChatRepository } from '../infrastructure/api/ApiChatRepository.js';
import { createApiFileRepository } from '../infrastructure/api/ApiFileRepository.js';
import { createApiNotificationRepository } from '../infrastructure/api/ApiNotificationRepository.js';
import { httpClient } from '../infrastructure/api/httpClient.js';

const authRepo = createApiAuthRepository();
const userRepo = createApiUserRepository();
const spaceRepo = createApiSpaceRepository();
const memberRepo = createApiMemberRepository();
const inviteRepo = createApiInviteRepository();
const chatRepo = createApiChatRepository();
const fileRepo = createApiFileRepository();
const notificationRepo = createApiNotificationRepository();

// ============ AUTH ============
export const auth = {
    register: (data) => authRepo.register(data),
    login: (data) => authRepo.login(data),
};

// ============ USERS ============
export const users = {
    getAll: () => userRepo.getAll(),
    getById: (id) => userRepo.getById(id),
    update: (id, data) => userRepo.update(id, data),
    delete: (id) => userRepo.delete(id),
    uploadAvatar: (id, imageData) => userRepo.uploadAvatar(id, imageData),
    deleteAvatar: (id) => userRepo.deleteAvatar(id),
    getSpaces: (userId) => userRepo.getSpaces(userId),
    getInvites: (userId) => inviteRepo.getByUser(userId),
    getProfile: (id, viewerId) => userRepo.getProfile(id, viewerId),
    updatePrivacy: (id, data) => userRepo.updatePrivacy(id, data),
    getSharedSpaces: (id, viewerId) => userRepo.getSharedSpaces(id, viewerId),
    search: (query, viewerId) => userRepo.search(query, viewerId),
    getFavorites: (userId) => userRepo.getFavorites(userId),
    addFavorite: (userId, spaceId) => userRepo.addFavorite(userId, spaceId),
    removeFavorite: (userId, spaceId) => userRepo.removeFavorite(userId, spaceId),
    toggleFavorite: (userId, spaceId) => userRepo.toggleFavorite(userId, spaceId),
};

// ============ SPACES ============
export const spaces = {
    getAll: (userId) => spaceRepo.getAll(userId),
    search: (query, userId) => spaceRepo.search(query, userId),
    getById: (id) => spaceRepo.getById(id),
    create: (data) => spaceRepo.create(data),
    update: (id, data) => spaceRepo.update(id, data),
    delete: (id) => spaceRepo.delete(id),
    join: (spaceId, userId, message) => spaceRepo.join(spaceId, userId, message),
    getRequests: (spaceId) => spaceRepo.getRequests(spaceId),
    approveRequest: (spaceId, requestId) => spaceRepo.approveRequest(spaceId, requestId),
    rejectRequest: (spaceId, requestId) => spaceRepo.rejectRequest(spaceId, requestId),
    transferOwnership: (spaceId, currentOwnerId, newOwnerId) => spaceRepo.transferOwnership(spaceId, currentOwnerId, newOwnerId),
    uploadThumbnail: (spaceId, imageData) => spaceRepo.uploadThumbnail(spaceId, imageData),
    getBans: (spaceId) => spaceRepo.getBans(spaceId),
    unban: (spaceId, banId) => spaceRepo.unban(spaceId, banId),
};

// ============ SPACE MEMBERS ============
export const members = {
    getBySpace: (spaceId) => memberRepo.getBySpace(spaceId),
    add: (spaceId, data) => memberRepo.add(spaceId, data),
    updateRole: (spaceId, memberId, role) => memberRepo.updateRole(spaceId, memberId, role),
    remove: (spaceId, memberId) => memberRepo.remove(spaceId, memberId),
    ban: (spaceId, memberId, bannedBy, reason) => memberRepo.ban(spaceId, memberId, bannedBy, reason),
    leave: (spaceId, userId) => memberRepo.leave(spaceId, userId),
    invite: (spaceId, data) => memberRepo.invite(spaceId, data),
    inviteUser: (spaceId, identifier, inviterId) => memberRepo.inviteUser(spaceId, identifier, inviterId),
};

// ============ INVITES ============
export const invites = {
    accept: (inviteId) => inviteRepo.accept(inviteId),
    decline: (inviteId) => inviteRepo.decline(inviteId),
    getBySpace: (spaceId) => inviteRepo.getBySpace(spaceId),
    getByCode: (code) => inviteRepo.getByCode(code),
    revoke: (inviteId) => inviteRepo.revoke(inviteId),
    getByUser: (userId) => inviteRepo.getByUser(userId),
};

export const requests = {
    cancel: (spaceId, requestId) => spaceRepo.rejectRequest(spaceId, requestId),
    getMy: (userId) => inviteRepo.getMyJoinRequests(),
    cancelMy: (spaceId, requestId) => spaceRepo.cancelMyJoinRequest(spaceId, requestId),
};

// ============ NOTIFICATIONS ============
export const notifications = {
    getAll: (userId) => notificationRepo.getByUser(userId),
    create: (data) => notificationRepo.create(data),
    markRead: (id) => notificationRepo.markRead(id),
    markAllRead: () => notificationRepo.markAllRead(),
};

// ============ CHANNELS ============
export const channels = {
    getBySpace: (spaceId) => chatRepo.getChannels(spaceId),
    create: (spaceId, data) => chatRepo.createChannel(spaceId, data),
    update: (channelId, data) => chatRepo.updateChannel(channelId, data),
    delete: (channelId) => chatRepo.deleteChannel(channelId),
};

// ============ MESSAGES ============
export const messages = {
    getByChannel: (channelId) => {
        // Retrieve dynamic active space ID from stores if available
        const spaceId = window.__activeSpaceId || 'default';
        return chatRepo.getMessages(spaceId, channelId);
    },
    send: (channelId, data) => {
        const spaceId = window.__activeSpaceId || 'default';
        return chatRepo.sendMessage(spaceId, { ...data, channelId });
    },
    update: (id, text, senderId) => chatRepo.updateMessage(id, text, senderId),
    delete: (id, senderId) => chatRepo.deleteMessage(id, senderId),
    forward: (messageId, targetChannelId, senderId, spaceId) => chatRepo.forwardMessage(messageId, targetChannelId, senderId, spaceId),
};

// ============ FOLDERS ============
export const folders = {
    getBySpace: (spaceId, parentId) => fileRepo.getFolders(spaceId, parentId),
    getById: (folderId, spaceId) => fileRepo.getFolder(folderId, spaceId),
    create: (spaceId, data) => fileRepo.createFolder(spaceId, data),
    update: (folderId, name, spaceId) => fileRepo.updateFolder(folderId, name, spaceId),
    delete: (folderId, spaceId) => fileRepo.deleteFolder(folderId, spaceId),
};

// ============ FILES ============
export const files = {
    getBySpace: (spaceId, folderId) => fileRepo.getBySpace(spaceId, folderId),
    rename: (fileId, name, userId, spaceId) => fileRepo.rename(fileId, name, userId, spaceId),
    upload: (spaceId, file, uploadedBy, onProgress, folderId) => fileRepo.upload(spaceId, file, uploadedBy, onProgress, folderId),
    download: (fileId, spaceId) => fileRepo.download(fileId, spaceId),
    getDownloadUrl: (fileId, spaceId) => fileRepo.getDownloadUrl(fileId, spaceId),
    delete: (fileId, userId, spaceId) => fileRepo.delete(fileId, userId, spaceId),
    move: (fileIds, folderId, userId, spaceId) => fileRepo.move(fileIds, folderId, userId, spaceId),
    copy: (fileIds, folderId, userId, spaceId) => fileRepo.copy(fileIds, folderId, userId, spaceId),
    createLink: (spaceId, name, url, uploadedBy, folderId) => fileRepo.createLink(spaceId, name, url, uploadedBy, folderId),
    getRecent: (spaceId, limit) => fileRepo.getRecent(spaceId, limit),
};

// ============ ROLES ============
export const roles = {
    getAll: (spaceId) => httpClient.get(`/spaces/${spaceId}/roles`),
    create: (spaceId, data) => httpClient.post(`/spaces/${spaceId}/roles`, data),
    update: (spaceId, roleId, data) => httpClient.put(`/spaces/${spaceId}/roles/${roleId}`, data),
    delete: (spaceId, roleId) => httpClient.delete(`/spaces/${spaceId}/roles/${roleId}`),
    getAvailablePermissions: () => httpClient.get('/spaces/permissions'),
    assignCustomRole: (spaceId, memberId, roleId) => httpClient.post(`/spaces/${spaceId}/members/${memberId}/roles/${roleId}`),
    removeCustomRole: (spaceId, memberId, roleId) => httpClient.delete(`/spaces/${spaceId}/members/${memberId}/roles/${roleId}`),
};

// Export grouped API
const api = {
    auth,
    users,
    spaces,
    members,
    invites,
    requests,
    notifications,
    channels,
    messages,
    folders,
    files,
    roles,
    // Generic request methods
    get: (endpoint) => {
        if (endpoint.startsWith('/invite/')) {
            const code = endpoint.replace('/invite/', '');
            return inviteRepo.getByCode(code);
        }
        return httpClient.get(endpoint);
    },
    post: (endpoint, body) => {
        if (endpoint.startsWith('/invite/') && endpoint.endsWith('/join')) {
            const code = endpoint.replace('/invite/', '').replace('/join', '');
            return httpClient.post(`/spaces/join-via-code/${code}`);
        }
        return httpClient.post(endpoint, body);
    },
    put: (endpoint, body) => httpClient.put(endpoint, body),
    delete: (endpoint, body) => httpClient.delete(endpoint, body),
};

export default api;
