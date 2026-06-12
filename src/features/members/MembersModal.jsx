import React, { useState, useEffect, useRef } from 'react';
import { X, UserCog, Trash2, Check, Loader, Ban, Send, ChevronDown, Crown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUIStore, useSpacesStore, useAuthStore } from '../../store';
import api from '../../services/api';
import UserProfileModal from '../profile/UserProfileModal';
import ModalWrapper from '../../shared/components/ModalWrapper';
import Button, { CloseButton, IconButton } from '../../shared/components/Button';
import Avatar from '../../shared/components/Avatar';
import { ADMIN_ROLES } from '../../shared/constants';

function RoleDropdown({ value, onChange, disabled, canManageMembers, isOwner, isOpen, onToggle }) {
    if (value === 'Owner') {
        return (
            <span className="px-3 py-1 bg-yellow-100 border-2 border-black rounded-lg text-xs font-bold text-black uppercase shrink-0 flex items-center gap-1">
                Owner <Crown size={12} className="text-yellow-600 fill-yellow-600 shrink-0" />
            </span>
        );
    }

    if (!canManageMembers || disabled) {
        return (
            <span className="px-3 py-1 bg-gray-100 border-2 border-gray-300 rounded-lg text-xs font-bold text-gray-500 capitalize shrink-0">
                {value}
            </span>
        );
    }

    const roles = [
        { value: 'Admin', label: 'Admin' },
        { value: 'Member', label: 'Member' }
    ];
    if (isOwner) {
        roles.push({ value: 'TRANSFER_OWNERSHIP', label: 'Make Owner', icon: Crown });
    }

    const currentLabel = roles.find(r => r.value === value)?.label || value;

    return (
        <div className="relative min-w-[110px] shrink-0">
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(!isOpen);
                }}
                className={`w-full flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${isOpen ? 'ring-2 ring-purple-300' : ''}`}
            >
                <span className="truncate mr-1">{currentLabel}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-[130px] bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {roles.map((role) => {
                        const RoleIcon = role.icon;
                        return (
                            <button
                                key={role.value}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(role.value);
                                    onToggle(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between hover:bg-purple-50 transition-colors ${value === role.value ? 'bg-purple-100 text-purple-900' : 'text-gray-700'}`}
                            >
                                <span className="flex items-center gap-1">
                                    {RoleIcon && <RoleIcon size={12} className="text-yellow-600 fill-yellow-500 shrink-0" />}
                                    {role.label}
                                </span>
                                {value === role.value && <Check size={12} className="text-purple-600 ml-1 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function MembersModal() {
    const { isMembersModalOpen, closeMembersModal, openConfirmation, openInputModal } = useUIStore();
    const { activeSpace, setActiveSpace, spaces, fetchSpaceRequests, approveRequest, rejectRequest } = useSpacesStore();
    const { user } = useAuthStore();

    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);
    const [inviteError, setInviteError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [viewingProfileId, setViewingProfileId] = useState(null);
    const [activeTab, setActiveTab] = useState('members');
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [activeDropdownMemberId, setActiveDropdownMemberId] = useState(null);

    // Close open role dropdowns on tab changes or modal close
    useEffect(() => {
        setActiveDropdownMemberId(null);
    }, [activeTab, isMembersModalOpen]);

    // Load requests when tab changes
    useEffect(() => {
        if (isMembersModalOpen && activeTab === 'requests' && activeSpace) {
            loadRequests();
        }
    }, [isMembersModalOpen, activeTab, activeSpace]);

    const loadRequests = async () => {
        setLoadingRequests(true);
        try {
            const data = await fetchSpaceRequests(activeSpace.id);
            setRequests(data);
        } catch (err) {
            console.error('Failed to load requests');
        } finally {
            setLoadingRequests(false);
        }
    };

    if (!isMembersModalOpen || !activeSpace) return null;

    const currentUserMember = activeSpace.members?.find(m => m.userId === user?.id);
    const canManageMembers = ADMIN_ROLES.includes(currentUserMember?.role);
    const isPrivate = activeSpace.visibility === 'private';
    const canInvite = !isPrivate || canManageMembers;

    const updateSpaceMembers = (updatedMembers) => {
        const updatedSpaces = spaces.map(s =>
            s.id === activeSpace.id ? { ...s, members: updatedMembers } : s
        );
        useSpacesStore.setState({ spaces: updatedSpaces });
        const updated = updatedSpaces.find(s => s.id === activeSpace.id);
        if (updated) setActiveSpace(updated);
    };

    const handleRoleChange = async (memberId, newRole) => {
        const originalMember = activeSpace.members?.find(m => m.id === memberId);
        const originalRole = originalMember?.role;

        // Optimistic UI update
        const updatedMembers = activeSpace.members?.map(m =>
            m.id === memberId ? { ...m, role: newRole } : m
        ) || [];
        updateSpaceMembers(updatedMembers);

        try {
            await api.members.updateRole(activeSpace.id, memberId, newRole);
        } catch (err) {
            console.error('Failed to update member role:', err);
            // Revert state
            const revertedMembers = activeSpace.members?.map(m =>
                m.id === memberId ? { ...m, role: originalRole } : m
            ) || [];
            updateSpaceMembers(revertedMembers);
        }
    };



    const handleInvite = async () => {
        const value = inviteEmail.trim();
        if (!value) {
            setErrorMessage('Please enter an email or username');
            setInviteError(true);
            setTimeout(() => { setInviteError(false); setErrorMessage(''); }, 3000);
            return;
        }

        const isEmail = value.includes('@');
        if (isEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setErrorMessage('Please enter a valid email address');
                setInviteError(true);
                setTimeout(() => { setInviteError(false); setErrorMessage(''); }, 3000);
                return;
            }
        } else {
            const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/;
            if (!usernameRegex.test(value)) {
                setErrorMessage('Username must be 3-30 chars (letters, numbers, _, ., -)');
                setInviteError(true);
                setTimeout(() => { setInviteError(false); setErrorMessage(''); }, 3000);
                return;
            }
        }

        setIsInviting(true);
        setInviteSuccess(false);
        setInviteError(false);
        setErrorMessage('');
        try {
            await api.members.invite(activeSpace.id, {
                emails: [value],
                inviterName: user?.name,
                inviterId: user?.id
            });
            setInviteEmail('');
            setInviteSuccess(true);
            setTimeout(() => setInviteSuccess(false), 4000);
        } catch (err) {
            console.error('Failed to invite:', err);
            setInviteError(true);
            setErrorMessage('Failed to send invite');
            setTimeout(() => { setInviteError(false); setErrorMessage(''); }, 3000);
        } finally {
            setIsInviting(false);
        }
    };

    const handleTransferOwnership = async (newOwnerId) => {
        try {
            await useSpacesStore.getState().transferOwnership(activeSpace.id, user.id, newOwnerId);
            closeMembersModal();
        } catch (err) {
            console.error('Failed to transfer ownership:', err);
        }
    };

    const handleKick = (memberId) => {
        const memberName = activeSpace.members?.find(m => m.id === memberId)?.name || 'this member';
        openConfirmation({
            title: 'Remove Member?',
            message: `Remove ${memberName} from the space? They will lose access immediately.`,
            confirmText: 'Remove',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.members.remove(activeSpace.id, memberId);
                    updateSpaceMembers(activeSpace.members?.filter(m => m.id !== memberId) || []);
                } catch (err) {
                    console.error('Failed to remove member:', err);
                }
            }
        });
    };

    const handleBan = (memberId) => {
        const member = activeSpace.members?.find(m => m.id === memberId);
        openInputModal({
            title: 'Ban Member?',
            message: `Ban ${member?.name}? They cannot rejoin this space.`,
            inputLabel: 'Reason (optional)',
            inputPlaceholder: 'Why are you banning this member?',
            confirmText: 'Ban',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async (reason) => {
                try {
                    await api.members.ban(activeSpace.id, memberId, user.id, reason || null);
                    updateSpaceMembers(activeSpace.members?.filter(m => m.id !== memberId) || []);
                } catch (err) {
                    console.error('Failed to ban member:', err);
                }
            }
        });
    };

    const handleApprove = async (requestId) => {
        try {
            await approveRequest(activeSpace.id, requestId);
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error('Failed to approve', err);
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectRequest(activeSpace.id, requestId);
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error('Failed to reject', err);
        }
    };

    return (
        <>
            <ModalWrapper isOpen={isMembersModalOpen} onClose={closeMembersModal} size="lg" zLevel="medium">
                {/* Header */}
                <div className="p-6 border-b-2 border-black bg-purple-50 flex justify-between items-center rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-black flex items-center gap-2"><UserCog size={24} /> Manage Members</h2>
                        <p className="text-xs font-bold text-gray-500 uppercase">Space: {activeSpace.name}</p>
                    </div>
                    <CloseButton onClick={closeMembersModal} />
                </div>

                {/* Tabs */}
                {canManageMembers && (
                    <div className="px-6 pt-4 flex gap-2 border-b-2 border-black bg-purple-50/50">
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-xl border-2 border-black border-b-0 transition-all ${
                                activeTab === 'members'
                                    ? 'bg-yellow-300 -mb-[2px] z-10 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            Members ({activeSpace.members?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-2 font-bold text-sm rounded-t-xl border-2 border-black border-b-0 transition-all ${
                                activeTab === 'requests'
                                    ? 'bg-yellow-300 -mb-[2px] z-10 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            Requests {activeSpace.requestsCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-black">{activeSpace.requestsCount}</span>}
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 max-h-[400px] bg-purple-50/10">
                    {activeTab === 'members' && (
                        <>
                            {/* Invite Input */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && canInvite && handleInvite()}
                                    placeholder={!canInvite ? "Invites restricted to admins" : "email or username..."}
                                    disabled={!canInvite}
                                    className="flex-1 border-2 border-black rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-purple-300 disabled:bg-gray-100 disabled:text-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                />
                                <Button
                                    onClick={handleInvite}
                                    disabled={!inviteEmail || isInviting || !canInvite}
                                    variant={inviteSuccess ? 'success' : inviteError ? 'danger' : 'warning'}
                                    className="shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                                    icon={isInviting ? <Loader className="animate-spin" /> : inviteSuccess ? <Check size={18} /> : <Send />}
                                >
                                    {isInviting ? 'Sending...' : inviteSuccess ? 'Sent!' : 'Invite'}
                                </Button>
                            </div>

                            {errorMessage && (
                                <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold rounded-xl p-3 mb-4 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-1">
                                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {inviteSuccess && (
                                <div className="bg-green-50 border-2 border-green-500 text-green-700 text-xs font-bold rounded-xl p-3 mb-4 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-1">
                                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                    <span>Invite sent successfully!</span>
                                </div>
                            )}

                            {/* Members List */}
                            <div className="space-y-4 relative">
                                {activeDropdownMemberId && (
                                    <div
                                        className="fixed inset-0 z-20 cursor-default"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownMemberId(null);
                                        }}
                                    />
                                )}
                                {activeSpace.members?.map(member => {
                                    const isDropdownOpen = activeDropdownMemberId === member.id;
                                    return (
                                        <div
                                            key={member.id}
                                            onClick={() => setViewingProfileId(member.userId)}
                                            className={`flex items-center justify-between bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all ${isDropdownOpen ? 'relative z-30' : 'relative z-0'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar user={member} size="md" />
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-bold hover:text-pink-600 transition-colors">{member.name}</p>
                                                        {member.userId === user?.id && <span className="text-[9px] bg-purple-100 px-1 py-0.2 rounded border border-black font-extrabold uppercase scale-90">You</span>}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 items-center mt-1">
                                                        <span className="text-[10px] text-gray-700 font-black bg-yellow-100 border border-black px-1.5 py-0.5 rounded capitalize">{member.role}</span>
                                                        {member.customRoles?.map(role => (
                                                            <span
                                                                key={role.id}
                                                                className="text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded border border-black"
                                                                style={{ backgroundColor: role.color || '#6366f1' }}
                                                            >
                                                                {role.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <RoleDropdown
                                                    value={member.role}
                                                    onChange={(newRole) => {
                                                        if (newRole === 'TRANSFER_OWNERSHIP') {
                                                            openConfirmation({
                                                                title: 'Transfer Ownership?',
                                                                message: `Transfer ownership to ${member.name}? You'll become Admin.`,
                                                                confirmText: 'Transfer',
                                                                type: 'danger',
                                                                onConfirm: () => handleTransferOwnership(member.userId)
                                                            });
                                                        } else {
                                                            handleRoleChange(member.id, newRole);
                                                        }
                                                    }}
                                                    disabled={member.role === 'Owner' || member.userId === user?.id}
                                                    canManageMembers={canManageMembers}
                                                    isOwner={currentUserMember?.role === 'Owner'}
                                                    isOpen={isDropdownOpen}
                                                    onToggle={(open) => setActiveDropdownMemberId(open ? member.id : null)}
                                                />
                                                {canManageMembers && member.id !== currentUserMember?.id && member.role !== 'Owner' && (
                                                    <div className="flex gap-1">
                                                        <IconButton icon={<Trash2 size={16} />} onClick={() => handleKick(member.id)} className="!shadow-none hover:!bg-accent-100 border-2 border-transparent hover:border-black text-gray-500 hover:text-accent-600 rounded-lg" />
                                                        <IconButton icon={<Ban size={16} />} onClick={() => handleBan(member.id)} className="!shadow-none hover:!bg-red-100 border-2 border-transparent hover:border-black text-gray-500 hover:text-red-500 rounded-lg" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            {loadingRequests ? (
                                <div className="flex justify-center py-8"><Loader className="animate-spin text-gray-400" /></div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 font-bold bg-white border-2 border-dashed border-gray-300 rounded-xl">No pending join requests</div>
                            ) : (
                                requests.map(req => (
                                    <div key={req.id} className="flex flex-col bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar user={{ name: req.userName, avatarImage: req.userAvatarImage, avatarColor: req.userAvatar }} size="md" />
                                                <div>
                                                    <p className="font-bold">{req.userName || req.username || 'Unknown User'}</p>
                                                    <p className="text-xs text-gray-500">@{req.username}</p>
                                                    <p className="text-xs text-gray-400">{req.time || `Requested ${new Date(req.createdAt).toLocaleDateString()}`}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="success" size="sm" onClick={() => handleApprove(req.id)} icon={<Check size={16} />} className="shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" />
                                                <Button variant="danger" size="sm" onClick={() => handleReject(req.id)} icon={<X size={16} />} className="shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" />
                                            </div>
                                        </div>
                                        {req.message && (
                                            <div className="p-3 bg-gray-50 border-2 border-black border-dashed rounded-xl text-sm font-medium text-gray-700">
                                                <span className="block text-xs font-black text-gray-400 uppercase mb-1">Message:</span>
                                                "{req.message}"
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </ModalWrapper>

            {viewingProfileId && (
                <UserProfileModal userId={viewingProfileId} viewerId={user?.id} onClose={() => setViewingProfileId(null)} />
            )}
        </>
    );
}
