/**
 * Entity Mappers
 * Handles all API transformation logic (SRP compliant)
 * 
 * This separates the "what data looks like" (entities) from
 * "how data is transformed" (mappers) following Single Responsibility Principle.
 */

import { formatRelativeTime, formatBytes } from '../../shared/utils/helpers.jsx';
import { SPACE_TEMPLATES } from '../../data/spaceTemplates.js';

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

export const UserMapper = {
    fromApi(data) {
        if (!data) return null;
        return createUser({
            ...data,
            name: data.displayName || data.name || data.username || '',
            isPrivate: data.privacy === 'Private' || data.isPrivate || false,
        });
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
        if (!data) return null;
        const ownerId = data.owner?.id || data.ownerId || null;
        const ownerName = data.owner?.name || data.ownerName || 'Unknown';
        const visibility = (data.privacy || data.visibility || 'public').toLowerCase();
        const thumbnail = data.thumbnailImageUrl || data.thumbnailColor || data.thumbnail || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
        let type = null;
        if (data.spaceType !== undefined && data.spaceType !== null) {
            type = Number(data.spaceType);
        } else if (data.type !== undefined && data.type !== null) {
            type = Number(data.type);
        } else if (data.category !== undefined && data.category !== null && !isNaN(Number(data.category))) {
            type = Number(data.category);
        }

        let category = data.category;
        if (type) {
            const template = SPACE_TEMPLATES.find(t => t.id === type);
            if (template) {
                category = template.category;
            }
        }

        return createSpace({
            ...data,
            type,
            category: category && isNaN(Number(category)) ? category : 'General',
            ownerId,
            ownerName,
            visibility,
            thumbnail,
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
            category: space.type ? String(space.type) : space.category,
            spaceType: space.type,
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
        if (!data) return null;
        const role = data.baseRole || data.role || 'member';
        const customRoles = data.roles || [];
        return createMember({
            ...data,
            role,
            customRoles,
        });
    },

    fromApiList(dataList) {
        return (dataList || []).map(d => this.fromApi(d));
    },
};

// ============ MESSAGE MAPPER ============
export const MessageMapper = {
    fromApi(data) {
        if (!data) return null;

        // Extract sender details
        let senderId = data.senderId || data.userId || null;
        let senderName = 'Unknown';
        let avatarImage = data.avatarImage || null;
        let avatarColor = data.avatarColor || null;

        if (data.sender && typeof data.sender === 'object') {
            senderId = senderId || data.sender.id;
            senderName = String(data.sender.displayName || data.sender.username || 'Unknown');
            avatarImage = avatarImage || data.sender.avatarUrl;
        } else if (data.sender) {
            senderName = String(data.sender);
        } else if (data.user) {
            senderName = String(data.user);
        }

        // Extract deletedBy
        let deletedBy = data.deletedBy;
        if (data.deletedBy && typeof data.deletedBy === 'object') {
            deletedBy = data.deletedBy.displayName || data.deletedBy.username || data.deletedBy.id;
        }

        // Extract parent/reply details
        let replyTo = data.replyTo || null;
        if (data.parentMessage && typeof data.parentMessage === 'object') {
            let parentSender = 'Unknown';
            if (data.parentMessage.sender && typeof data.parentMessage.sender === 'object') {
                parentSender = data.parentMessage.sender.displayName || data.parentMessage.sender.username || 'Unknown';
            } else if (data.parentMessage.sender) {
                parentSender = data.parentMessage.sender;
            }
            replyTo = {
                id: data.parentMessage.id,
                sender: parentSender,
                text: data.parentMessage.text || '',
                deletedAt: data.parentMessage.isDeleted ? (data.parentMessage.createdAt || new Date().toISOString()) : null
            };
        }

        // Map attachments if present
        let attachments = data.attachments || [];
        if (data.attachments && Array.isArray(data.attachments)) {
            attachments = data.attachments.map(att => {
                let downloadUrl = att.url;
                if (!downloadUrl && att.fileId) {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5153/api';
                    downloadUrl = `${baseUrl}/spaces/storage/files/${att.fileId}/download`;
                }
                return {
                    id: att.id,
                    name: att.fileName || att.name || 'Attachment',
                    size: att.fileSize || att.size || 0,
                    mimeType: att.mimeType || '',
                    downloadUrl: downloadUrl || '',
                };
            });
        }

        return createMessage({
            ...data,
            senderId,
            sender: senderName,
            avatarImage,
            avatarColor,
            deletedBy,
            replyTo,
            replyToId: data.replyToId || (data.parentMessage ? data.parentMessage.id : null),
            attachments,
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
        if (!data) return null;
        
        const rawSize = data.sizeInBytes ?? data.size ?? 0;
        const formattedSize = typeof rawSize === 'number' ? formatBytes(rawSize) : rawSize;
        
        const uploaderId = data.uploadedBy?.id || data.uploadedById || data.uploadedBy || null;
        const uploaderName = data.uploadedBy?.name || data.uploaderName || 'Unknown';
        
        // Extract extension as type from name if type is missing or generic 'file'
        let type = data.type;
        if ((!type || type === 'file') && data.name) {
            const parts = data.name.split('.');
            type = parts.length > 1 ? parts.pop().toLowerCase() : 'file';
        }
        
        return createFile({
            ...data,
            type: type || 'file',
            size: formattedSize,
            uploadedBy: uploaderId,
            uploaderName,
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
        if (!data) return null;
        let type = data.type ? data.type.toLowerCase() : 'system';
        const text = data.body || data.text || data.message || '';
        const isResponse = text.toLowerCase().includes('accepted') || 
                           text.toLowerCase().includes('declined') || 
                           text.toLowerCase().includes('rejected') || 
                           text.toLowerCase().includes('approved');

        if (isResponse) {
            type = 'invite_response';
        } else if (type.endsWith('invite') || type === 'invite') {
            type = 'invite';
        } else if (type.includes('invite')) {
            type = 'invite_response';
        } else if (type.includes('mention')) {
            type = 'mention';
        } else if (type.includes('session')) {
            type = 'session';
        } else if (type.includes('file')) {
            type = 'file';
        }

        const relType = data.relatedEntityType ? data.relatedEntityType.toLowerCase() : '';
        const inviteId = relType.includes('invite') ? data.relatedEntityId : (data.inviteId || null);
        const spaceId = (relType.includes('space') && !relType.includes('invite')) ? data.relatedEntityId : (data.spaceId || null);

        return createNotification({
            ...data,
            type,
            inviteId,
            spaceId,
            read: data.isRead ?? data.read ?? false,
            text: data.body || data.text || data.message || '',
            author: data.title || data.author || '',
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
        if (!data) return null;
        return createInvite({
            ...data,
            inviterId: data.inviterId || data.inviter?.id || null,
            inviterName: data.inviterName || data.inviter?.displayName || data.inviter?.username || '',
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
        if (!data) return null;
        return createFolder({
            ...data,
            createdBy: data.createdById || data.createdBy || null,
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
