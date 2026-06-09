/**
 * Dependency Injection Container
 * Composition root - creates and wires all dependencies
 * 
 * This follows the Factory pattern and enables the Dependency Inversion Principle:
 * - High-level modules (stores) depend on abstractions (services)
 * - Low-level modules (API repositories) implement those abstractions
 * - This container wires them together
 */

import {
    createApiAuthRepository,
    createApiUserRepository,
    createApiSpaceRepository,
    createApiMemberRepository,
    createApiChatRepository,
    createApiFileRepository,
    createApiNotificationRepository,
    createApiInviteRepository,
} from '../api/index.js';

// Singleton instances cache
let container = null;

/**
 * Create the DI container with all services
 * Uses lazy initialization for better performance
 * @returns {Object} Container with all services
 */
export function createContainer() {
    if (container) return container;

    // Create repository instances (adapters)
    const repositories = {
        auth: createApiAuthRepository(),
        user: createApiUserRepository(),
        space: createApiSpaceRepository(),
        member: createApiMemberRepository(),
        chat: createApiChatRepository(),
        file: createApiFileRepository(),
        notification: createApiNotificationRepository(),
        invite: createApiInviteRepository(),
    };

    // Create services (use cases layer) that wrap repositories
    // Services add business logic and orchestrate repository calls
    const services = {
        auth: createAuthService(repositories.auth),
        user: createUserService(repositories.user),
        space: createSpaceService(repositories.space, repositories.member),
        member: createMemberService(repositories.member),
        chat: createChatService(repositories.chat),
        file: createFileService(repositories.file),
        notification: createNotificationService(repositories.notification),
        invite: createInviteService(repositories.invite),
    };

    container = {
        repositories,
        services,

        // Convenience getters
        getService: (name) => services[name],
        getRepository: (name) => repositories[name],
    };

    return container;
}

/**
 * Get the container singleton
 * @returns {Object}
 */
export function getContainer() {
    if (!container) {
        container = createContainer();
    }
    return container;
}

/**
 * Reset container (useful for testing)
 */
export function resetContainer() {
    container = null;
}

// ============ SERVICE FACTORIES ============

function createAuthService(authRepo) {
    return {
        async login(identifier, password) {
            return authRepo.login({ identifier, password });
        },

        async register(userData) {
            return authRepo.register(userData);
        },

        getOAuthUrl(provider) {
            return authRepo.getOAuthUrl(provider);
        },
    };
}

function createUserService(userRepo) {
    return {
        getById: (id) => userRepo.getById(id),
        update: (id, data) => userRepo.update(id, data),
        uploadAvatar: (id, imageData) => userRepo.uploadAvatar(id, imageData),
        deleteAvatar: (id) => userRepo.deleteAvatar(id),
        getProfile: (id, viewerId) => userRepo.getProfile(id, viewerId),
        updatePrivacy: (id, data) => userRepo.updatePrivacy(id, data),
        search: (query, viewerId) => userRepo.search(query, viewerId),
        getFavorites: (userId) => userRepo.getFavorites(userId),
        toggleFavorite: (userId, spaceId) => userRepo.toggleFavorite(userId, spaceId),
        getInvites: (userId) => userRepo.getInvites(userId),
    };
}

function createSpaceService(spaceRepo, memberRepo) {
    return {
        getAll: (userId) => spaceRepo.getAll(userId),
        getById: (id) => spaceRepo.getById(id),
        search: (query, userId) => spaceRepo.search(query, userId),
        create: (data) => spaceRepo.create(data),
        update: (id, data) => spaceRepo.update(id, data),
        delete: (id) => spaceRepo.delete(id),
        join: (spaceId, userId) => spaceRepo.join(spaceId, userId),
        getRequests: (spaceId) => spaceRepo.getRequests(spaceId),
        approveRequest: (spaceId, requestId) => spaceRepo.approveRequest(spaceId, requestId),
        rejectRequest: (spaceId, requestId) => spaceRepo.rejectRequest(spaceId, requestId),
        transferOwnership: (spaceId, currentOwnerId, newOwnerId) =>
            spaceRepo.transferOwnership(spaceId, currentOwnerId, newOwnerId),
        uploadThumbnail: (spaceId, imageData) => spaceRepo.uploadThumbnail(spaceId, imageData),
        getBans: (spaceId) => spaceRepo.getBans(spaceId),
        unban: (spaceId, banId) => spaceRepo.unban(spaceId, banId),

        // Combined operations that need both repos
        async getSpaceWithMembers(spaceId) {
            const [space, members] = await Promise.all([
                spaceRepo.getById(spaceId),
                memberRepo.getBySpace(spaceId)
            ]);
            return { ...space, members };
        },
    };
}

