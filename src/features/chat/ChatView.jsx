import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, ArrowLeft, X, Forward, Hash } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ChatSidebar from './components/ChatSidebar';
import { useChatStore, useSpacesStore, useAuthStore } from '../../store';
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

    const { spaces } = useSpacesStore();
    const { user } = useAuthStore();

    const messagesEndRef = useRef(null);
    const currentMessages = messages;

    // Set active chat space based on route param
    useEffect(() => {
        if (spaceId) {
            if (!activeChatSpace || activeChatSpace.id !== spaceId) {
                const space = spaces.find(s => s.id === spaceId);
                if (space) {
                    setActiveChatSpace(space);
                }
            }
        } else {
            setActiveChatSpace(null);
        }
    }, [spaceId, activeChatSpace, spaces, setActiveChatSpace]);

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

            <div className="flex-1 bg-white border-2 border-black rounded-3xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col relative">
                <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
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
                            className="lg:hidden p-2 hover:bg-white rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-bold text-lg overflow-hidden" style={getSpaceThumbnailStyle(activeChatSpace.thumbnail)}>
                            {isImageThumbnail(activeChatSpace.thumbnail) ? (
                                <img src={getSpaceThumbnailUrl(activeChatSpace.thumbnail)} alt={activeChatSpace.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>#</span>
                            )}
                        </div>
                        <div><h3 className="font-black text-lg">{activeChannel?.name || 'Select a channel'}</h3><p className="text-xs font-bold text-gray-500">{activeChannel?.description || activeChatSpace.name}</p></div>
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

