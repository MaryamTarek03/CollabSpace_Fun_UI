import { create } from 'zustand';
import { getContainer } from '../infrastructure/di/container.js';
import { MessageMapper } from '../domain/mappers/index.js';
import { INITIAL_CHAT_HISTORY } from '../data/mockData';

/**
 * Chat Store - Refactored
 * Uses DI container services instead of direct API calls
 * 
 * Design Patterns Applied:
 * - Dependency Injection: Services injected via container
 * - Observer Pattern: Zustand provides reactive state
 * - Facade Pattern: Store provides simplified interface to chat operations
 */
const useChatStore = create((set, get) => ({
    // State
    activeChatSpace: null,
    channels: [],
    activeChannel: null,
    messages: [],
    members: [],
    replyingTo: null,
    localChatHistory: INITIAL_CHAT_HISTORY,
    chatInput: '',
    loading: false,
    error: null,

    // Get services from DI container
    _getChatService: () => getContainer().services.chat,
    _getMemberService: () => getContainer().services.member,

    // Actions
    setActiveChatSpace: async (space) => {
        if (space) {
            window.__activeSpaceId = space.id;
        } else {
            window.__activeSpaceId = null;
        }
        set({ activeChatSpace: space, channels: [], activeChannel: null, messages: [], members: [] });
        if (space) {
            await get().fetchChannels(space.id);
            await get().fetchMembers(space.id);
        }
    },

    clearActiveChatSpace: () => {
        window.__activeSpaceId = null;
        set({ activeChatSpace: null, channels: [], activeChannel: null, messages: [] });
    },

    setChatInput: (input) => set({ chatInput: input }),

    // Fetch channels for a space
    fetchChannels: async (spaceId) => {
        if (!spaceId) return;
        set({ loading: true });
        try {
            const chatService = get()._getChatService();
            const data = await chatService.getChannels(spaceId);
            set({ channels: data, loading: false });
            if (data.length > 0) {
                get().setActiveChannel(data[0]);
            }
            return data;
        } catch (err) {
            console.error('Failed to fetch channels:', err);
            set({ channels: [], loading: false });
        }
    },

    // Fetch members for mentions
    fetchMembers: async (spaceId) => {
        if (!spaceId) return;
        try {
            const memberService = get()._getMemberService();
            const data = await memberService.getBySpace(spaceId);
            set({ members: data });
            return data;
        } catch (err) {
            console.error('Failed to fetch members:', err);
            set({ members: [] });
        }
    },

    // Set active channel and fetch its messages
    setActiveChannel: (channel) => {
        set({ activeChannel: channel, messages: [] });
        if (channel) {
            get().fetchMessages(channel.id);
        }
    },

    // Create a new channel
    createChannel: async (name, description, createdBy) => {
        const { activeChatSpace, channels } = get();
        if (!activeChatSpace) return;

        try {
            const chatService = get()._getChatService();
            const newChannel = await chatService.createChannel(activeChatSpace.id, {
                name,
                description,
                createdBy
            });
            set({ channels: [...channels, newChannel] });
            return newChannel;
        } catch (err) {
            console.error('Failed to create channel:', err);
            throw err;
        }
    },

    // Update a channel
    updateChannel: async (channelId, name, description) => {
        const { channels } = get();
        try {
            const chatService = get()._getChatService();
            const updated = await chatService.updateChannel(channelId, { name, description });
            set({ channels: channels.map(c => c.id === channelId ? { ...c, name, description } : c) });
            return updated;
        } catch (err) {
            console.error('Failed to update channel:', err);
            throw err;
        }
    },

    // Delete a channel
    deleteChannel: async (channelId) => {
        const { channels, activeChannel } = get();
        try {
            const chatService = get()._getChatService();
            await chatService.deleteChannel(channelId);
            const remaining = channels.filter(c => c.id !== channelId);
            set({ channels: remaining });
            if (activeChannel?.id === channelId && remaining.length > 0) {
                get().setActiveChannel(remaining[0]);
            }
        } catch (err) {
            console.error('Failed to delete channel:', err);
            throw err;
        }
    },

    // Fetch messages for a channel
    fetchMessages: async (channelId) => {
        if (!channelId) return;

        set({ loading: true });
        try {
            const spaceId = get().activeChatSpace?.id;
            const chatService = get()._getChatService();
            const messages = await chatService.getMessages(spaceId, channelId);
            set({ messages, loading: false });
            return messages;
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            set({ messages: [], loading: false });
        }
    },

    // Set message to reply to
    setReplyingTo: (message) => set({ replyingTo: message }),
    clearReplyingTo: () => set({ replyingTo: null }),

    // Send a message (with optional reply)
    sendMessage: async (messageData) => {
        const { activeChatSpace, activeChannel, messages, replyingTo } = get();
        if (!activeChatSpace || !activeChannel) return;

        const newMessage = {
            id: Date.now(),
            ...messageData,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date().toISOString(),
        };

        try {
            const chatService = get()._getChatService();
            const response = await chatService.sendMessage(activeChatSpace.id, {
                ...messageData,
                channelId: activeChannel.id,
                spaceId: activeChatSpace.id,
                replyToId: replyingTo?.id || null
            });
            set({ messages: [...messages, response], replyingTo: null });
            return response;
        } catch (err) {
            // Fallback to local state
            set({ messages: [...messages, newMessage], replyingTo: null });
            return newMessage;
        }
    },

    // Forward a message to another channel
    forwardMessage: async (messageId, targetChannelId, senderId) => {
        const { activeChatSpace, activeChannel } = get();
        if (!activeChatSpace) return;

        try {
            const chatService = get()._getChatService();
            const response = await chatService.forwardMessage(messageId, targetChannelId, senderId, activeChatSpace.id);
            if (targetChannelId === activeChannel?.id) {
                const { messages } = get();
                set({ messages: [...messages, MessageMapper.fromApi(response)] });
            }
            return response;
        } catch (err) {
            console.error('Failed to forward message:', err);
            throw err;
        }
    },

    updateMessage: async (id, text, senderId) => {
        const { messages } = get();
        try {
            const chatService = get()._getChatService();
            const updated = await chatService.updateMessage(id, text, senderId);
            set({
                messages: messages.map(m => m.id === id ? updated : m)
            });
            return updated;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    deleteMessage: async (id, senderId) => {
        const { messages } = get();
        try {
            const chatService = get()._getChatService();
            const response = await chatService.deleteMessage(id, senderId);
            set({
                messages: messages.map(m => m.id === id ? {
                    ...m,
                    deletedAt: new Date().toISOString(),
                    deletedBy: senderId,
                    deletedByRole: response?.deletedByRole
                } : m)
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    // Get current messages
    getCurrentMessages: () => {
        const { messages } = get();
        return messages;
    },
}));

export default useChatStore;
