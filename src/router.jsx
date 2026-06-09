import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store';

// Views
import DashboardView from './features/spaces/DashboardView';
import SpaceDetailsView from './features/spaces/SpaceDetailsView';
import ChatView from './features/chat/ChatView';
import TeamView from './features/members/TeamView';
import UnitySessionView from './features/session/UnitySessionView';
import AuthPage from './features/auth/AuthPage';
import InvitePage from './features/spaces/InvitePage';
import LandingPage from './features/landing/LandingPage';

// Layout wrapper that includes auth check
import AppLayout from './AppLayout';

/**
 * Protected Route wrapper - redirects to /login if not authenticated
 */
function ProtectedRoute() {
    const { isAuthenticated, authInitialized } = useAuthStore();

    // Show loading while checking auth
    if (!authInitialized) {
        return (
            <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-black border-t-yellow-300 rounded-full"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <AppLayout />;
}

/**
 * Public Route wrapper - redirects to /dashboard if already authenticated
 */
function PublicRoute({ children }) {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

/**
 * Router configuration
 */
export const router = createBrowserRouter([
    // Landing page - accessible to everyone
    {
        path: '/',
        element: <LandingPage />,
    },

    // Auth routes
    {
        path: '/login',
        element: (
            <PublicRoute>
                <AuthPage />
            </PublicRoute>
        ),
    },
    {
        path: '/invite/:code',
        element: <InvitePage />,
    },

    // Protected routes (require authentication)
    {
        path: '/dashboard',
        element: <ProtectedRoute />,
        children: [
            {
                index: true,
                element: <DashboardView />,
            },
            {
                path: 'spaces/:spaceId',
                element: <SpaceDetailsView />,
            },
            {
                path: 'chat',
                element: <ChatView />,
            },
            {
                path: 'chat/:spaceId',
                element: <ChatView />,
            },
            {
                path: 'chat/:spaceId/:channelId',
                element: <ChatView />,
            },
            {
                path: 'team',
                element: <TeamView />,
            },
            {
                path: 'session/:spaceId',
                element: <UnitySessionView />,
            },
        ],
    },

    // Catch-all redirect
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
