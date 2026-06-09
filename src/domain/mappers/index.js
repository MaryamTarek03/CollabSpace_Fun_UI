/**
 * Entity Mappers
 * Handles all API transformation logic (SRP compliant)
 * 
 * This separates the "what data looks like" (entities) from
 * "how data is transformed" (mappers) following Single Responsibility Principle.
 */

import { formatRelativeTime } from '../../shared/utils/helpers.jsx';

// Import pure entity factories
import {
    createUser,
    createSpace,
    createMember,
    createMessage,
    createFile,
    createNotification,
    createInvite,
    createChannel,
    createFolder,
    createJoinRequest,
    createBan,
    createFavorite,
} from '../entities/index.js';

// ============ USER MAPPER ============
export const UserMapper = {
    fromApi(data) {
        return createUser(data);
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },

    toApi(user) {
        return {
            name: user.name,
            username: user.username,
            email: user.email,
            avatarColor: user.avatarColor,
            bio: user.bio,
        };
    },
};

// ============ SPACE MAPPER ============
export const SpaceMapper = {
    fromApi(data) {
        return createSpace({
            ...data,
            // Map nested entities using their mappers
            members: MemberMapper.fromApiList(data.members),
            files: FileMapper.fromApiList(data.files),
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },

    toApi(space) {
        return {
            name: space.name,
            description: space.description,
            category: space.category,
            ownerId: space.ownerId,
            thumbnail: space.thumbnail,
            thumbnailPosition: space.thumbnailPosition,
            visibility: space.visibility,
        };
    },
};

// ============ MEMBER MAPPER ============
export const MemberMapper = {
    fromApi(data) {
        return createMember(data);
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};

// ============ MESSAGE MAPPER ============
export const MessageMapper = {
    fromApi(data) {
        return createMessage({
            ...data,
            time: data.time || formatRelativeTime(data.createdAt || new Date()),
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },

    toApi(message) {
        return {
            spaceId: message.spaceId,
            channelId: message.channelId,
            senderId: message.senderId,
            text: message.text,
            type: message.type,
            mentions: message.mentions,
            replyToId: message.replyToId,
        };
    },
};

// ============ FILE MAPPER ============
export const FileMapper = {
    fromApi(data) {
        return createFile({
            ...data,
            time: data.time || formatRelativeTime(data.createdAt || new Date()),
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};

// ============ NOTIFICATION MAPPER ============
export const NotificationMapper = {
    fromApi(data) {
        return createNotification({
            ...data,
            time: formatRelativeTime(data.createdAt || new Date()),
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};

// ============ INVITE MAPPER ============
export const InviteMapper = {
    fromApi(data) {
        return createInvite({
            ...data,
            time: formatRelativeTime(data.createdAt || new Date()),
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};

// ============ CHANNEL MAPPER ============
export const ChannelMapper = {
    fromApi(data) {
        return createChannel({
            ...data,
            time: formatRelativeTime(data.createdAt || new Date()),
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};

// ============ FOLDER MAPPER ============
export const FolderMapper = {
    fromApi(data) {
        return createFolder({
            ...data,
            time: formatRelativeTime(data.createdAt || new Date()),
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};

// ============ JOIN REQUEST MAPPER ============
export const JoinRequestMapper = {
    fromApi(data) {
        return createJoinRequest({
            ...data,
            time: formatRelativeTime(data.createdAt || new Date()),
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};

// ============ BAN MAPPER ============
export const BanMapper = {
    fromApi(data) {
        return createBan({
            ...data,
            time: formatRelativeTime(data.createdAt || new Date()),
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};

// ============ FAVORITE MAPPER ============
export const FavoriteMapper = {
    fromApi(data) {
        return createFavorite(data);
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};
