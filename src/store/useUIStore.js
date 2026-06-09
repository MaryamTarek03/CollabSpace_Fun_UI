import { create } from 'zustand';

/**
 * UI Store
 * Manages views, modals, and general UI state
 */
const useUIStore = create((set) => ({
    // Navigation
    currentView: 'dashboard',
    setCurrentView: (view) => set({ currentView: view }),

    // Modals
    isCreateModalOpen: false,
    isFilesModalOpen: false,
    isMembersModalOpen: false,
    isSettingsModalOpen: false,
    isInviteModalOpen: false,
    isSpaceSettingsModalOpen: false,
    spaceSettingsTab: 'general',
    settingsTab: 'profile',

    // Confirmation Modal
    confirmationModal: {
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger', // danger, warning, info
        onConfirm: null,
    },

    // Modals
    createSpaceStep: 1,
    isCreateSpaceModalOpen: false,
    openCreateSpaceModal: () => set({ isCreateSpaceModalOpen: true, createSpaceStep: 1 }),
    closeCreateSpaceModal: () => set({ isCreateSpaceModalOpen: false }),

    isJoinByLinkModalOpen: false,
    openJoinByLinkModal: () => set({ isJoinByLinkModalOpen: true }),
    closeJoinByLinkModal: () => set({ isJoinByLinkModalOpen: false }),
    // Invite code pre-fill
    inviteCodeToJoin: '',
    setInviteCodeToJoin: (code) => set({ inviteCodeToJoin: code }),


    // Modal actions
    openCreateModal: () => set({ isCreateModalOpen: true }),
    closeCreateModal: () => set({ isCreateModalOpen: false }),

    openFilesModal: () => set({ isFilesModalOpen: true }),
    closeFilesModal: () => set({ isFilesModalOpen: false }),

    openMembersModal: () => set({ isMembersModalOpen: true }),
    closeMembersModal: () => set({ isMembersModalOpen: false }),

    openSettingsModal: () => set({ isSettingsModalOpen: true }),
    closeSettingsModal: () => set({ isSettingsModalOpen: false }),

    openInviteModal: () => set({ isInviteModalOpen: true }),
    closeInviteModal: () => set({ isInviteModalOpen: false }),

    openSpaceSettingsModal: () => set({ isSpaceSettingsModalOpen: true, spaceSettingsTab: 'general' }),
    closeSpaceSettingsModal: () => set({ isSpaceSettingsModalOpen: false }),
    setSpaceSettingsTab: (tab) => set({ spaceSettingsTab: tab }),
    setSpaceSettingsTab: (tab) => set({ spaceSettingsTab: tab }),
    setSettingsTab: (tab) => set({ settingsTab: tab }),

    // Profile Modal
    viewingProfileId: null,
    openProfileModal: (userId) => set({ viewingProfileId: userId }),
    closeProfileModal: () => set({ viewingProfileId: null }),

    // Join Session Modal
    isJoinSessionModalOpen: false,
    openJoinSessionModal: () => set({ isJoinSessionModalOpen: true }),
    closeJoinSessionModal: () => set({ isJoinSessionModalOpen: false }),

    // Session Device Settings (shared between join modal and session)
    sessionMicEnabled: true,
    sessionCameraEnabled: true,
    setSessionMicEnabled: (enabled) => set({ sessionMicEnabled: enabled }),
    setSessionCameraEnabled: (enabled) => set({ sessionCameraEnabled: enabled }),

    openConfirmation: (data) => set({
        confirmationModal: {
            isOpen: true,
            title: data.title || 'Are you sure?',
            message: data.message || '',
            confirmText: data.confirmText || 'Confirm',
            cancelText: data.cancelText || 'Cancel',
            type: data.type || 'danger',
            onConfirm: data.onConfirm,
        }
    }),
    closeConfirmation: () => set((state) => ({
        confirmationModal: { ...state.confirmationModal, isOpen: false }
    })),

    // Info Modal (for alerts/errors)
    infoModal: {
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // 'info', 'success', 'error'
    },
    openInfo: (data) => set({
        infoModal: {
            isOpen: true,
            title: data.title || 'Information',
            message: data.message || '',
            type: data.type || 'info',
        }
    }),
    closeInfo: () => set((state) => ({
        infoModal: { ...state.infoModal, isOpen: false }
    })),

    // Input Modal (for confirmation with text input)
    inputModal: {
        isOpen: false,
        title: '',
        message: '',
        inputLabel: '',
        inputPlaceholder: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: null,
    },
    openInputModal: (data) => set({
        inputModal: {
            isOpen: true,
            title: data.title || 'Input Required',
            message: data.message || '',
            inputLabel: data.inputLabel || '',
            inputPlaceholder: data.inputPlaceholder || '',
            confirmText: data.confirmText || 'Confirm',
            cancelText: data.cancelText || 'Cancel',
            type: data.type || 'danger',
            onConfirm: data.onConfirm,
        }
    }),
    closeInputModal: () => set((state) => ({
        inputModal: { ...state.inputModal, isOpen: false }
    })),

    // Create Space Flow
    createStep: 1,
    newSpaceName: '',
    newSpaceDescription: '',
    createdSpaceLink: '',

    setCreateStep: (step) => set({ createStep: step }),
    setNewSpaceName: (name) => set({ newSpaceName: name }),
    setNewSpaceDescription: (desc) => set({ newSpaceDescription: desc }),
    setCreatedSpaceLink: (link) => set({ createdSpaceLink: link }),

    resetCreateFlow: () => set({
        createStep: 1,
        newSpaceName: '',
        newSpaceDescription: '',
        createdSpaceLink: '',
        isCreateModalOpen: false,
    }),

    // Files
    viewingFile: null,
    fileFilter: 'all',

    setViewingFile: (file) => set({ viewingFile: file }),
    setFileFilter: (filter) => set({ fileFilter: filter }),

    // Settings
    settingsTab: 'general',
    setSettingsTab: (tab) => set({ settingsTab: tab }),

    // Unity/3D World
    unityLoadingProgress: 0,
    setUnityLoadingProgress: (progress) => set({ unityLoadingProgress: progress }),

    // Invite
    inviteStatus: 'idle',
    inviteEmail: '',

    setInviteStatus: (status) => set({ inviteStatus: status }),
    setInviteEmail: (email) => set({ inviteEmail: email }),

    // Theme
    themeColor: localStorage.getItem('collabspace_theme') || 'yellow',
    setThemeColor: (color) => {
        // Save to localStorage
        localStorage.setItem('collabspace_theme', color);
        // Apply to document
        document.documentElement.setAttribute('data-theme', color === 'yellow' ? '' : color);
        // Update state
        set({ themeColor: color });
    },
    // Initialize theme on load
    initTheme: () => {
        const saved = localStorage.getItem('collabspace_theme') || 'yellow';
        if (saved !== 'yellow') {
            document.documentElement.setAttribute('data-theme', saved);
        }
        set({ themeColor: saved });
    },
}));

export default useUIStore;
