import React, { useState, useEffect } from 'react';
import { X, UserCog, Trash2, Check, Loader, Ban, Send } from 'lucide-react';
import { useUIStore, useSpacesStore, useAuthStore } from '../../store';
import api from '../../services/api';
import UserProfileModal from '../profile/UserProfileModal';
import ModalWrapper from '../../shared/components/ModalWrapper';
import Button, { CloseButton, IconButton } from '../../shared/components/Button';
import Avatar from '../../shared/components/Avatar';
import { ADMIN_ROLES } from '../../shared/constants';

export default function MembersModal() {
    const { isMembersModalOpen, closeMembersModal, openConfirmation, openInputModal } = useUIStore();
    const { activeSpace, setActiveSpace, spaces, fetchSpaceRequests, approveRequest, rejectRequest } = useSpacesStore();
    const { user } = useAuthStore();

    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [viewingProfileId, setViewingProfileId] = useState(null);
    const [activeTab, setActiveTab] = useState('members');
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);




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
        if (!inviteEmail || !inviteEmail.includes('@')) return;
        setIsInviting(true);
        try {
            await api.members.invite(activeSpace.id, {
                emails: [inviteEmail],
                inviterName: user?.name,
                inviterId: user?.id
            });
            setInviteEmail('');
        } catch (err) {
            console.error('Failed to invite:', err);
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
                    <div className="px-6 pt-4 flex gap-2 border-b-2 border-gray-100">
                        <button onClick={() => setActiveTab('members')} className={`px-4 py-2 font-bold text-sm rounded-t-xl border-t-2 border-x-2 transition-all ${activeTab === 'members' ? 'bg-white border-black -mb-0.5 z-10' : 'bg-gray-100 border-transparent text-gray-500'}`}>
                            Members ({activeSpace.members?.length || 0})
                        </button>
                        <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 font-bold text-sm rounded-t-xl border-t-2 border-x-2 transition-all ${activeTab === 'requests' ? 'bg-white border-black -mb-0.5 z-10' : 'bg-gray-100 border-transparent text-gray-500'}`}>
                            Requests {activeSpace.requestsCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeSpace.requestsCount}</span>}
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 max-h-[400px]">
                    {activeTab === 'members' && (
                        <>
                            {/* Invite Input */}
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && canInvite && handleInvite()}
                                    placeholder={!canInvite ? "Invites restricted to admins" : "Add by email..."}
                                    disabled={!canInvite}
                                    className="flex-1 border-2 border-black rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-purple-300 disabled:bg-gray-100 disabled:text-gray-400"
                                />
                                <Button onClick={handleInvite} disabled={!inviteEmail || isInviting || !canInvite} variant="primary" className="!bg-black" icon={<Send />}>
                                    {isInviting ? 'Sending...' : 'Invite'}
                                </Button>
                            </div>

                            {/* Members List */}
                            <div className="space-y-3">
                                {activeSpace.members?.map(member => (
                                    <div key={member.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border-2 border-transparent hover:border-black transition-all">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewingProfileId(member.userId)}>
                                            <Avatar user={member} size="md" />
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-bold hover:text-pink-600">{member.name}</p>
                                                    {member.userId === user?.id && <span className="text-[9px] bg-purple-100 px-1 py-0.2 rounded border border-black font-extrabold uppercase scale-90">You</span>}
                                                </div>
                                                <div className="flex flex-wrap gap-1 items-center mt-1">
                                                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded capitalize">{member.role}</span>
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
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={member.role}
                                                onChange={(e) => {
                                                    if (e.target.value === 'TRANSFER_OWNERSHIP') {
                                                        openConfirmation({
                                                            title: 'Transfer Ownership?',
                                                            message: `Transfer ownership to ${member.name}? You'll become Admin.`,
                                                            confirmText: 'Transfer',
                                                            type: 'danger',
                                                            onConfirm: () => handleTransferOwnership(member.userId)
                                                        });
                                                    } else {
                                                        handleRoleChange(member.id, e.target.value);
                                                    }
                                                }}
                                                disabled={!canManageMembers || member.role === 'Owner' || member.userId === user?.id}
                                                className="bg-white border-2 border-black rounded-lg px-2 py-1 text-sm font-bold disabled:opacity-50"
                                            >
                                                {member.role === 'Owner' ? <option>Owner</option> : (
                                                    <>
                                                        <option value="Admin">Admin</option>
                                                        <option value="Member">Member</option>
                                                        {currentUserMember?.role === 'Owner' && <option value="TRANSFER_OWNERSHIP">👑 Make Owner</option>}
                                                    </>
                                                )}
                                            </select>
                                            {canManageMembers && member.id !== currentUserMember?.id && member.role !== 'Owner' && (
                                                <>
                                                    <IconButton icon={<Trash2 size={16} />} onClick={() => handleKick(member.id)} className="!shadow-none hover:!bg-accent-100 text-gray-400 hover:text-accent-600" />
                                                    <IconButton icon={<Ban size={16} />} onClick={() => handleBan(member.id)} className="!shadow-none hover:!bg-red-100 text-gray-400 hover:text-red-500" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-3">
                            {loadingRequests ? (
                                <div className="flex justify-center py-8"><Loader className="animate-spin text-gray-400" /></div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 font-bold">No pending join requests</div>
                            ) : (
                                requests.map(req => (
                                    <div key={req.id} className="flex flex-col bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar user={{ name: req.name, avatarImage: req.avatarImage }} size="md" />
                                                <div>
                                                    <p className="font-bold">{req.name}</p>
                                                    <p className="text-xs text-gray-500">@{req.username}</p>
                                                    <p className="text-xs text-gray-400">Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="success" size="sm" onClick={() => handleApprove(req.id)} icon={<Check size={16} />} />
                                                <Button variant="danger" size="sm" onClick={() => handleReject(req.id)} icon={<X size={16} />} />
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
