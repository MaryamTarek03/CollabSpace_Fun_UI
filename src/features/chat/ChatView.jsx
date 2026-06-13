import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, ArrowLeft, X, Forward, Hash, Menu, Files, Users, UserPlus, Settings } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ChatSidebar from './components/ChatSidebar';
import { useChatStore, useSpacesStore, useAuthStore, useUIStore } from '../../store';
import ModalWrapper from '../../shared/components/ModalWrapper';
import api from '../../services/api';
import { isImageThumbnail, getSpaceThumbnailStyle, getSpaceThumbnailUrl } from '../../shared/utils/helpers';

export default function ChatView() {
    const { spaceId, channelId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get state directly from stores
    const {
        activeChatSpace,
        setActiveChatSpace,
        activeChannel,
        setActiveChannel,
        channels,
        sendMessage,
        forwardMessage,
        messages,
        members
    } = useChatStore();

    const { spaces, activeSpace, setActiveSpace } = useSpacesStore();
    const { user } = useAuthStore();
    const {
        openFilesModal,
        openMembersModal,
        openInviteModal,
        openSpaceSettingsModal
    } = useUIStore();

    const messagesEndRef = useRef(null);
    const currentMessages = messages;

    // Mobile sidebar state
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Set active chat space based on route param and load full space details in background
    useEffect(() => {
        if (spaceId) {
            // Find space locally first for responsive loading
            const space = spaces.find(s => s.id === spaceId);
            if (space) {
                if (!activeChatSpace || activeChatSpace.id !== spaceId) {
                    setActiveChatSpace(space);
                }
                if (!activeSpace || activeSpace.id !== spaceId) {
                    setActiveSpace(space);
                }
            }

            // Fetch full space details in background to sync for space-bound modals (Members, Settings, Files)
            const loadFullSpace = async () => {
                try {
                    const [fullSpace, files] = await Promise.all([
                        api.spaces.getById(spaceId),
                        api.files.getBySpace(spaceId).catch(() => [])
                    ]);
                    
                    if (fullSpace) {
                        const membersList = fullSpace.members || [];
                        const resolvedFiles = (files || []).map(file => {
                            if (file.uploaderName === 'Unknown' || !file.uploaderName) {
                                const uploaderId = file.uploadedBy;
                                const uploader = membersList.find(m => m.id === uploaderId);
                                if (uploader) {
                                    return { ...file, uploaderName: uploader.name || uploader.username };
                                }
                            }
                            return file;
                        });
                        setActiveSpace({
                            ...fullSpace,
                            files: resolvedFiles
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch full space details in chat view:", err);
                }
            };
            
            loadFullSpace();
        } else {
            setActiveChatSpace(null);
            setActiveSpace(null);
        }
    }, [spaceId, spaces, setActiveChatSpace, setActiveSpace]);

    // Set active channel based on route param
    useEffect(() => {
        if (channelId && channels.length > 0 && (!activeChannel || activeChannel.id !== channelId)) {
            const channel = channels.find(c => c.id === channelId);
            if (channel) {
                setActiveChannel(channel);
            }
        }
    }, [channelId, channels, activeChannel, setActiveChannel]);

    // Forward modal state
    const [forwardingMessage, setForwardingMessage] = useState(null);

    // Attachment state
    const [isUploading, setIsUploading] = useState(false);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    const handleSendMessage = async (text, files) => {
        const hasContent = text.trim() || files.length > 0;
        if (!hasContent || !activeChatSpace) return false;

        setIsUploading(true);

        try {
            // Extract user mentions - @username (excluding bracket patterns)
            const userMentionMatches = text.match(/@([a-zA-Z0-9_]+)/g) || [];
            const mentions = [];

            userMentionMatches.forEach(match => {
                const username = match.substring(1).toLowerCase();
                const member = members.find(m =>
                    (m.username?.toLowerCase() === username) ||
                    (m.name.replace(/\s+/g, '').toLowerCase() === username)
                );
                if (member && !mentions.includes(member.userId)) {
                    mentions.push(member.userId);
                }
            });

            // Extract special mentions - @[keyword]
            const specialMentionMatches = text.match(/@\[([a-zA-Z]+)\]/g) || [];
            const specialKeywords = specialMentionMatches.map(m => m.slice(2, -1).toLowerCase());

            const mentionEveryone = specialKeywords.includes('everyone');
            const mentionAdmins = specialKeywords.includes('admins') || specialKeywords.includes('admin');
            const mentionOwner = specialKeywords.includes('owner');

            const mentionRoles = [];
            if (mentionAdmins) mentionRoles.push('Admin', 'Owner');
            if (mentionOwner) mentionRoles.push('Owner');

            const messageData = {
                senderId: user?.id,
                text: text || '',
                type: 'user',
                mentions: mentions,
                mentionEveryone,
                mentionRoles: mentionRoles.length > 0 ? [...new Set(mentionRoles)] : undefined,
                files: files
            };

            await sendMessage(messageData);
            return true;
        } catch (err) {
            console.error('Failed to send message:', err);
            return false;
        } finally {
            setIsUploading(false);
        }
    };

    const handleForward = async (targetChannelId) => {
        if (!forwardingMessage) return;
        try {
            await forwardMessage(forwardingMessage.id, targetChannelId, user?.id);
            setForwardingMessage(null);

            // Focus the target channel
            const targetChannel = channels.find(c => c.id === targetChannelId);
            if (targetChannel) {
                setActiveChannel(targetChannel);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Calculate permissions for quick actions based on activeSpace
    const activeSpaceMembers = activeSpace?.members || members || [];
    const currentUserMember = activeSpaceMembers.find(m => m.userId === user?.id || m.id === user?.id);
    const userRole = currentUserMember?.role || null;
    const isOwner = userRole === 'Owner' || activeSpace?.ownerId === user?.id;
    const isAdmin = userRole === 'Admin';
    const canAccessSettings = isOwner || isAdmin;
    const isPrivate = activeSpace?.visibility === 'private';
    const canInvite = !isPrivate || canAccessSettings;

    // Chat Lobby - No active space selected
    if (!activeChatSpace) {
        return (
            <div className="h-[calc(100vh-4rem)] flex flex-col items-center py-8 max-w-4xl mx-auto overflow-hidden">
                <div className="text-center mb-8 flex-shrink-0">
                    <div className="w-20 h-20 bg-accent border-4 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><MessageSquare size={32} /></div>
                    <h2 className="text-4xl font-black text-gray-900 mb-2">Jump into Chat</h2>
                    <p className="text-gray-500 text-lg font-medium">Choose a space to start chatting.</p>
                </div>
                <div className="flex-1 overflow-y-auto w-full px-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pb-4">
                        {spaces.map(space => (
                            <button key={space.id} onClick={() => navigate(`/dashboard/chat/${space.id}`)} className="flex items-center gap-4 p-4 bg-white border-2 border-black rounded-2xl hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-left group">
                                <div className="w-12 h-12 rounded-xl border-2 border-black flex-shrink-0 overflow-hidden" style={getSpaceThumbnailStyle(space.thumbnail)}>
                                    {isImageThumbnail(space.thumbnail) && (
                                        <img src={getSpaceThumbnailUrl(space.thumbnail)} alt={space.name} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg group-hover:text-pink-600 transition-colors truncate">{space.name}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase">{space.category}</p>
                                </div>
                                <ArrowLeft size={20} className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Active Chat View
    return (
        <div className="h-[calc(100vh-4rem)] flex gap-6">
            <ChatSidebar />

            {/* Mobile Sidebar/Drawer overlay */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                    <div className="relative w-80 max-w-[calc(100vw-3rem)] h-full bg-[#FFFDF5] border-r-2 border-black flex flex-col z-10 shadow-[4px_0px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-left duration-200">
                        <ChatSidebar isMobile={true} onClose={() => setIsMobileSidebarOpen(false)} />
                    </div>
                </div>
            )}

            <div className="flex-1 bg-white border-2 border-black rounded-3xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative">
                <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-50 gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button 
                            onClick={() => {
                                const spaceId = activeChatSpace?.id;
                                setActiveChatSpace(null);
                                if (location.state?.fromSpace && spaceId) {
                                    navigate(`/dashboard/spaces/${spaceId}`);
                                } else {
                                    navigate('/dashboard/chat');
                                }
                            }} 
                            className="lg:hidden p-2 hover:bg-white rounded-lg border-2 border-transparent hover:border-black transition-all shrink-0"
                            title="Back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        
                        {/* Hamburger Menu button on mobile */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-white rounded-lg border-2 border-transparent hover:border-black transition-all shrink-0"
                            title="Open Channels"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-bold text-lg overflow-hidden shrink-0" style={getSpaceThumbnailStyle(activeChatSpace.thumbnail)}>
                            {isImageThumbnail(activeChatSpace.thumbnail) ? (
                                <img src={getSpaceThumbnailUrl(activeChatSpace.thumbnail)} alt={activeChatSpace.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>#</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-black text-lg truncate">
                                {activeChannel ? `#${activeChannel.name}` : 'Select a channel'}
                            </h3>
                            <p className="text-xs font-bold text-gray-500 truncate">
                                {activeChannel?.description || activeChatSpace.name}
                            </p>
                        </div>
                    </div>

                    {/* Quick Space Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={openFilesModal}
                            className="p-2 bg-white hover:bg-accent-100 border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center shrink-0"
                            title="Files"
                        >
                            <Files size={18} />
                        </button>
                        <button
                            onClick={openMembersModal}
                            className="p-2 bg-white hover:bg-accent-100 border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center shrink-0"
                            title="Members"
                        >
                            <Users size={18} />
                        </button>
                        {canInvite && (
                            <button
                                onClick={openInviteModal}
                                className="p-2 bg-white hover:bg-accent-100 border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center shrink-0"
                                title="Invite Members"
                            >
                                <UserPlus size={18} />
                            </button>
                        )}
                        {canAccessSettings && (
                            <button
                                onClick={openSpaceSettingsModal}
                                className="p-2 bg-white hover:bg-accent-100 border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center shrink-0"
                                title="Space Settings"
                            >
                                <Settings size={18} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    {currentMessages.map((msg) => (
                        <ChatMessage key={msg.id} msg={msg} onForward={setForwardingMessage} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <ChatInput
                    onSendMessage={handleSendMessage}
                    spaceName={activeChannel?.name || activeChatSpace.name}
                    isSending={isUploading}
                />
            </div>

            {/* Forward Modal */}
            {forwardingMessage && (
                <ModalWrapper
                    isOpen={!!forwardingMessage}
                    onClose={() => setForwardingMessage(null)}
                    showCloseButton={true}
                    size="md"
                >
                    <div className="p-6">
                        <h3 className="text-2xl font-black mb-6">Forward Message</h3>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-black/5 flex gap-3">
                            <div className="w-1 h-full bg-accent rounded-full shrink-0"></div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-accent mb-1">{forwardingMessage.sender}</p>
                                <p className="text-sm font-medium truncate text-gray-700">{forwardingMessage.text}</p>
                            </div>
                        </div>

                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Forward to...</p>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {channels.filter(c => c.id !== activeChannel?.id).map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => handleForward(channel.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-black hover:bg-gray-50 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-black transition-colors border-2 border-transparent group-hover:border-black">
                                        <Hash size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 group-hover:text-black truncate">#{channel.name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{channel.description || 'No description'}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                                        <Forward size={16} />
                                    </div>
                                </button>
                            ))}
                            {channels.filter(c => c.id !== activeChannel?.id).length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <Hash size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-gray-500 font-bold">No other channels</p>
                                    <p className="text-xs text-gray-400">Create more channels to forward messages</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
}

