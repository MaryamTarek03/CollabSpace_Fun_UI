import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, User, MessageSquare, FileText, Zap, UserPlus } from 'lucide-react';
import { useNotificationsStore, useSpacesStore, useAuthStore } from '../../store';

const NOTIFICATION_ICONS = {
    invite: UserPlus,
    invite_response: UserPlus,
    mention: MessageSquare,
    session: Zap,
    file: FileText,
    system: Bell,
};

const NOTIFICATION_COLORS = {
    invite: 'bg-purple-100 text-purple-600',
    invite_response: 'bg-purple-100 text-purple-600',
    mention: 'bg-blue-100 text-blue-600',
    session: 'bg-green-100 text-green-600',
    file: 'bg-accent-100 text-accent-600',
    system: 'bg-gray-100 text-gray-600',
};

function NotificationItem({ notification, onAcceptInvite, onDeclineInvite, onMarkRead }) {
    const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
    const colorClass = NOTIFICATION_COLORS[notification.type] || 'bg-gray-100 text-gray-600';
    const isInvite = notification.type === 'invite';

    // Parse @{uuid} mentions in notification text
    const parseMentions = (text) => {
        if (!text) return '';
        const currentUser = useAuthStore.getState().user;
        const mentionRegex = /@\{([a-fA-F0-9-]+)\}/g;
        return text.replace(mentionRegex, (match, userId) => {
            if (currentUser && userId === currentUser.id) {
                return `@${currentUser.displayName || currentUser.username || 'you'}`;
            }
            return '@user';
        });
    };

    return (
        <div
            className={`p-3 rounded-xl border-2 transition-all ${notification.read
                ? 'border-gray-100 bg-gray-50 opacity-60'
                : 'border-black bg-white hover:bg-gray-50'
                }`}
        >
            <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm">
                        <span className="text-gray-600">{parseMentions(notification.text)}</span>{' '}
                        <span className="font-bold text-pink-600">{notification.target}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>

                    {/* Invite Actions */}
                    {isInvite && (notification.inviteId || notification.spaceId) && !notification.read && (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => onAcceptInvite(notification.inviteId || notification.spaceId, notification.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-400 text-black text-xs font-bold rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-green-300 transition-all active:shadow-none"
                            >
                                <Check size={14} /> Accept
                            </button>
                            <button
                                onClick={() => onDeclineInvite(notification.inviteId || notification.spaceId, notification.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg border-2 border-red-300 hover:bg-red-200 transition-all"
                            >
                                <X size={14} /> Decline
                            </button>
                        </div>
                    )}
                </div>

                {!notification.read && !isInvite && (
                    <button
                        onClick={() => onMarkRead(notification.id)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0"
                        title="Mark as read"
                    >
                        <Check size={12} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function NotificationsPanel({ isOpen, onClose, triggerRef }) {
    const panelRef = useRef(null);
    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        acceptInvite,
        declineInvite,
        getUnreadCount,
    } = useNotificationsStore();

    const { fetchSpaces } = useSpacesStore();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target) &&
                (!triggerRef?.current || !triggerRef.current.contains(e.target))
            ) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) return null;

    const handleAccept = async (inviteId, notificationId) => {
        const success = await acceptInvite(inviteId, notificationId);
        if (success) {
            fetchSpaces();
        }
    };

    const handleDecline = async (inviteId, notificationId) => {
        await declineInvite(inviteId, notificationId);
    };

    const unreadCount = getUnreadCount();

    return (
        <div
            ref={panelRef}
            className="fixed left-4 md:left-28 bottom-20 md:bottom-auto md:top-4 right-4 md:right-auto md:w-96 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-50 animate-in fade-in slide-in-from-left-2"
        >
            {/* Header */}
            <div className="p-4 border-b-2 border-black bg-accent-100 flex items-center justify-between">
                <h3 className="font-black text-lg flex items-center gap-2">
                    <Bell size={20} /> Notifications
                    {unreadCount > 0 && (
                        <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </h3>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-gray-600 hover:text-black transition-colors"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="h-[75vh] overflow-y-auto p-3 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-black border-t-yellow-300 rounded-full animate-spin"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="font-medium">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onAcceptInvite={handleAccept}
                            onDeclineInvite={handleDecline}
                            onMarkRead={markAsRead}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
