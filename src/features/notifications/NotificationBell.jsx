import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsStore } from '../../store';
import NotificationsPanel from './NotificationsPanel';

export default function NotificationBell({ className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = React.useRef(null);
    const notifications = useNotificationsStore(state => state.notifications);
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className={`relative ${className}`}>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 relative hover-vibrate ${isOpen
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(168,85,247,1)] scale-110'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-black'
                    }`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <NotificationsPanel isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} />
        </div>
    );
}
