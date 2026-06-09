import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, MessageSquare, Users, Settings } from 'lucide-react';
import NavButton from './NavButton';
import { getAvatarProps } from '../utils/helpers';
import { useUIStore, useAuthStore } from '../../store';
import NotificationBell from '../../features/notifications/NotificationBell';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { openSettingsModal } = useUIStore();
    const { user } = useAuthStore();

    const { imageUrl, initials, backgroundColor } = getAvatarProps(user);

    // Determine active state from current path
    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-20 bg-white border-2 border-black rounded-full flex flex-col items-center py-8 z-40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hidden md:flex">
            <div
                onClick={() => navigate('/')}
                className="w-12 h-12 bg-accent border-2 border-black rounded-xl flex items-center justify-center text-xl font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] mb-8 transform hover:scale-110 hover:-rotate-6 active:scale-95 transition-transform cursor-pointer"
            >
                C
            </div>

            <div className="flex-1 w-full flex flex-col items-center gap-4">
                <NavButton
                    icon={<Grid size={20} />}
                    active={isActive('/')}
                    tooltip="Spaces"
                    onClick={() => navigate('/')}
                    iconClassName="hover:rotate-12"
                />
                <NavButton
                    icon={<MessageSquare size={20} />}
                    active={isActive('/chat')}
                    tooltip="Chat"
                    onClick={() => navigate('/chat')}
                />
                <NavButton
                    icon={<Users size={20} />}
                    active={isActive('/team')}
                    tooltip="Team"
                    onClick={() => navigate('/team')}
                />
            </div>

            <div className="flex flex-col items-center gap-3">
                <NotificationBell />

                <NavButton
                    icon={<Settings size={20} />}
                    tooltip="Settings"
                    onClick={openSettingsModal}
                    iconClassName="hover:rotate-90"
                />

                <button
                    onClick={openSettingsModal}
                    className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center hover:opacity-80 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 active:shadow-none overflow-hidden"
                    style={{ backgroundColor: imageUrl ? 'transparent' : backgroundColor }}
                    title={user?.name || 'User'}
                >
                    {imageUrl ? (
                        <img src={imageUrl} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-sm text-white">{initials}</span>
                    )}
                </button>
            </div>
        </aside>
    );
}

