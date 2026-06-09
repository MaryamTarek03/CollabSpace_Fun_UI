import React, { createContext, useContext } from 'react';
import { useAuth, useNotifications } from '../hooks/useApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const auth = useAuth();
    const notifications = useNotifications(auth.user?.id);

    const value = {
        ...auth,
        notifications: notifications.notifications,
        unreadCount: notifications.unreadCount,
        markNotificationRead: notifications.markRead,
        markAllNotificationsRead: notifications.markAllRead,
        refetchNotifications: notifications.refetch,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
