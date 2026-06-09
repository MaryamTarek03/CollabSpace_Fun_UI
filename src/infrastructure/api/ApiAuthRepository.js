/**
 * API Auth Repository
 * Implements IAuthRepository using HTTP API
 */

import { httpClient } from './httpClient.js';
import { UserMapper } from '../../domain/mappers/index.js';

/**
 * Create an Auth Repository that uses the HTTP API
 * @returns {IAuthRepository}
 */
export function createApiAuthRepository() {
    return {
        /**
         * Login with credentials
         * @param {Object} credentials - { identifier, password }
         * @returns {Promise<IUser>}
         */
        async login(credentials) {
            const data = await httpClient.post('/auth/login', credentials);
            return UserMapper.fromApi(data);
        },

        /**
         * Register a new user
         * @param {Object} userData - { name, username, email, password }
         * @returns {Promise<IUser>}
         */
        async register(userData) {
            const data = await httpClient.post('/auth/register', userData);
            return UserMapper.fromApi(data);
        },

        /**
         * Get OAuth login URL
         * @param {string} provider - OAuth provider name
         * @returns {string}
         */
        getOAuthUrl(provider) {
            return `${httpClient.getBaseUrl()}/auth/${provider}`;
        },
    };
}
