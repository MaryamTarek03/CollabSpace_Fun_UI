import { create } from 'zustand';
import { getContainer } from '../infrastructure/di/container.js';
import { UserMapper } from '../domain/mappers/index.js';
import { registerAuthFailureCallback } from '../infrastructure/api/httpClient.js';

/**
 * Auth Store - Refactored
 * Uses DI container services instead of direct API calls
 * 
 * Design Patterns Applied:
 * - Dependency Injection: Services injected via container
 * - Observer Pattern: Zustand provides reactive state
 * - Facade Pattern: Store provides simplified interface to auth operations
 */
const useAuthStore = create((set, get) => ({
    // State
    user: null,
    isAuthenticated: false,
    authInitialized: false,
    loading: false,
    error: null,

    // Get the auth service from DI container
    _getAuthService: () => getContainer().services.auth,
    _getUserService: () => getContainer().services.user,

    // Actions
    setUser: (user) => set({ user, isAuthenticated: !!user }),

    login: async (identifier, password) => {
        set({ loading: true, error: null });
        try {
            const authService = get()._getAuthService();
            const userData = await authService.login(identifier, password);
            
            // Fetch full profile info from /api/profile/me
            const userService = get()._getUserService();
            const fullUser = await userService.getProfile('me', userData.id);

            set({ user: fullUser, isAuthenticated: true, loading: false });
            localStorage.setItem('user', JSON.stringify(fullUser));
            return fullUser;
        } catch (err) {
            const errorData = err.data || { error: err.message || 'Login failed' };
            set({ error: errorData, loading: false });
            throw err;
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const authService = get()._getAuthService();
            const newUser = await authService.register(userData);
            
            // Fetch full profile info from /api/profile/me
            const userService = get()._getUserService();
            const fullUser = await userService.getProfile('me', newUser.id);

            set({ user: fullUser, isAuthenticated: true, loading: false });
            localStorage.setItem('user', JSON.stringify(fullUser));
            return fullUser;
        } catch (err) {
            set({ error: err.message || 'Registration failed', loading: false });
            throw err;
        }
    },

    logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('user');
    },

    updateProfile: async (profileData) => {
        const { user } = get();
        if (!user) return;

        try {
            const userService = get()._getUserService();
            const updatedUser = await userService.update(user.id, profileData);
            set({ user: updatedUser });
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (err) {
            set({ error: err.message });
            throw err;
        }
    },

    uploadAvatar: async (imageData) => {
        const { user } = get();
        if (!user) return;

        try {
            const userService = get()._getUserService();
            const updatedUser = await userService.uploadAvatar(user.id, imageData);
            set({ user: updatedUser });
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (err) {
            throw err;
        }
    },

    deleteAvatar: async () => {
        const { user } = get();
        if (!user) return;

        try {
            const userService = get()._getUserService();
            const updatedUser = await userService.deleteAvatar(user.id);
            set({ user: updatedUser });
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (err) {
            throw err;
        }
    },

    // Initialize from localStorage or OAuth callback
    initialize: () => {
        // Check for OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
        const errorParam = urlParams.get('error');

        if (userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                const userEntity = UserMapper.fromApi(user);
                set({ user: userEntity, isAuthenticated: true, authInitialized: true });
                localStorage.setItem('user', JSON.stringify(userEntity));
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            } catch (e) {
                console.error('Failed to parse OAuth user data:', e);
            }
        }

        if (errorParam) {
            const errorMessages = {
                'oauth_denied': 'Google sign-in was cancelled',
                'invalid_state': 'Security validation failed. Please try again.',
                'no_code': 'Authentication failed. Please try again.',
                'token_failed': 'Failed to get access token from Google',
                'no_user_info': 'Could not retrieve your Google profile',
                'user_not_found': 'User account not found',
                'callback_failed': 'Authentication callback failed'
            };
            set({ error: { error: errorMessages[errorParam] || 'Authentication failed' }, authInitialized: true });
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        // Check localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                set({ user, isAuthenticated: true, authInitialized: true });
            } catch (e) {
                localStorage.removeItem('user');
                set({ authInitialized: true });
            }
        } else {
            set({ authInitialized: true });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;

// Register auth failure callback to log out automatically
registerAuthFailureCallback(() => {
    useAuthStore.getState().logout();
});
