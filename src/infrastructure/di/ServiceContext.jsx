/**
 * Service Context
 * React Context for Dependency Injection
 * 
 * Provides services to React components via Context API
 * This enables proper Dependency Inversion in React
 */

import React, { createContext, useContext, useMemo } from 'react';
import { getContainer } from './container.js';

// Create the context
const ServiceContext = createContext(null);

/**
 * Service Provider Component
 * Wraps the app and provides all services via context
 */
export function ServiceProvider({ children, container: customContainer }) {
    const container = useMemo(() => {
        return customContainer || getContainer();
    }, [customContainer]);

    return (
        <ServiceContext.Provider value={container}>
            {children}
        </ServiceContext.Provider>
    );
}

/**
 * Hook to access the entire container
 * @returns {Object} Container with all services
 */
export function useContainer() {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useContainer must be used within a ServiceProvider');
    }
    return context;
}

/**
 * Hook to access a specific service
 * @param {string} serviceName - Name of the service
 * @returns {Object} The requested service
 */
export function useService(serviceName) {
    const container = useContainer();
    const service = container.services[serviceName];
    if (!service) {
        throw new Error(`Service "${serviceName}" not found in container`);
    }
    return service;
}

/**
 * Hook to access the auth service
 * @returns {Object} Auth service
 */
export function useAuthService() {
    return useService('auth');
}

/**
 * Hook to access the user service
 * @returns {Object} User service
 */
export function useUserService() {
    return useService('user');
}

/**
 * Hook to access the space service
 * @returns {Object} Space service
 */
export function useSpaceService() {
    return useService('space');
}

/**
 * Hook to access the member service
 * @returns {Object} Member service
 */
export function useMemberService() {
    return useService('member');
}

/**
 * Hook to access the chat service
 * @returns {Object} Chat service
 */
export function useChatService() {
    return useService('chat');
}

/**
 * Hook to access the file service
 * @returns {Object} File service
 */
export function useFileService() {
    return useService('file');
}

/**
 * Hook to access the notification service
 * @returns {Object} Notification service
 */
export function useNotificationService() {
    return useService('notification');
}

/**
 * Hook to access the invite service
 * @returns {Object} Invite service
 */
export function useInviteService() {
    return useService('invite');
}
