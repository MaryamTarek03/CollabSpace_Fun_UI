import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, User, MessageSquare, FileText, Zap, UserPlus, Loader2 } from 'lucide-react';
import { useNotificationsStore, useSpacesStore, useAuthStore } from '../../store';

const NOTIFICATION_ICONS = {
    invite: UserPlus,
    invite_response: UserPlus,
    join_request: UserPlus,
    mention: MessageSquare,
    session: Zap,
    file: FileText,
    system: Bell,
};

const NOTIFICATION_COLORS = {
    invite: 'bg-purple-100 text-purple-600',
    invite_response: 'bg-purple-100 text-purple-600',
    join_request: 'bg-blue-100 text-blue-600',
    mention: 'bg-blue-100 text-blue-600',
    session: 'bg-green-100 text-green-600',
    file: 'bg-accent-100 text-accent-600',
    system: 'bg-gray-100 text-gray-600',
};

function NotificationItem({ notification, onAcceptInvite, onDeclineInvite, onAcceptJoinRequest, onDeclineJoinRequest, onMarkRead }) {
    const [processing, setProcessing] = useState(null); // 'accept' | 'decline' | null
    const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
    const colorClass = NOTIFICATION_COLORS[notification.type] || 'bg-gray-100 text-gray-600';
    const isInvite = notification.type === 'invite';
    const isJoinRequest = notification.type === 'join_request';

    const spaces = useSpacesStore(state => state.spaces) || [];
    let resolvedSpaceId = notification.spaceId;
    if (!resolvedSpaceId && notification.text) {
        const nameMatch = notification.text.match(/space '([^']+)'/i) || notification.text.match(/space "([^"]+)"/i) || notification.text.match(/space ([\w\d\s_-]+)/i);
        if (nameMatch && nameMatch[1]) {
            const cleanName = nameMatch[1].trim().toLowerCase();
            const matchedSpace = spaces.find(s => s.name.toLowerCase() === cleanName);
            if (matchedSpace) {
                resolvedSpaceId = matchedSpace.id;
            }
        }
    }
    const resolvedRequestId = notification.requestId || notification.inviteId || notification.id;

    const showActions = (isInvite && (notification.inviteId || notification.spaceId)) || 
                        (isJoinRequest && resolvedSpaceId && resolvedRequestId);

    const handleAcceptClick = async () => {
        if (processing) return;
        setProcessing('accept');
        try {
            if (isInvite) {
                await onAcceptInvite(notification.inviteId || notification.spaceId, notification.id);
            } else if (isJoinRequest) {
                await onAcceptJoinRequest(resolvedSpaceId, resolvedRequestId, notification.id);
            }
        } catch (err) {
            console.error("Failed to accept:", err);
        } finally {
            setProcessing(null);
        }
    };

    const handleDeclineClick = async () => {
        if (processing) return;
        setProcessing('decline');
        try {
            if (isInvite) {
                await onDeclineInvite(notification.inviteId || notification.spaceId, notification.id);
            } else if (isJoinRequest) {
                await onDeclineJoinRequest(resolvedSpaceId, resolvedRequestId, notification.id);
            }
        } catch (err) {
            console.error("Failed to decline:", err);
        } finally {
            setProcessing(null);
        }
    };

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

                    {/* Action buttons */}
                    {showActions && !notification.read && (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleAcceptClick}
                                disabled={processing !== null}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-400 text-black text-xs font-bold rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-green-300 transition-all active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing === 'accept' ? (
                                    <>
                                        <Loader2 className="animate-spin" size={14} />
                                        Accepting...
                                    </>
                                ) : (
                                    <>
                                        <Check size={14} /> Accept
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDeclineClick}
                                disabled={processing !== null}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-400 text-black text-xs font-bold rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-red-300 transition-all active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing === 'decline' ? (
                                    <>
                                        <Loader2 className="animate-spin" size={14} />
                                        Declining...
                                    </>
                                ) : (
                                    <>
                                        <X size={14} /> Decline
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {!notification.read && !isInvite && !isJoinRequest && (
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

    const { approveRequest, rejectRequest, fetchSpaces, fetchSpaceRequests } = useSpacesStore();

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

    const resolveActualRequestId = async (spaceId, requestId, notificationId) => {
        if (requestId !== spaceId && requestId !== notificationId) {
            return requestId;
        }
        
        try {
            const requests = await fetchSpaceRequests(spaceId);
            const notification = notifications.find(n => n.id === notificationId);
            const authorName = notification?.author?.toLowerCase() || '';
            
            const matchingReq = (requests || []).find(req => {
                const status = (req.status || '').toLowerCase();
                if (status !== 'pending') return false;
                
                const uName = (req.userName || req.user?.displayName || req.user?.username || '').toLowerCase();
                return uName === authorName || 
                       authorName.includes(uName) ||
                       uName.includes(authorName);
            });
            
            if (matchingReq) {
                return matchingReq.id;
            }
            
            const firstPending = (requests || []).find(req => (req.status || '').toLowerCase() === 'pending');
            if (firstPending) {
                return firstPending.id;
            }
        } catch (err) {
            console.error("Error resolving actual request ID:", err);
        }
        
        return requestId;
    };

    const handleAcceptJoinRequest = async (spaceId, requestId, notificationId) => {
        try {
            const actualRequestId = await resolveActualRequestId(spaceId, requestId, notificationId);
            await approveRequest(spaceId, actualRequestId);
            await markAsRead(notificationId);
            fetchSpaces();
        } catch (err) {
            console.error("Failed to approve join request:", err);
        }
    };

    const handleDeclineJoinRequest = async (spaceId, requestId, notificationId) => {
        try {
            const actualRequestId = await resolveActualRequestId(spaceId, requestId, notificationId);
            await rejectRequest(spaceId, actualRequestId);
            await markAsRead(notificationId);
        } catch (err) {
            console.error("Failed to reject join request:", err);
        }
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
                        <div className="w-8 h-8 border-4 border-black border-t-accent rounded-full animate-spin"></div>
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
                            onAcceptJoinRequest={handleAcceptJoinRequest}
                            onDeclineJoinRequest={handleDeclineJoinRequest}
                            onMarkRead={markAsRead}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
