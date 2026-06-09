/**
 * API Notification Repository
 * Implements INotificationRepository using HTTP API
 */

import { httpClient } from './httpClient.js';
import { NotificationMapper } from '../../domain/mappers/index.js';

/**
 * Create a Notification Repository that uses the HTTP API
 * @returns {INotificationRepository}
 */
export function createApiNotificationRepository() {
    return {
        async getByUser(userId) {
            const data = await httpClient.get('/notifications');
            const notificationsList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
            return NotificationMapper.fromApiList(notificationsList);
        },

        async markRead(notificationId) {
            return httpClient.put(`/notifications/${notificationId}/read`);
        },

        async markAllRead(userId) {
            return httpClient.put('/notifications/read-all');
        },

        async create(data) {
            // Notifications are created by backend events
            return null;
        },

        async delete(notificationId) {
            // Real backend uses markRead to handle notification state
            return httpClient.put(`/notifications/${notificationId}/read`);
        },
    };
}
