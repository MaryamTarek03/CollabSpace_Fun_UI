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
            const data = await httpClient.get(`/notifications${userId ? `?userId=${userId}` : ''}`);
            return NotificationMapper.fromApiList(data);
        },

        async markRead(notificationId) {
            return httpClient.put(`/notifications/${notificationId}/read`);
        },

        async markAllRead(userId) {
            return httpClient.put('/notifications/read-all');
        },

        async create(data) {
            return httpClient.post('/notifications', data);
        },

        async delete(notificationId) {
            return httpClient.delete(`/notifications/${notificationId}`);
        },
    };
}
