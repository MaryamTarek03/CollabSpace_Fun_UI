/**
 * Notification Repository Interface
 * Defines the contract for notification operations
 */

/**
 * @interface INotificationRepository
 */
export const INotificationRepository = {
    /**
     * Get notifications for a user
     * @param {string} userId - User ID
     * @returns {Promise<Array<INotification>>}
     */
    getByUser: async (userId) => { throw new Error('Not implemented'); },

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     * @returns {Promise<void>}
     */
    markRead: async (notificationId) => { throw new Error('Not implemented'); },

    /**
     * Mark all notifications as read
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    markAllRead: async (userId) => { throw new Error('Not implemented'); },

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     * @returns {Promise<void>}
     */
    delete: async (notificationId) => { throw new Error('Not implemented'); },
};

/**
 * Create a Notification Repository interface for implementation
 * @returns {INotificationRepository}
 */
export function createNotificationRepository() {
    return { ...INotificationRepository };
}
