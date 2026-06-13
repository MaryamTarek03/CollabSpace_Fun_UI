import { useEffect } from 'react';
import { useAuthStore, useChatStore, useNotificationsStore, useSpacesStore } from '../store';
import { signalRService } from '../infrastructure/api/signalRService.js';
import { httpClient } from '../infrastructure/api/httpClient.js';
import { MessageMapper, NotificationMapper } from '../domain/mappers/index.js';

export function useSignalRIntegration() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const spaces = useSpacesStore(state => state.spaces);

    useEffect(() => {
        let isCancelled = false;

        console.log("[SignalR Integration] Auth status changed, isAuthenticated:", isAuthenticated);

        if (isAuthenticated) {
            const connectSignalR = async () => {
                console.log("[SignalR Integration] Fetching valid token...");
                try {
                    const token = await httpClient.getValidToken();
                    console.log("[SignalR Integration] Token retrieval finished. Token present:", !!token);

                    if (isCancelled) {
                        console.log("[SignalR Integration] Connection cancelled before starting.");
                        return;
                    }

                    if (token) {
                        console.log("[SignalR Integration] Registering message handlers...");
                        // Register handlers
                        signalRService.registerHandlers({
                            onMessageReceived: (msg) => {
                                console.log("[SignalR Integration] Received message:", msg);
                                const mappedMsg = MessageMapper.fromApi(msg);
                                const state = useChatStore.getState();
                                // Add to chat store if current channel matches
                                if (state.activeChannel && state.activeChannel.id === mappedMsg.channelId) {
                                    useChatStore.setState(prev => ({
                                        messages: [...prev.messages.filter(m => m.id !== mappedMsg.id), mappedMsg]
                                    }));
                                }
                            },
                            onMessageEdited: (msg) => {
                                console.log("[SignalR Integration] Message edited:", msg);
                                const mappedMsg = MessageMapper.fromApi(msg);
                                const state = useChatStore.getState();
                                // Update in chat store if current channel matches
                                if (state.activeChannel && state.activeChannel.id === mappedMsg.channelId) {
                                    useChatStore.setState(prev => ({
                                        messages: prev.messages.map(m => m.id === mappedMsg.id ? mappedMsg : m)
                                    }));
                                }
                            },
                            onMessageDeleted: (info) => {
                                console.log("[SignalR Integration] Message deleted:", info);
                                const state = useChatStore.getState();
                                // Mark as deleted in chat store if current channel matches
                                if (state.activeChannel && state.activeChannel.id === info.channelId) {
                                    useChatStore.setState(prev => ({
                                        messages: prev.messages.map(m => m.id === info.messageId ? {
                                            ...m,
                                            deletedAt: info.deletedAt || new Date().toISOString(),
                                            deletedBy: info.deletedById
                                        } : m)
                                    }));
                                }
                            },
                            onNotificationReceived: (notification) => {
                                console.log("[SignalR Integration] Received notification:", notification);
                                const mappedNotification = NotificationMapper.fromApi(notification);
                                // Add to notifications store
                                useNotificationsStore.setState(prev => ({
                                    notifications: [mappedNotification, ...prev.notifications]
                                }));

                                // Check if user was kicked/banned from space
                                const text = (mappedNotification?.text || '').toLowerCase();
                                const isKickOrBan = text.includes('kicked') || text.includes('banned') || text.includes('removed');
                                if (isKickOrBan) {
                                    const spaceId = mappedNotification?.spaceId || notification?.spaceId || notification?.relatedEntityId;
                                    if (spaceId) {
                                        console.log(`[SignalR Integration] User kicked/banned from space ${spaceId}. Removing space from store...`);

                                        // Remove from spaces list in store
                                        useSpacesStore.setState(prev => ({
                                            spaces: (prev.spaces || []).filter(s => s.id !== spaceId),
                                            activeSpace: prev.activeSpace?.id === spaceId ? null : prev.activeSpace
                                        }));

                                        // If currently inside the kicked/banned space, redirect to dashboard
                                        if (window.location.pathname.includes(`/spaces/${spaceId}`) || window.location.pathname.includes(`/chat/${spaceId}`)) {
                                            window.location.href = '/dashboard';
                                        }
                                    }
                                }

                                // Check if user's join request was accepted/approved
                                const isJoinAccepted = text.includes('accepted') || text.includes('approved') || text.includes('joined');
                                if (isJoinAccepted && !text.includes('declined') && !text.includes('rejected')) {
                                    console.log("[SignalR Integration] Join accepted. Fetching updated spaces...");
                                    useSpacesStore.getState().fetchSpaces().catch(console.error);
                                }
                            }
                        });

                        console.log("[SignalR Integration] Starting SignalR service...");
                        signalRService.start(token);
                    } else {
                        console.warn("[SignalR Integration] No valid token found, cannot start connection.");
                    }
                } catch (err) {
                    console.error("[SignalR Integration] Error in connectSignalR process:", err);
                }
            };

            connectSignalR();
        } else {
            console.log("[SignalR Integration] User not authenticated. Stopping SignalR service...");
            signalRService.stop();
        }

        return () => {
            isCancelled = true;
        };
    }, [isAuthenticated]);

    // Handle space joining/leaving groups for all spaces
    useEffect(() => {
        if (isAuthenticated && spaces && spaces.length > 0) {
            spaces.forEach(space => {
                signalRService.joinSpace(space.id);
            });
            return () => {
                spaces.forEach(space => {
                    signalRService.leaveSpace(space.id);
                });
            };
        }
    }, [isAuthenticated, spaces]);
}

export default useSignalRIntegration;
