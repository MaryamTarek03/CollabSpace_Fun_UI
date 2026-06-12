import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Hash, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useChatStore, useAuthStore, useUIStore } from '../../../store';

export default function ChatSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { activeChatSpace, setActiveChatSpace, channels, activeChannel, setActiveChannel, createChannel, updateChannel, deleteChannel, members } = useChatStore();
    const { user } = useAuthStore();
    const { openConfirmation } = useUIStore();

    // Check if user is admin/owner
    const userMember = members?.find(m => m.userId === user?.id);
    const canManageChannels = activeChatSpace?.ownerId === user?.id || ['Admin', 'Owner'].includes(userMember?.role);

    // Local state for add/edit
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [channelName, setChannelName] = useState('');

    if (!activeChatSpace) return null;

    const handleAddChannel = async () => {
        if (!channelName.trim()) return;
        try {
            await createChannel(channelName.trim(), null, user.id);
            setChannelName('');
            setIsAdding(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateChannel = async (channelId) => {
        if (!channelName.trim()) return;
        try {
            await updateChannel(channelId, channelName.trim(), null);
            setEditingId(null);
            setChannelName('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteChannel = (channelId, channelNameToDelete) => {
        if (channels.length <= 1) return; // Prevent deleting last channel
        openConfirmation({
            title: 'Delete Channel',
            message: `Are you sure you want to delete #${channelNameToDelete}? All messages in this channel will be lost.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await deleteChannel(channelId);
                } catch (err) {
                    console.error(err);
                }
            }
        });
    };

    return (
        <div className="w-80 bg-white border-2 border-black rounded-3xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden hidden lg:flex flex-col">
            <div className="p-6 border-b-2 border-black bg-accent-50 flex items-center gap-2">
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
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-black truncate flex-1">{activeChatSpace.name}</h2>
            </div>

            {/* Channels Header */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Channels</span>
                {canManageChannels && (
                    <button
                        onClick={() => { setIsAdding(true); setChannelName(''); }}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black"
                        title="Add Channel"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
                {/* Add Channel Input */}
                {isAdding && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border-2 border-black">
                        <Hash size={16} className="text-gray-400" />
                        <input
                            type="text"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            placeholder="channel-name"
                            className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
                        />
                        <button onClick={handleAddChannel} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={14} /></button>
                        <button onClick={() => setIsAdding(false)} className="p-1 text-red-500 hover:bg-red-100 rounded"><X size={14} /></button>
                    </div>
                )}

                {channels.map(channel => (
                    <div
                        key={channel.id}
                        className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${activeChannel?.id === channel.id
                            ? 'bg-accent-100 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] font-bold'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                            }`}
                        onClick={() => editingId !== channel.id && setActiveChannel(channel)}
                    >
                        {editingId === channel.id ? (
                            <>
                                <Hash size={16} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={channelName}
                                    onChange={(e) => setChannelName(e.target.value)}
                                    className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateChannel(channel.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button onClick={() => handleUpdateChannel(channel.id)} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={14} /></button>
                                <button onClick={() => setEditingId(null)} className="p-1 text-red-500 hover:bg-red-100 rounded"><X size={14} /></button>
                            </>
                        ) : (
                            <>
                                <Hash size={16} className={activeChannel?.id === channel.id ? 'text-black' : 'text-gray-400'} />
                                <span className="flex-1 truncate">{channel.name}</span>
                                {canManageChannels && (
                                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingId(channel.id); setChannelName(channel.name); }}
                                            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        {channels.length > 1 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteChannel(channel.id, channel.name); }}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {channels.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        <p>No channels yet</p>
                        {canManageChannels && (
                            <button onClick={() => setIsAdding(true)} className="mt-2 text-accent font-bold hover:underline">
                                Create the first channel
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

