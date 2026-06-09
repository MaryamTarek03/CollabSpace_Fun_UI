import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Calendar, Users, UserPlus, ChevronDown, Loader } from 'lucide-react';
import api from '../../services/api';
import { formatDate, getImageUrl } from '../../shared/utils/helpers';
import { useSpacesStore, useUIStore } from '../../store';

export default function UserProfileModal({ userId, viewerId, onClose }) {
    const { spaces } = useSpacesStore();
    const { openInfo } = useUIStore();

    const [profile, setProfile] = useState(null);
    const [sharedSpaces, setSharedSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInviteDropdown, setShowInviteDropdown] = useState(false);
    const [invitingToSpace, setInvitingToSpace] = useState(null);

    // Get spaces the viewer can invite to (exclude spaces user is already in)
    // Get spaces the viewer can invite to (exclude spaces user is already in)
    const inviteableSpaces = spaces.filter(s => {
        // Check if viewer has permission to invite
        const viewerMember = s.members?.find(m => m.userId === viewerId);
        const isOwnerOrAdmin = viewerMember?.role === 'Owner' || viewerMember?.role === 'Admin';

        // Members can invite to public spaces, but only Admins/Owners to private spaces
        // Check visibility directly (handle potential serialization issues)
        const isPrivate = s.visibility === 'private';
        const hasPermission = !isPrivate || isOwnerOrAdmin;

        // Check if target user is NOT already a member
        const targetIsMember = s.members?.some(m => m.userId === userId);

        // Must be a member of the space (implied by viewerMember check) AND have permission
        return viewerMember && hasPermission && !targetIsMember;
    });

    const handleInvite = async (spaceId) => {
        setInvitingToSpace(spaceId);
        try {
            await api.members.inviteUser(spaceId, profile?.username || profile?.email || userId, viewerId);
            openInfo({
                title: 'Invite Sent!',
                message: `${profile?.name || 'User'} has been invited to the space.`,
                type: 'success'
            });
            setShowInviteDropdown(false);
        } catch (err) {
            console.error('Failed to invite:', err);
            openInfo({
                title: 'Invite Failed',
                message: err?.message || 'Could not send invite. They may already be invited or banned.',
                type: 'error'
            });
        } finally {
            setInvitingToSpace(null);
        }
    };

    useEffect(() => {
        if (!userId || !viewerId) return;

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const [profileData, spacesData] = await Promise.all([
                    api.users.getProfile(userId, viewerId),
                    api.users.getSharedSpaces(userId, viewerId).catch(err => {
                        console.warn('Failed to fetch shared spaces:', err);
                        return [];
                    })
                ]);
                setProfile(profileData);
                setSharedSpaces(spacesData);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId, viewerId]);

    if (!userId) return null;

    const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-accent-400 p-6 relative rounded-t-xl">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>

                    {/* Avatar */}
                    <div className="flex justify-center">
                        <div
                            className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-3xl font-black text-white shadow-lg"
                            style={{ backgroundColor: profile?.avatarColor || '#9ca3af' }}
                        >
                            {profile?.avatarImage ? (
                                <img
                                    src={getImageUrl(profile.avatarImage)}
                                    alt={profile?.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                initials
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : profile?.isPrivate ? (
                        /* Private Profile View */
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-black mb-1">{profile.name}</h3>
                            <p className="text-gray-500">@{profile.username}</p>
                            <p className="text-sm text-gray-400 mt-4">
                                {profile.reason === 'members_only'
                                    ? 'This profile is only visible to members of shared spaces.'
                                    : 'This profile is private.'}
                            </p>
                        </div>
                    ) : (
                        /* Public Profile View */
                        <div>
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black">{profile.name}</h3>
                                <p className="text-gray-500">@{profile.username}</p>
                            </div>

                            {profile.bio && (
                                <p className="text-gray-600 text-center mb-6 px-4">{profile.bio}</p>
                            )}

                            <div className="space-y-3 mb-6">
                                {profile.email && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail size={16} className="text-gray-400" />
                                        <span>{profile.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>Joined {formatDate(profile.createdAt)}</span>
                                </div>
                            </div>

                            {/* Invite to Space */}
                            {inviteableSpaces.length > 0 && userId !== viewerId && (
                                <div className="mb-6 relative">
                                    <button
                                        onClick={() => setShowInviteDropdown(!showInviteDropdown)}
                                        className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                                    >
                                        <UserPlus size={18} />
                                        Invite to Space
                                        <ChevronDown size={16} className={`transition-transform ${showInviteDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showInviteDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-48 overflow-y-auto z-10">
                                            {inviteableSpaces.map(space => (
                                                <button
                                                    key={space.id}
                                                    onClick={() => handleInvite(space.id)}
                                                    disabled={invitingToSpace === space.id}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex-shrink-0"
                                                        style={{ background: space.thumbnail || '#e5e7eb' }}
                                                    />
                                                    <span className="font-medium text-sm truncate flex-1">{space.name}</span>
                                                    {invitingToSpace === space.id ? (
                                                        <Loader size={16} className="animate-spin text-pink-500" />
                                                    ) : (
                                                        <UserPlus size={16} className="text-pink-500" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Shared Spaces */}
                            {sharedSpaces.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Users size={14} />
                                        Shared Spaces ({sharedSpaces.length})
                                    </h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {sharedSpaces.map(space => (
                                            <div
                                                key={space.id}
                                                className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg flex-shrink-0"
                                                    style={{ background: space.thumbnailGradient || '#e5e7eb' }}
                                                />
                                                <span className="font-medium text-sm truncate flex-1">{space.name}</span>
                                                {space.category && (
                                                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                                                        {space.category}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