function createMemberService(memberRepo) {
    return {
        getBySpace: (spaceId) => memberRepo.getBySpace(spaceId),
        add: (spaceId, data) => memberRepo.add(spaceId, data),
        updateRole: (spaceId, memberId, role) => memberRepo.updateRole(spaceId, memberId, role),
        remove: (spaceId, memberId) => memberRepo.remove(spaceId, memberId),
        ban: (spaceId, memberId, bannedBy, reason) => memberRepo.ban(spaceId, memberId, bannedBy, reason),
        leave: (spaceId, userId) => memberRepo.leave(spaceId, userId),
        invite: (spaceId, data) => memberRepo.invite(spaceId, data),
        inviteUser: (spaceId, userId, inviterId) => memberRepo.inviteUser(spaceId, userId, inviterId),
    };
}

function createChatService(chatRepo) {
    return {
        getMessages: (spaceId, channelId) => chatRepo.getMessages(spaceId, channelId),
        sendMessage: (spaceId, messageData) => chatRepo.sendMessage(spaceId, messageData),
        deleteMessage: (messageId, senderId) => chatRepo.deleteMessage(messageId, senderId),
        updateMessage: (messageId, text, senderId) => chatRepo.updateMessage(messageId, text, senderId),
        forwardMessage: (messageId, targetChannelId, senderId, spaceId) =>
            chatRepo.forwardMessage(messageId, targetChannelId, senderId, spaceId),
        getChannels: (spaceId) => chatRepo.getChannels(spaceId),
        createChannel: (spaceId, channelData) => chatRepo.createChannel(spaceId, channelData),
        updateChannel: (channelId, data) => chatRepo.updateChannel(channelId, data),
        deleteChannel: (channelId) => chatRepo.deleteChannel(channelId),
    };
}

function createFileService(fileRepo) {
    return {
        getBySpace: (spaceId, folderId) => fileRepo.getBySpace(spaceId, folderId),
        upload: (spaceId, file, uploadedBy, onProgress, folderId) =>
            fileRepo.upload(spaceId, file, uploadedBy, onProgress, folderId),
        delete: (fileId, userId) => fileRepo.delete(fileId, userId),
        rename: (fileId, name, userId) => fileRepo.rename(fileId, name, userId),
        move: (fileIds, folderId, userId) => fileRepo.move(fileIds, folderId, userId),
        copy: (fileIds, folderId, userId) => fileRepo.copy(fileIds, folderId, userId),
        getDownloadUrl: (fileId) => fileRepo.getDownloadUrl(fileId),
        createFolder: (spaceId, folderData) => fileRepo.createFolder(spaceId, folderData),
        getFolders: (spaceId, parentId) => fileRepo.getFolders(spaceId, parentId),
        getFolder: (folderId) => fileRepo.getFolder(folderId),
        updateFolder: (folderId, name) => fileRepo.updateFolder(folderId, name),
        deleteFolder: (folderId) => fileRepo.deleteFolder(folderId),
        createLink: (spaceId, name, url, uploadedBy, folderId) =>
            fileRepo.createLink(spaceId, name, url, uploadedBy, folderId),
    };
}

function createNotificationService(notificationRepo) {
    return {
        getByUser: (userId) => notificationRepo.getByUser(userId),
        markRead: (notificationId) => notificationRepo.markRead(notificationId),
        markAllRead: (userId) => notificationRepo.markAllRead(userId),
        create: (data) => notificationRepo.create(data),
        delete: (notificationId) => notificationRepo.delete(notificationId),
    };
}

function createInviteService(inviteRepo) {
    return {
        accept: (inviteId) => inviteRepo.accept(inviteId),
        decline: (inviteId) => inviteRepo.decline(inviteId),
        getBySpace: (spaceId) => inviteRepo.getBySpace(spaceId),
        getByCode: (code) => inviteRepo.getByCode(code),
        revoke: (inviteId) => inviteRepo.revoke(inviteId),
        getByUser: (userId) => inviteRepo.getByUser(userId),
    };
}

export default { createContainer, getContainer, resetContainer };
