import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Data
import { SPACE_TEMPLATES } from './data/spaceTemplates.js';

// Zustand Stores
import { useAuthStore, useSpacesStore, useUIStore, useNotificationsStore } from './store';

// Shared Components
import Sidebar from './shared/components/Sidebar';
import MobileNav from './shared/components/MobileNav';
import ConfirmationModal from './shared/components/ConfirmationModal';
import InfoModal from './shared/components/InfoModal';
import InputModal from './shared/components/InputModal';

// Feature: Spaces
import CreateSpaceModal from './features/spaces/CreateSpaceModal';
import SpaceSettingsModal from './features/spaces/SpaceSettingsModal';

// Feature: Files
import FilesModal from './features/files/FilesModal';
import FilePreviewModal from './features/files/FilePreviewModal';

// Feature: Members
import InviteModal from './features/members/InviteModal';
import MembersModal from './features/members/MembersModal';

// Feature: Settings
import SettingsModal from './features/settings/SettingsModal';

// Feature: Session
import JoinSessionModal from './features/session/JoinSessionModal';

import { JoinByLinkModal } from './features/spaces/JoinByLinkModal';
import UserProfileModal from './features/profile/UserProfileModal';
import { useSignalRIntegration } from './hooks/useSignalRIntegration';

/**
 * AppLayout - Main layout wrapper for authenticated routes
 * Contains sidebar, modals, and renders child routes via Outlet
 */
export default function AppLayout() {
    // Activate SignalR integration
    useSignalRIntegration();

    const { user } = useAuthStore();
    const { loading: spacesLoading, error: spacesError, fetchSpaces, fetchFavorites } = useSpacesStore();
    const { initTheme, viewingProfileId, closeProfileModal } = useUIStore();
    const { fetchNotifications } = useNotificationsStore();
    const location = useLocation();

    // Check if we're on dashboard route
    const isDashboard = location.pathname === '/';
    // Hide mobile nav inside active chat rooms to give room to the chat input
    const isChatRoom = location.pathname.startsWith('/dashboard/chat/');

    // Initialize theme on mount
    useEffect(() => {
        initTheme();
    }, [initTheme]);

    // Fetch spaces on mount
    useEffect(() => {
        fetchSpaces();
    }, [fetchSpaces]);

    // Fetch favorites when user changes
    useEffect(() => {
        if (user?.id) {
            fetchFavorites(user.id);
        }
    }, [user?.id, fetchFavorites]);

    // Fetch notifications when user changes
    useEffect(() => {
        if (user?.id) {
            fetchNotifications(user.id);
        }
    }, [user?.id, fetchNotifications]);

    return (
        <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-900 selection:bg-pink-300 selection:text-black relative overflow-x-hidden">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className={`md:ml-28 p-4 md:p-8 min-h-screen transition-all duration-300 ${isChatRoom ? 'pb-4' : 'pb-20 md:pb-8'}`}>

                {/* Loading State (only on dashboard) */}
                {spacesLoading && isDashboard && (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin w-12 h-12 border-4 border-black border-t-accent rounded-full"></div>
                    </div>
                )}

                {/* Error State (only on dashboard) */}
                {spacesError && isDashboard && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-4 text-red-700">
                        <p className="font-bold">⚠️ Could not connect to server</p>
                        <p className="text-sm">Using local data instead.</p>
                    </div>
                )}

                {/* Route Content - rendered by React Router */}
                {(!spacesLoading || !isDashboard) && <Outlet />}

            </main>

            {/* MODALS - all use stores directly */}
            <FilesModal />
            <InviteModal />
            <FilePreviewModal />
            <CreateSpaceModal spaceTemplates={SPACE_TEMPLATES} />
            <SettingsModal />
            <MembersModal />
            <SpaceSettingsModal />
            <JoinSessionModal />
            <ConfirmationModal />
            <InfoModal />
            <InputModal />
            <JoinByLinkModal />
            {viewingProfileId && (
                <UserProfileModal
                    userId={viewingProfileId}
                    viewerId={user?.id}
                    onClose={closeProfileModal}
                />
            )}

            {/* Mobile Navigation */}
            {!isChatRoom && <MobileNav />}

        </div>
    );
}
