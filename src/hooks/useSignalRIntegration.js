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

        if (isAuthenticated) {
            const connectSignalR = async () => {
                const token = await httpClient.getValidToken();
                if (isCancelled) return;
                
                if (token) {
                    // Register handlers
                    signalRService.registerHandlers({
                        onMessageReceived: (msg) => {
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
                            const mappedNotification = NotificationMapper.fromApi(notification);
                            // Add to notifications store
                            useNotificationsStore.setState(prev => ({
                                notifications: [mappedNotification, ...prev.notifications]
                            }));
                        }
                    });

                    signalRService.start(token);
                }
            };

            connectSignalR();
        } else {
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
