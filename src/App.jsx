import React, { useEffect } from 'react';

// Data
import { SPACE_TEMPLATES } from './data/mockData.jsx';

// Zustand Stores
import { useAuthStore, useSpacesStore, useChatStore, useUIStore, useNotificationsStore } from './store';

// Shared Components
import Sidebar from './shared/components/Sidebar';
import MobileNav from './shared/components/MobileNav';
import ConfirmationModal from './shared/components/ConfirmationModal';
import InfoModal from './shared/components/InfoModal';
import InputModal from './shared/components/InputModal';

// Feature: Auth
import AuthPage from './features/auth/AuthPage';

// Feature: Spaces
import DashboardView from './features/spaces/DashboardView';
import SpaceDetailsView from './features/spaces/SpaceDetailsView';
import CreateSpaceModal from './features/spaces/CreateSpaceModal';
import SpaceSettingsModal from './features/spaces/SpaceSettingsModal';

// Feature: Chat
import ChatView from './features/chat/ChatView';

// Feature: Files
import FilesModal from './features/files/FilesModal';
import FilePreviewModal from './features/files/FilePreviewModal';

// Feature: Members
import InviteModal from './features/members/InviteModal';
import MembersModal from './features/members/MembersModal';
import TeamView from './features/members/TeamView';

// Feature: Settings
import SettingsModal from './features/settings/SettingsModal';

// Feature: Session (3D World)
import UnitySessionView from './features/session/UnitySessionView';
import JoinSessionModal from './features/session/JoinSessionModal';

import { JoinByLinkModal } from './features/spaces/JoinByLinkModal';
import UserProfileModal from './features/profile/UserProfileModal';

export default function App() {
  // --- Zustand Stores ---
  const {
    user,
    isAuthenticated,
    login,
    register,
    loading: authLoading,
    error: authError,
    initialize: initAuth,
  } = useAuthStore();

  const {
    activeSpace,
    loading: spacesLoading,
    error: spacesError,
    fetchSpaces,
    fetchFavorites,
  } = useSpacesStore();

  const { currentView, unityLoadingProgress, setCurrentView, initTheme, viewingProfileId, closeProfileModal } = useUIStore();

  // --- Effects ---

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Fetch spaces on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchSpaces();
    }
  }, [isAuthenticated, fetchSpaces]);

  // Fetch favorites when user changes
  useEffect(() => {
    if (user?.id) {
      fetchFavorites(user.id);
    }
  }, [user?.id, fetchFavorites]);

  // Fetch notifications when user changes
  const { fetchNotifications } = useNotificationsStore();
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id, fetchNotifications]);

  // --- Render ---

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={login}
        onRegister={register}
        loading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-900 selection:bg-pink-300 selection:text-black relative overflow-x-hidden">

      {/* Sidebar - uses stores directly */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="md:ml-28 p-4 md:p-8 pb-20 md:pb-8 min-h-screen transition-all duration-300">

        {/* Loading State */}
        {spacesLoading && currentView === 'dashboard' && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-black border-t-yellow-300 rounded-full"></div>
          </div>
        )}

        {/* Error State */}
        {spacesError && currentView === 'dashboard' && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-4 text-red-700">
            <p className="font-bold">⚠️ Could not connect to server</p>
            <p className="text-sm">Using local data instead.</p>
          </div>
        )}

        {/* VIEW: DASHBOARD - uses stores directly */}
        {currentView === 'dashboard' && !spacesLoading && <DashboardView />}

        {/* VIEW: SPACE DETAILS - uses stores directly */}
        {currentView === 'space-details' && activeSpace && <SpaceDetailsView />}

        {/* VIEW: CHAT - uses stores directly */}
        {currentView === 'chat' && <ChatView />}

        {/* VIEW: TEAM */}
        {currentView === 'team' && <TeamView />}

        {/* VIEW: UNITY SESSION */}
        {currentView === 'unity-view' && (
          <UnitySessionView
            loadingProgress={unityLoadingProgress}
            onLeave={() => setCurrentView('space-details')}
          />
        )}

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
      <JoinSessionModal />
      <JoinByLinkModal />
      {viewingProfileId && (
        <UserProfileModal
          userId={viewingProfileId}
          viewerId={user?.id}
          onClose={closeProfileModal}
        />
      )}

      {/* Toast Notifications */}
      <MobileNav />

    </div>
  );
}