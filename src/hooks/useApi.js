/**
 * API Hooks - Refactored
 * Custom React hooks for data fetching using DI container services
 * 
 * These hooks provide a convenient way to use services in React components
 * while maintaining proper separation of concerns.
 */

import { useState, useEffect, useCallback } from 'react';
import { getContainer } from '../infrastructure/di/container.js';

// ============ SPACES HOOK ============
export function useSpaces(userId) {
    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const spaceService = getContainer().services.space;

    const fetchSpaces = useCallback(async () => {
        try {
            setLoading(true);
            const data = await spaceService.getAll(userId);
            setSpaces(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId, spaceService]);

    useEffect(() => {
        fetchSpaces();
    }, [fetchSpaces]);

    const createSpace = async (spaceData) => {
        const newSpace = await spaceService.create(spaceData);
        setSpaces(prev => [...prev, newSpace]);
        return newSpace;
    };

    const updateSpace = async (id, data) => {
        const updated = await spaceService.update(id, data);
        setSpaces(prev => prev.map(s => s.id === id ? updated : s));
        return updated;
    };

    const deleteSpace = async (id) => {
        await spaceService.delete(id);
        setSpaces(prev => prev.filter(s => s.id !== id));
    };

    return {
        spaces,
        loading,
        error,
        refetch: fetchSpaces,
        createSpace,
        updateSpace,
        deleteSpace,
        setSpaces
    };
}

// ============ SPACE MEMBERS HOOK ============
export function useSpaceMembers(spaceId) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const memberService = getContainer().services.member;

    const fetchMembers = useCallback(async () => {
        if (!spaceId) return;
        try {
            setLoading(true);
            const data = await memberService.getBySpace(spaceId);
            setMembers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [spaceId, memberService]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const updateRole = async (memberId, role) => {
        await memberService.updateRole(spaceId, memberId, role);
        setMembers(prev => prev.map(m => m.memberId === memberId ? { ...m, role } : m));
    };

    const removeMember = async (memberId) => {
        await memberService.remove(spaceId, memberId);
        setMembers(prev => prev.filter(m => m.memberId !== memberId));
    };

    const banMember = async (memberId, bannedBy, reason) => {
        await memberService.ban(spaceId, memberId, bannedBy, reason);
        setMembers(prev => prev.filter(m => m.memberId !== memberId));
    };

    const inviteMembers = async (emails, inviterName, inviterId) => {
        return await memberService.invite(spaceId, { emails, inviterName, inviterId });
    };

    const inviteUser = async (userId, inviterId) => {
        return await memberService.inviteUser(spaceId, userId, inviterId);
    };

    return {
        members,
        loading,
        error,
        refetch: fetchMembers,
        updateRole,
        removeMember,
        banMember,
        inviteMembers,
        inviteUser
    };
}

// ============ MESSAGES HOOK ============
export function useMessages(spaceId, channelId) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const chatService = getContainer().services.chat;

    const fetchMessages = useCallback(async () => {
        if (!channelId) return;
        try {
            setLoading(true);
            const data = await chatService.getMessages(spaceId, channelId);
            setMessages(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [spaceId, channelId, chatService]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const sendMessage = async (messageData) => {
        const newMessage = await chatService.sendMessage(spaceId, {
            ...messageData,
            channelId
        });
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    };

    const deleteMessage = async (messageId, senderId) => {
        await chatService.deleteMessage(messageId, senderId);
        setMessages(prev => prev.map(m =>
            m.id === messageId
                ? { ...m, deletedAt: new Date().toISOString(), deletedBy: senderId }
                : m
        ));
    };

    const updateMessage = async (messageId, text, senderId) => {
        const updated = await chatService.updateMessage(messageId, text, senderId);
        setMessages(prev => prev.map(m => m.id === messageId ? updated : m));
        return updated;
    };

    return {
        messages,
        loading,
        error,
        refetch: fetchMessages,
        sendMessage,
        deleteMessage,
        updateMessage
    };
}

// ============ CHANNELS HOOK ============
export function useChannels(spaceId) {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const chatService = getContainer().services.chat;

    const fetchChannels = useCallback(async () => {
        if (!spaceId) return;
        try {
            setLoading(true);
            const data = await chatService.getChannels(spaceId);
            setChannels(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [spaceId, chatService]);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const createChannel = async (name, description, createdBy) => {
        const newChannel = await chatService.createChannel(spaceId, { name, description, createdBy });
        setChannels(prev => [...prev, newChannel]);
        return newChannel;
    };

    const updateChannel = async (channelId, data) => {
        const updated = await chatService.updateChannel(channelId, data);
        setChannels(prev => prev.map(c => c.id === channelId ? { ...c, ...data } : c));
        return updated;
    };

    const deleteChannel = async (channelId) => {
        await chatService.deleteChannel(channelId);
        setChannels(prev => prev.filter(c => c.id !== channelId));
    };

    return {
        channels,
        loading,
        error,
        refetch: fetchChannels,
        createChannel,
        updateChannel,
        deleteChannel
    };
}

// ============ FILES HOOK ============
export function useSpaceFiles(spaceId, folderId = null) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fileService = getContainer().services.file;

    const fetchFiles = useCallback(async () => {
        if (!spaceId) return;
        try {
            setLoading(true);
            const data = await fileService.getBySpace(spaceId, folderId);
            setFiles(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [spaceId, folderId, fileService]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const uploadFile = async (file, uploadedBy, onProgress) => {
        const newFile = await fileService.upload(spaceId, file, uploadedBy, onProgress, folderId);
        setFiles(prev => [newFile, ...prev]);
        return newFile;
    };

    const deleteFile = async (fileId, userId) => {
        await fileService.delete(fileId, userId);
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const renameFile = async (fileId, name, userId) => {
        await fileService.rename(fileId, name, userId);
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name } : f));
    };

    const getDownloadUrl = (fileId) => {
        return fileService.getDownloadUrl(fileId);
    };

    return {
        files,
        loading,
        error,
        refetch: fetchFiles,
        uploadFile,
        deleteFile,
        renameFile,
        getDownloadUrl
    };
}

// ============ FOLDERS HOOK ============
export function useFolders(spaceId, parentId = null) {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fileService = getContainer().services.file;

    const fetchFolders = useCallback(async () => {
        if (!spaceId) return;
        try {
            setLoading(true);
            const data = await fileService.getFolders(spaceId, parentId);
            setFolders(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [spaceId, parentId, fileService]);

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);

    const createFolder = async (name, createdBy) => {
        const newFolder = await fileService.createFolder(spaceId, { name, parentId, createdBy });
        setFolders(prev => [...prev, newFolder]);
        return newFolder;
    };

    const deleteFolder = async (folderId) => {
        await fileService.deleteFolder(folderId);
        setFolders(prev => prev.filter(f => f.id !== folderId));
    };

    const renameFolder = async (folderId, name) => {
        await fileService.updateFolder(folderId, name);
        setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name } : f));
    };

    return {
        folders,
        loading,
        error,
        refetch: fetchFolders,
        createFolder,
        deleteFolder,
        renameFolder
    };
}

// ============ NOTIFICATIONS HOOK ============
export function useNotifications(userId) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const notificationService = getContainer().services.notification;

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await notificationService.getByUser(userId);
            setNotifications(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId, notificationService]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markRead = async (id) => {
        await notificationService.markRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = async () => {
        await notificationService.markAllRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        loading,
        error,
        unreadCount,
        refetch: fetchNotifications,
        markRead,
        markAllRead
    };
}

// ============ INVITES HOOK ============
export function useInvites(spaceId) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const inviteService = getContainer().services.invite;

    const fetchInvites = useCallback(async () => {
        if (!spaceId) return;
        try {
            setLoading(true);
            const data = await inviteService.getBySpace(spaceId);
            setInvites(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [spaceId, inviteService]);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const revokeInvite = async (inviteId) => {
        await inviteService.revoke(inviteId);
        setInvites(prev => prev.filter(i => i.id !== inviteId));
    };

    return {
        invites,
        loading,
        error,
        refetch: fetchInvites,
        revokeInvite
    };
}

// ============ USER INVITES HOOK ============
export function useUserInvites(userId) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const inviteService = getContainer().services.invite;

    const fetchInvites = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await inviteService.getByUser(userId);
            setInvites(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId, inviteService]);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const acceptInvite = async (inviteId) => {
        await inviteService.accept(inviteId);
        setInvites(prev => prev.filter(i => i.id !== inviteId));
    };

    const declineInvite = async (inviteId) => {
        await inviteService.decline(inviteId);
        setInvites(prev => prev.filter(i => i.id !== inviteId));
    };

    return {
        invites,
        loading,
        error,
        refetch: fetchInvites,
        acceptInvite,
        declineInvite
    };
}

// ============ AUTH HOOK ============
export function useAuth() {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const authService = getContainer().services.auth;
    const userService = getContainer().services.user;

    const login = async (identifier, password) => {
        try {
            setLoading(true);
            setError(null);
            const userData = await authService.login(identifier, password);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, username, email, password) => {
        try {
            setLoading(true);
            setError(null);
            const userData = await authService.register({ name, username, email, password });
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateProfile = async (data) => {
        if (!user) return;
        const updated = await userService.update(user.id, data);
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
    };

    const uploadAvatar = async (imageData) => {
        if (!user) return;
        const updated = await userService.uploadAvatar(user.id, imageData);
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
    };

    const deleteAvatar = async () => {
        if (!user) return;
        const updated = await userService.deleteAvatar(user.id);
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
    };

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        deleteAvatar
    };
}

// ============ USER PROFILE HOOK ============
export function useUserProfile(userId, viewerId) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const userService = getContainer().services.user;

    const fetchProfile = useCallback(async () => {
        if (!userId || !viewerId) return;
        try {
            setLoading(true);
            const data = await userService.getProfile(userId, viewerId);
            setProfile(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId, viewerId, userService]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        error,
        refetch: fetchProfile
    };
}

// ============ USER SEARCH HOOK ============
export function useUserSearch() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const userService = getContainer().services.user;

    const search = async (query, viewerId) => {
        if (!query || query.length < 2) {
            setResults([]);
            return [];
        }

        try {
            setLoading(true);
            const data = await userService.search(query, viewerId);
            setResults(data);
            return data;
        } catch (err) {
            console.error('Search failed:', err);
            setResults([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => setResults([]);

    return {
        results,
        loading,
        search,
        clearResults
    };
}
