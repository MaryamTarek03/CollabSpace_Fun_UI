import { create } from 'zustand';
import { getContainer } from '../infrastructure/di/container.js';

/**
 * Notifications Store - Refactored
 * Uses DI container services instead of direct API calls
 * 
 * Design Patterns Applied:
 * - Dependency Injection: Services injected via container
 * - Observer Pattern: Zustand provides reactive state
 * - Facade Pattern: Store provides simplified interface to notification operations
 */
const useNotificationsStore = create((set, get) => ({
    // State
    notifications: [],
    loading: false,
    error: null,

    // Get services from DI container
    _getNotificationService: () => getContainer().services.notification,
    _getInviteService: () => getContainer().services.invite,

    // Computed - unread count
    getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
    },

    // Fetch notifications for a user
    fetchNotifications: async (userId) => {
        set({ loading: true, error: null });
        try {
            const notificationService = get()._getNotificationService();
            const notifications = await notificationService.getByUser(userId);
            // Sort by date, newest first
            const sorted = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            set({ notifications: sorted, loading: false });
            return sorted;
        } catch (err) {
            set({ error: err.message, loading: false });
            return [];
        }
    },

    // Mark single notification as read
    markAsRead: async (id) => {
        try {
            const notificationService = get()._getNotificationService();
            await notificationService.markRead(id);
            set((state) => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, read: true } : n
                )
            }));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            const notificationService = get()._getNotificationService();
            await notificationService.markAllRead();
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, read: true }))
            }));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    },

    // Accept an invite
    acceptInvite: async (inviteId, notificationId) => {
        try {
            const inviteService = get()._getInviteService();
            const notificationService = get()._getNotificationService();

            await Promise.all([
                inviteService.accept(inviteId),
                notificationService.markRead(notificationId)
            ]);

            // Mark as read locally
            set((state) => ({
                notifications: state.notifications.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            }));
            return true;
        } catch (err) {
            console.error('Failed to accept invite:', err);
            return false;
        }
    },

    // Decline an invite
    declineInvite: async (inviteId, notificationId) => {
        try {
            const inviteService = get()._getInviteService();
            const notificationService = get()._getNotificationService();

            await Promise.all([
                inviteService.decline(inviteId),
                notificationService.markRead(notificationId)
            ]);

            // Mark as read locally
            set((state) => ({
                notifications: state.notifications.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            }));
            return true;
        } catch (err) {
            console.error('Failed to decline invite:', err);
            return false;
        }
    },

    // Add a notification (for real-time updates)
    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications]
        }));
    },

    // Clear all notifications
    clearNotifications: () => set({ notifications: [] }),
}));

export default useNotificationsStore;
