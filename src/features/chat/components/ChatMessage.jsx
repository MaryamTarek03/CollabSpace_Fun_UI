import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, useChatStore, useUIStore } from '../../../store';
import { getImageUrl, formatBytes } from '../../../shared/utils/helpers';
import { 
    Edit2, Trash2, Check, X, Reply, Forward, MoreVertical, Download,
    File, FileText, FileImage, FileAudio, FileVideo, FileCode, Archive 
} from 'lucide-react';

const getFileIcon = (mimeType, name) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
        return FileImage;
    }
    if (mimeType?.startsWith('video/') || ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) {
        return FileVideo;
    }
    if (mimeType?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
        return FileAudio;
    }
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) {
        return FileText;
    }
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
        return Archive;
    }
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cs', 'cpp', 'c', 'go'].includes(ext)) {
        return FileCode;
    }
    return File;
};


export default function ChatMessage({ msg, onForward }) {
    const { user: currentUser } = useAuthStore();
    const { updateMessage, deleteMessage, setReplyingTo } = useChatStore();
    const { openConfirmation, openProfileModal } = useUIStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const messageBubbleRef = useRef(null);
    const longPressTimer = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showMenu]);

    if (!msg) return null;

    // Support both formats: sender (backend) and user (legacy)
    const userName = msg.sender || msg.user || 'User';
    const senderId = msg.senderId || msg.userId;
    const time = msg.time || '';

    // Check if this message is from the current user
    const isMe = currentUser && senderId && senderId === currentUser.id;

    // Permissions
    const { activeChatSpace, members } = useChatStore();
    const isOwner = activeChatSpace?.ownerId === currentUser?.id;
    const isAdmin = members?.find(m => m.userId === currentUser?.id)?.role === 'Admin';

    // Time limit (15 mins)
    const isWithinTimeLimit = (Date.now() - new Date(msg.createdAt).getTime() < 15 * 60 * 1000);

    const canEdit = isMe && isWithinTimeLimit && !msg.forwardedFromChannel && !msg.isForwarded;
    const canDelete = canEdit || isOwner || isAdmin;

    // Avatar - use message avatar data directly (server already joins user data)
    const avatarImage = getImageUrl(msg.avatarImage);
    const avatarColor = msg.avatarColor || '#ec4899';
    const initials = (typeof userName === 'string' ? userName : String(userName || 'U'))
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    // Long press handlers
    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            setShowMenu(true);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleEdit = () => {
        setEditText(msg.text);
        setIsEditing(true);
        setShowMenu(false);
        // Auto-focus the edit input
        setTimeout(() => document.getElementById(`edit-input-${msg.id}`)?.focus(), 100);
    };

    const handleSave = async () => {
        if (editText.trim() !== msg.text) {
            await updateMessage(msg.id, editText, currentUser.id);
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        setShowMenu(false);
        openConfirmation({
            title: 'Delete Message',
            message: 'Are you sure you want to delete this message? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                await deleteMessage(msg.id, currentUser.id);
            }
        });
    };

    const handleReply = () => {
        setReplyingTo(msg);
        setShowMenu(false);
        // Auto-focus the chat input
        setTimeout(() => document.getElementById('chat-input')?.focus(), 100);
    };

    const handleForward = () => {
        onForward && onForward(msg);
        setShowMenu(false);
    };

    // System messages
    if (msg.type === 'system') {
        return (
            <div className="text-center text-sm text-gray-500 font-medium py-2">
                <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    {msg.text}
                </span>
            </div>
        );
    }

    // Deleted messages - show placeholder
    if (msg.isDeleted || msg.deletedAt) {
        const isDeletedByAuthor = msg.deletedByRole === 'author' || 
                                  !msg.deletedBy || 
                                  msg.deletedBy === msg.senderId ||
                                  msg.deletedBy === msg.sender ||
                                  (currentUser && msg.deletedBy === currentUser.id) ||
                                  isMe;

        const deletedLabel = isDeletedByAuthor
            ? 'This message was deleted'
            : `This message was removed by an administrator`;

        return (
            <div id={`msg-${msg.id}`} className={`flex gap-4 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''} animate-in fade-in duration-300 transition-all`}>
                <div className={`${isMe ? 'flex flex-col items-end' : ''} max-w-full`}>
                    <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="font-black text-sm text-gray-400">{isMe ? 'You' : userName}</span>
                        <span className="text-xs text-gray-400 font-bold">{time}</span>
                    </div>
                    <div className={`border-2 border-dashed border-gray-300 p-4 rounded-2xl bg-gray-50 ${isMe ? 'rounded-tl-2xl rounded-bl-2xl rounded-br-2xl' : 'rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'}`}>
                        <p className="text-gray-400 italic text-sm">{deletedLabel}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            id={`msg-${msg.id}`}
            className={`flex gap-4 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300 group relative transition-all`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        >
            {/* Avatar */}
            <div
                className="w-10 h-10 rounded-full border-2 border-black flex-shrink-0 flex items-center justify-center font-bold text-xs overflow-hidden"
                style={{ backgroundColor: avatarImage ? 'transparent' : avatarColor }}
            >
                {avatarImage ? (
                    <img src={avatarImage} alt={userName} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-white">{initials}</span>
                )}
            </div>

            {/* Message Content */}
            <div className={`${isMe ? 'flex flex-col items-end' : ''} max-w-full`}>
                <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="font-black text-sm">{isMe ? 'You' : userName}</span>
                    <span className="text-xs text-gray-500 font-bold">{time}</span>
                </div>

                <div className="relative w-fit" ref={menuRef}>
                    {isEditing ? (
                        <div className="flex gap-2 items-center w-full min-w-[200px]">
                            <input
                                id={`edit-input-${msg.id}`}
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 bg-white border-2 border-black rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') setIsEditing(false);
                                }}
                            />
                            <button onClick={handleSave} className="p-1 hover:bg-green-100 rounded text-green-600"><Check size={16} /></button>
                            <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-100 rounded text-red-600"><X size={16} /></button>
                        </div>
                    ) : (
                        <>
                            {/* Forwarded label */}
                            {(msg.isForwarded || msg.forwardedFrom || msg.forwardedFromChannel) && (
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 flex items-center gap-1.5 ml-1">
                                    <Forward size={12} className="text-gray-300" />
                                    <span>Forwarded from <span className="text-gray-500">#{msg.forwardedFromChannel || (typeof msg.forwardedFrom === 'object' ? msg.forwardedFrom?.name : msg.forwardedFrom) || 'Unknown'}</span></span>
                                </div>
                            )}
                            {/* Reply quote - clickable to jump to original */}
                            {msg.replyTo && (
                                <div
                                    onClick={() => {
                                        const el = document.getElementById(`msg-${msg.replyToId}`);
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            el.classList.add('ring-2', 'ring-accent', 'ring-offset-4', 'rounded-3xl');
                                            setTimeout(() => el.classList.remove('ring-2', 'ring-accent', 'ring-offset-4', 'rounded-3xl'), 2000);
                                        }
                                    }}
                                    className={`flex items-start gap-2 mb-2 p-2 rounded-xl border-2 border-l-4 cursor-pointer hover:bg-gray-50 transition-all ${msg.replyTo.deletedAt ? 'border-gray-300 border-l-gray-400 bg-gray-50' : 'border-gray-200 border-l-accent bg-white/80'}`}
                                >
                                    <Reply size={12} className={`mt-0.5 ${msg.replyTo.deletedAt ? 'text-gray-400 flex-shrink-0' : 'text-accent flex-shrink-0'}`} />
                                    <div className="flex-1 min-w-0">
                                        {msg.replyTo.deletedAt ? (
                                            <p className="text-xs text-gray-400 italic">Message deleted</p>
                                        ) : (
                                            <>
                                                <span className="text-xs font-bold text-accent block truncate">{msg.replyTo.sender}</span>
                                                <p className="text-xs text-gray-600 line-clamp-2 break-words">{msg.replyTo.text}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div ref={messageBubbleRef} className={`relative border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${isMe ? 'pr-10 bg-black text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(236,72,153,1)]' : 'pl-10 bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'} transition-all`}>
                                <p className="font-medium break-words">
                                    {msg.text.split(/(@\[[a-zA-Z]+\]|@\{[a-fA-F0-9-]+\}|@[a-zA-Z0-9_]+)/g).map((part, index) => {
                                        // Special mentions - @[keyword]
                                        if (part.startsWith('@[')) {
                                            const keyword = part.slice(2, -1).toLowerCase();

                                            if (keyword === 'everyone') {
                                                return <span key={index} className="font-black text-white bg-red-500 px-1 rounded mx-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-xs py-0.5">{part}</span>;
                                            }
                                            if (keyword === 'admins' || keyword === 'admin') {
                                                return <span key={index} className="font-black text-black bg-yellow-400 px-1 rounded mx-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-xs py-0.5">{part}</span>;
                                            }
                                            if (keyword === 'owner') {
                                                return <span key={index} className="font-black text-white bg-purple-500 px-1 rounded mx-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-xs py-0.5">{part}</span>;
                                            }
                                            return <span key={index} className="font-bold opacity-70">{part}</span>;
                                        }

                                        // User UUID mentions - @{uuid}
                                        if (part.startsWith('@{') && part.endsWith('}')) {
                                            const targetUserId = part.slice(2, -1);
                                            const mention = msg.mentions?.find(m => m.id === targetUserId);
                                            
                                            if (mention) {
                                                return (
                                                    <span
                                                        key={index}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openProfileModal(mention.id);
                                                        }}
                                                        className={`font-bold cursor-pointer hover:underline ${isMe ? 'text-pink-300' : 'text-accent'}`}
                                                    >
                                                        @{mention.displayName || mention.username}
                                                    </span>
                                                );
                                            }
                                            
                                            const member = members?.find(m => m.id === targetUserId || m.userId === targetUserId);
                                            if (member) {
                                                return (
                                                    <span
                                                        key={index}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openProfileModal(member.userId || member.id);
                                                        }}
                                                        className={`font-bold cursor-pointer hover:underline ${isMe ? 'text-pink-300' : 'text-accent'}`}
                                                    >
                                                        @{member.name || member.username}
                                                    </span>
                                                );
                                            }
                                            
                                            return <span key={index} className="font-bold opacity-70">@user</span>;
                                        }

                                        // User mentions - @username
                                        if (part.startsWith('@')) {
                                            const username = part.substring(1).toLowerCase();
                                            const member = members?.find(m =>
                                                m.username?.toLowerCase() === username ||
                                                m.name.replace(/\s+/g, '').toLowerCase() === username
                                            );

                                            if (member) {
                                                return (
                                                    <span
                                                        key={index}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openProfileModal(member.userId);
                                                        }}
                                                        className={`font-bold cursor-pointer hover:underline ${isMe ? 'text-pink-300' : 'text-accent'}`}
                                                    >
                                                        {part}
                                                    </span>
                                                );
                                            }
                                            return <span key={index} className="font-bold opacity-70">{part}</span>;
                                        }
                                        return part;
                                    })}
                                </p>

                                {/* Attachments */}
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-3 space-y-2 max-w-md">
                                        {msg.attachments.map((attachment, idx) => {
                                            const FileIconComponent = getFileIcon(attachment.mimeType || attachment.type, attachment.name);
                                            const sizeStr = formatBytes(attachment.size || attachment.sizeInBytes || 0);
                                            
                                            return (
                                                <a
                                                    key={idx}
                                                    href={attachment.downloadUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold ${
                                                        isMe 
                                                            ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' 
                                                            : 'bg-black/5 hover:bg-black/10 border-black/5 text-black'
                                                    }`}
                                                >
                                                    <FileIconComponent size={18} className="flex-shrink-0" />
                                                    <span className="truncate flex-1">
                                                        {attachment.name} <span className="opacity-70 font-medium">({sizeStr})</span>
                                                    </span>
                                                    <Download size={14} className="opacity-60 hover:opacity-100 flex-shrink-0 ml-1" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* 3-dots menu button inside message */}
                                <button
                                    ref={menuRef}
                                    onClick={() => setShowMenu(!showMenu)}
                                    className={`absolute top-2 p-1 rounded-lg transition-all ${isMe ? 'right-2 hover:bg-gray-800 text-gray-400 hover:text-white' : 'left-2 hover:bg-gray-100 text-gray-400 hover:text-black'}`}
                                >
                                    <MoreVertical size={14} />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Dropdown Menu - Fixed position portal */}
                    {showMenu && !isEditing && (
                        <div
                            className="fixed inset-0 z-[9999]"
                            onMouseDown={() => setShowMenu(false)}
                        >
                            <div
                                className={`absolute bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-w-[140px]`}
                                style={{
                                    bottom: window.innerHeight - (messageBubbleRef.current?.getBoundingClientRect().top || 0) + 8,
                                    left: isMe ? 'auto' : (messageBubbleRef.current?.getBoundingClientRect().left || 0) + 8,
                                    right: isMe ? (window.innerWidth - (messageBubbleRef.current?.getBoundingClientRect().right || 0) + 8) : 'auto',
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <button onMouseDown={(e) => { e.stopPropagation(); handleReply(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left font-medium text-sm">
                                    <Reply size={16} /> Reply
                                </button>
                                <button onMouseDown={(e) => { e.stopPropagation(); handleForward(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left font-medium text-sm border-t border-gray-100">
                                    <Forward size={16} /> Forward
                                </button>
                                {canEdit && (
                                    <button onMouseDown={(e) => { e.stopPropagation(); handleEdit(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left font-medium text-sm border-t border-gray-100">
                                        <Edit2 size={16} /> Edit
                                    </button>
                                )}
                                {canDelete && (
                                    <button onMouseDown={(e) => { e.stopPropagation(); handleDelete(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-left font-medium text-sm text-red-600 border-t border-gray-100">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
