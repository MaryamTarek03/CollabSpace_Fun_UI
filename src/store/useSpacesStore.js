import { create } from 'zustand';
import { getContainer } from '../infrastructure/di/container.js';
import useAuthStore from './useAuthStore';

/**
 * Spaces Store - Refactored
 * Uses DI container services instead of direct API calls
 * 
 * Design Patterns Applied:
 * - Dependency Injection: Services injected via container
 * - Observer Pattern: Zustand provides reactive state
 * - Facade Pattern: Store provides simplified interface to space operations
 */
const useSpacesStore = create((set, get) => ({
    // State
    spaces: [],
    activeSpace: null,
    userFavorites: [],
    loading: false,
    error: null,

    // Filter state
    activeTab: 'all',
    activeCategory: 'all',
    activeStatus: 'all',
    searchQuery: '',
    viewMode: 'grid',
    sortOption: 'newest',

    // Get services from DI container
    _getSpaceService: () => getContainer().services.space,
    _getUserService: () => getContainer().services.user,

    // Actions
    setActiveSpace: (space) => {
        if (space) {
            window.__activeSpaceId = space.id;
        } else {
            window.__activeSpaceId = null;
        }
        set({ activeSpace: space });
    },
    clearActiveSpace: () => {
        window.__activeSpaceId = null;
        set({ activeSpace: null });
    },
    setSortOption: (sortOption) => set({ sortOption }),

    // Fetch all spaces
    fetchSpaces: async () => {
        set({ loading: true, error: null });
        try {
            const user = useAuthStore.getState().user;
            const spaceService = get()._getSpaceService();
            const spaces = await spaceService.getAll(user?.id);
            
            // Extract favorite IDs from spaces list
            const favIds = (spaces || []).filter(s => s.isFavorite).map(s => s.id);
            
            set({ spaces, userFavorites: favIds, loading: false });
            return spaces;
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // Create a new space
    createSpace: async (spaceData) => {
        try {
            const spaceService = get()._getSpaceService();
            const newSpace = await spaceService.create(spaceData);
            set((state) => ({ spaces: [...state.spaces, newSpace] }));
            return newSpace;
        } catch (err) {
            throw err;
        }
    },

    // Update a space
    updateSpace: async (spaceId, updates) => {
        try {
            const spaceService = get()._getSpaceService();
            const updated = await spaceService.update(spaceId, updates);
            set((state) => ({
                spaces: state.spaces.map(s => s.id === spaceId ? updated : s),
                activeSpace: state.activeSpace?.id === spaceId ? updated : state.activeSpace
            }));
            return updated;
        } catch (err) {
            throw err;
        }
    },

    // Delete a space
    deleteSpace: async (spaceId) => {
        try {
            const spaceService = get()._getSpaceService();
            await spaceService.delete(spaceId);
            set((state) => ({
                spaces: state.spaces.filter(s => s.id !== spaceId),
                activeSpace: state.activeSpace?.id === spaceId ? null : state.activeSpace
            }));
        } catch (err) {
            throw err;
        }
    },

    // Favorites
    fetchFavorites: async (userId) => {
        try {
            const userService = get()._getUserService();
            const favs = await userService.getFavorites(userId);
            set({ userFavorites: favs });
        } catch (err) {
            console.log('Could not fetch favorites');
        }
    },

    toggleFavorite: async (userId, spaceId) => {
        try {
            const userService = get()._getUserService();
            const result = await userService.toggleFavorite(userId, spaceId);
            const isFav = result?.isFavorite ?? false;
            set((state) => ({
                userFavorites: isFav
                    ? [...state.userFavorites, spaceId]
                    : state.userFavorites.filter(id => id !== spaceId),
                spaces: state.spaces.map(s => s.id === spaceId ? { ...s, isFavorite: isFav } : s),
                activeSpace: state.activeSpace?.id === spaceId ? { ...state.activeSpace, isFavorite: isFav } : state.activeSpace
            }));
            return result;
        } catch (err) {
            // Optimistic toggle for offline support
            set((state) => {
                const wasFav = state.userFavorites.includes(spaceId);
                const nextFav = !wasFav;
                return {
                    userFavorites: nextFav
                        ? [...state.userFavorites, spaceId]
                        : state.userFavorites.filter(id => id !== spaceId),
                    spaces: state.spaces.map(s => s.id === spaceId ? { ...s, isFavorite: nextFav } : s),
                    activeSpace: state.activeSpace?.id === spaceId ? { ...state.activeSpace, isFavorite: nextFav } : state.activeSpace
                };
            });
        }
    },

    joinSpace: async (spaceId, message = null) => {
        try {
            const user = useAuthStore.getState().user;
            if (!user) throw new Error('Must be logged in');
            const spaceService = get()._getSpaceService();
            return await spaceService.join(spaceId, user.id, message);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || '';
            if (errorMsg.includes('already banned') || errorMsg.toLowerCase().includes('banned')) {
                throw new Error("You have been banned from this space and cannot join or request to join.");
            }
            throw err;
        }
    },

    fetchSpaceRequests: async (spaceId) => {
        try {
            const spaceService = get()._getSpaceService();
            return await spaceService.getRequests(spaceId);
        } catch (err) {
            console.error('Failed to fetch requests', err);
            return [];
        }
    },

    approveRequest: async (spaceId, requestId) => {
        try {
            const spaceService = get()._getSpaceService();
            await spaceService.approveRequest(spaceId, requestId);
        } catch (err) {
            throw err;
        }
    },

    rejectRequest: async (spaceId, requestId) => {
        try {
            const spaceService = get()._getSpaceService();
            await spaceService.rejectRequest(spaceId, requestId);
        } catch (err) {
            throw err;
        }
    },

    transferOwnership: async (spaceId, currentOwnerId, newOwnerId) => {
        try {
            const spaceService = get()._getSpaceService();
            await spaceService.transferOwnership(spaceId, currentOwnerId, newOwnerId);
            // Optimistic update of active space
            set(state => {
                if (state.activeSpace?.id === spaceId) {
                    return {
                        activeSpace: {
                            ...state.activeSpace,
                            ownerId: newOwnerId
                        }
                    };
                }
                return {};
            });
        } catch (err) {
            throw err;
        }
    },

    // Filters
    setActiveTab: (tab) => set({ activeTab: tab }),
    setActiveCategory: (category) => set({ activeCategory: category }),
    setActiveStatus: (status) => set({ activeStatus: status }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setViewMode: (mode) => set({ viewMode: mode }),

    // Get filtered spaces
    getFilteredSpaces: () => {
        const { spaces, activeTab, activeCategory, activeStatus, searchQuery, userFavorites } = get();

        return spaces.filter(space => {
            const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase());
            let matchesTab = true;
            if (activeTab === 'favorites') matchesTab = userFavorites.includes(space.id);
            if (activeTab === 'owned') {
                const user = useAuthStore.getState().user;
                matchesTab = space.ownerId === user?.id;
            }
            let matchesCategory = true;
            if (activeCategory !== 'all') matchesCategory = space.category === activeCategory;
            let matchesStatus = true;
            if (activeStatus === 'online') matchesStatus = space.isOnline === true;
            if (activeStatus === 'offline') matchesStatus = space.isOnline === false;
            return matchesSearch && matchesTab && matchesCategory && matchesStatus;
        });
    },
}));

export default useSpacesStore;
