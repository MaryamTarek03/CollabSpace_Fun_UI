/**
 * Auth Repository Interface
 * Defines the contract for authentication operations
 * 
 * This is a PORT in hexagonal architecture - implementations are in infrastructure layer
 */

/**
 * @interface IAuthRepository
 */
export const IAuthRepository = {
    /**
     * Login with credentials
     * @param {Object} credentials - { identifier, password }
     * @returns {Promise<IUser>}
     */
    login: async (credentials) => { throw new Error('Not implemented'); },

    /**
     * Register a new user
     * @param {Object} userData - { name, username, email, password }
     * @returns {Promise<IUser>}
     */
    register: async (userData) => { throw new Error('Not implemented'); },

    /**
     * Get OAuth login URL
     * @param {string} provider - OAuth provider name
     * @returns {string}
     */
    getOAuthUrl: (provider) => { throw new Error('Not implemented'); },
};

/**
 * Create an Auth Repository interface for implementation
 * @returns {IAuthRepository}
 */
export function createAuthRepository() {
    return {
        login: async (credentials) => { throw new Error('Not implemented'); },
        register: async (userData) => { throw new Error('Not implemented'); },
        getOAuthUrl: (provider) => { throw new Error('Not implemented'); },
    };
}
