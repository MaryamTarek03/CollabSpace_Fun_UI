import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Settings, Palette, Trash2, Save, AlertTriangle, Lock, Globe, Image, Upload, Ban, Loader, Shield, Plus, Check, Users } from 'lucide-react';
import { useUIStore, useSpacesStore, useAuthStore } from '../../store';
import api from '../../services/api';
import { getImageUrl, GRADIENT_OPTIONS } from '../../shared/utils/helpers';
import ModalWrapper from '../../shared/components/ModalWrapper';
import Button, { CloseButton } from '../../shared/components/Button';
import Avatar from '../../shared/components/Avatar';
import { ADMIN_ROLES } from '../../shared/constants';
import Checkbox from '../../shared/components/Checkbox';

const CATEGORY_OPTIONS = ['CREATIVE', 'TECH', 'EDUCATION', 'MEETING'];

export default function SpaceSettingsModal() {
    const navigate = useNavigate();
    const { isSpaceSettingsModalOpen, closeSpaceSettingsModal, spaceSettingsTab, setSpaceSettingsTab, setCurrentView } = useUIStore();
    const { activeSpace, updateSpace, deleteSpace, setActiveSpace } = useSpacesStore();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({ name: '', description: '', category: '', thumbnail: '', visibility: 'public' });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [thumbnailType, setThumbnailType] = useState('gradient');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [bannedUsers, setBannedUsers] = useState([]);
    const [loadingBans, setLoadingBans] = useState(false);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [loadingInvites, setLoadingInvites] = useState(false);

    const [spaceRoles, setSpaceRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [editingRole, setEditingRole] = useState({ name: '', color: '', permissions: [] });
    const [rolesMessage, setRolesMessage] = useState('');

    useEffect(() => {
        if (activeSpace && isSpaceSettingsModalOpen) {
            const isImageThumbnail = activeSpace.thumbnail?.startsWith('/uploads') || activeSpace.thumbnail?.startsWith('http');
            setThumbnailType(isImageThumbnail ? 'image' : 'gradient');
            setFormData({
                name: activeSpace.name || '', description: activeSpace.description || '',
                category: activeSpace.category || 'CREATIVE', thumbnail: activeSpace.thumbnail || GRADIENT_OPTIONS[0],
                visibility: activeSpace.visibility || 'public'
            });
        }
    }, [activeSpace, isSpaceSettingsModalOpen]);

    useEffect(() => {
        if (spaceSettingsTab === 'banned' && activeSpace?.id && isSpaceSettingsModalOpen) {
            setLoadingBans(true);
            api.spaces.getBans(activeSpace.id).then(setBannedUsers).catch(console.error).finally(() => setLoadingBans(false));
        }
    }, [spaceSettingsTab, activeSpace?.id, isSpaceSettingsModalOpen]);

    useEffect(() => {
        if (spaceSettingsTab === 'invites' && activeSpace?.id && isSpaceSettingsModalOpen) {
            setLoadingInvites(true);
            api.invites.getBySpace(activeSpace.id).then(setPendingInvites).catch(console.error).finally(() => setLoadingInvites(false));
        }
    }, [spaceSettingsTab, activeSpace?.id, isSpaceSettingsModalOpen]);

    const FALLBACK_PERMISSIONS = [
        { name: "ViewChannels", label: "View Channels", description: "See channels in the space", category: "Channels" },
        { name: "SendMessages", label: "Send Chat Messages", description: "Send chat messages in channels", category: "Channels" },
        { name: "ManageMessages", label: "Manage Messages", description: "Delete or pin other members' messages", category: "Channels" },
        { name: "CreateChannels", label: "Create Channels", description: "Create new text channels", category: "Channels" },
        { name: "ManageChannels", label: "Manage Channels", description: "Edit or delete channels", category: "Channels" },
        { name: "UploadFiles", label: "Upload Files", description: "Upload files to the space storage", category: "Files" },
        { name: "ManageFiles", label: "Manage Files", description: "Delete other members' files and folders", category: "Files" },
        { name: "InviteMembers", label: "Invite Members", description: "Send invites and create invite codes", category: "Members" },
        { name: "KickMembers", label: "Kick Members", description: "Remove members from the space", category: "Members" },
        { name: "BanMembers", label: "Ban Members", description: "Ban or unban members", category: "Members" },
        { name: "ManageRoles", label: "Manage Roles", description: "Create, edit, and delete custom roles", category: "Administration" },
        { name: "ManageSpace", label: "Manage Space", description: "Edit space info, privacy, and thumbnail", category: "Administration" },
        { name: "CreateSessions", label: "Create Sessions", description: "Create collaborative room sessions", category: "Sessions" },
        { name: "ManageSessions", label: "Manage Sessions", description: "End other members' sessions", category: "Sessions" },
        { name: "ViewAuditLog", label: "View Audit Log", description: "View the space audit log", category: "Administration" }
    ];

    useEffect(() => {
        if (spaceSettingsTab === 'roles' && activeSpace?.id && isSpaceSettingsModalOpen) {
            setLoadingRoles(true);
            setRolesMessage('');
            
            // 1. Fetch available permissions (with static fallback)
            api.roles.getAvailablePermissions()
                .then(data => setAvailablePermissions(data || FALLBACK_PERMISSIONS))
                .catch(() => setAvailablePermissions(FALLBACK_PERMISSIONS));

            // 2. Fetch all roles in space
            api.roles.getAll(activeSpace.id)
                .then(rolesList => {
                    const sortedRoles = (rolesList || []).sort((a, b) => a.position - b.position);
                    setSpaceRoles(sortedRoles);
                    if (sortedRoles.length > 0) {
                        const defaultSel = sortedRoles[0];
                        setSelectedRole(defaultSel);
                        setEditingRole({
                            name: defaultSel.name || '',
                            color: defaultSel.color || '#6366f1',
                            permissions: defaultSel.permissions || []
                        });
                    } else {
                        setSelectedRole(null);
                    }
                })
                .catch(console.error)
                .finally(() => setLoadingRoles(false));
        }
    }, [spaceSettingsTab, activeSpace?.id, isSpaceSettingsModalOpen]);

    if (!isSpaceSettingsModalOpen || !activeSpace) return null;

    const userMember = activeSpace.members?.find(m => m.userId === user?.id);
    const userRole = userMember?.role || null;
    const isOwner = userRole === 'Owner' || activeSpace.ownerId === user?.id;
    const canAccess = isOwner || ADMIN_ROLES.includes(userRole);
    if (!canAccess) return null;

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingImage(true);
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const result = await api.spaces.uploadThumbnail(activeSpace.id, reader.result);
                // Update Zustand store immediately so sidebar and headers update
                useSpacesStore.setState(state => ({
                    spaces: state.spaces.map(s => s.id === activeSpace.id ? result : s),
                    activeSpace: result
                }));
                setFormData(prev => ({ ...prev, thumbnail: result.thumbnail }));
                setIsUploadingImage(false);
                setSaveMessage('Thumbnail updated!');
                setTimeout(() => setSaveMessage(''), 3000);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setSaveMessage('Upload failed');
            setIsUploadingImage(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            await updateSpace(activeSpace.id, formData);
            setSaveMessage('Settings saved!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            setSaveMessage('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        try {
            await deleteSpace(activeSpace.id);
            closeSpaceSettingsModal();
            setActiveSpace(null);
            setCurrentView('dashboard');
            navigate('/dashboard');
        } catch (err) { }
    };

    const handleUnban = async (banId) => {
        try {
            await api.spaces.unban(activeSpace.id, banId);
            setBannedUsers(prev => prev.filter(b => b.id !== banId));
        } catch (err) { }
    };

    const handleSaveRole = async () => {
        if (!editingRole.name.trim()) {
            setRolesMessage('Role name cannot be empty');
            return;
        }
        setRolesMessage('');
        try {
            if (selectedRole === 'new') {
                const newRole = await api.roles.create(activeSpace.id, {
                    name: editingRole.name.trim(),
                    color: editingRole.color || '#6366f1',
                    permissions: editingRole.permissions
                });
                setSpaceRoles(prev => [...prev, newRole]);
                setSelectedRole(newRole);
                setEditingRole({
                    name: newRole.name,
                    color: newRole.color || '#6366f1',
                    permissions: newRole.permissions
                });
                setRolesMessage('Role created successfully!');
            } else {
                await api.roles.update(activeSpace.id, selectedRole.id, {
                    name: editingRole.name.trim(),
                    color: editingRole.color || '#6366f1',
                    permissions: editingRole.permissions
                });
                
                // Update local list
                setSpaceRoles(prev => prev.map(r => r.id === selectedRole.id ? {
                    ...r,
                    name: editingRole.name.trim(),
                    color: editingRole.color || '#6366f1',
                    permissions: editingRole.permissions
                } : r));
                setRolesMessage('Role saved successfully!');
            }
        } catch (err) {
            setRolesMessage('Failed to save role');
        }
    };

    const handleDeleteRole = async () => {
        if (!selectedRole || selectedRole === 'new' || selectedRole.isSystemDefault) return;
        try {
            await api.roles.delete(activeSpace.id, selectedRole.id);
            const remaining = spaceRoles.filter(r => r.id !== selectedRole.id);
            setSpaceRoles(remaining);
            if (remaining.length > 0) {
                setSelectedRole(remaining[0]);
                setEditingRole({
                    name: remaining[0].name || '',
                    color: remaining[0].color || '#6366f1',
                    permissions: remaining[0].permissions || []
                });
            } else {
                setSelectedRole(null);
            }
            setRolesMessage('Role deleted successfully!');
        } catch (err) {
            setRolesMessage('Failed to delete role');
        }
    };

    const handleToggleRoleMember = async (member, roleId) => {
        const hasRole = member.customRoles?.some(r => r.id === roleId);
        const roleObj = spaceRoles.find(r => r.id === roleId);

        // Optimistic UI update
        const nextRoles = hasRole
            ? (member.customRoles || []).filter(r => r.id !== roleId)
            : [...(member.customRoles || []), roleObj].filter(Boolean);

        const updatedMembers = activeSpace.members?.map(m => {
            if (m.id === member.id) return { ...m, customRoles: nextRoles };
            return m;
        }) || [];

        const updatedSpaces = useSpacesStore.getState().spaces.map(s =>
            s.id === activeSpace.id ? { ...s, members: updatedMembers } : s
        );
        useSpacesStore.setState({ spaces: updatedSpaces });
        setActiveSpace({ ...activeSpace, members: updatedMembers });

        try {
            if (hasRole) {
                await api.roles.removeCustomRole(activeSpace.id, member.userId, roleId);
            } else {
                await api.roles.assignCustomRole(activeSpace.id, member.userId, roleId);
            }
        } catch (err) {
            console.error('Failed to toggle member role:', err);
            // Revert
            const revertedMembers = activeSpace.members?.map(m => {
                if (m.id === member.id) return { ...m, customRoles: member.customRoles };
                return m;
            }) || [];
            const revertedSpaces = useSpacesStore.getState().spaces.map(s =>
                s.id === activeSpace.id ? { ...s, members: revertedMembers } : s
            );
            useSpacesStore.setState({ spaces: revertedSpaces });
            setActiveSpace({ ...activeSpace, members: revertedMembers });
        }
    };

    const handleRevokeInvite = async (inviteId) => {
        try {
            await api.invites.revoke(inviteId);
            setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
        } catch (err) { }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        ...(canAccess ? [{ id: 'roles', label: 'Roles & Permissions', icon: Shield }] : []),
        ...(canAccess ? [{ id: 'invites', label: 'Pending Invites', icon: Globe }] : []),
        ...(canAccess ? [{ id: 'banned', label: 'Banned Users', icon: Ban }] : []),
        ...(isOwner ? [{ id: 'danger', label: 'Danger Zone', icon: Trash2 }] : []),
    ];

    const ToggleOption = ({ active, onClick, icon: Icon, label }) => (
        <button type="button" onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold transition-all ${active ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'}`}>
            <Icon size={18} /> {label}
        </button>
    );

    const UserListItem = ({ user: item, action, actionLabel, variant = 'blue' }) => {
        const u = item.invitedUser ? {
            name: item.invitedUser.displayName || item.invitedUser.username || 'Unknown',
            username: item.invitedUser.username || 'unknown',
            avatarImage: item.invitedUser.avatarImage || item.invitedUser.avatarUrl,
            avatarColor: item.invitedUser.avatarColor,
            date: item.createdAt
        } : {
            name: item.name || item.userName || 'Unknown',
            username: item.username || item.userName?.toLowerCase().replace(/\s+/g, '') || 'unknown',
            avatarImage: item.avatarImage || item.userAvatarImage || item.avatarUrl,
            avatarColor: item.avatarColor || item.userAvatar,
            date: item.bannedOn || item.createdAt
        };

        const displayDate = u.date ? new Date(u.date).toLocaleDateString() : '';

        return (
            <div className={`flex items-center justify-between p-4 ${
                variant === 'red' 
                    ? 'bg-[#FFF5F5] hover:bg-[#FFF0F0]' 
                    : 'bg-[#F5F8FF] hover:bg-[#EEF3FF]'
                } border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}>
                <div className="flex items-center gap-4">
                    <Avatar 
                        user={{ name: u.name, avatarImage: u.avatarImage, avatarColor: u.avatarColor }} 
                        size="md" 
                        className="shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] !rounded-xl"
                    />
                    <div>
                        <p className="font-black text-gray-900 text-base leading-tight">{u.name}</p>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                            @{u.username}{displayDate ? ` • ${displayDate}` : ''}
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={action} 
                    variant={variant === 'red' ? 'success' : 'danger'} 
                    size="sm"
                    className="!rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                >
                    {actionLabel}
                </Button>
            </div>
        );
    };

    return (
        <ModalWrapper isOpen={isSpaceSettingsModalOpen} onClose={closeSpaceSettingsModal} size="xl" zLevel="medium" className="!max-w-4xl !h-[650px]">
            <CloseButton onClick={closeSpaceSettingsModal} className="absolute top-4 right-4 z-10" />

            <div className="flex flex-col md:flex-row h-full">
                {/* Sidebar */}
                <div className="w-full md:w-56 bg-white border-b-2 md:border-b-0 md:border-r-2 border-black p-6 flex flex-col shrink-0 md:rounded-l-2xl">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Settings size={20} /> Space Settings</h2>
                    <div className="space-y-2">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setSpaceSettingsTab(tab.id)} className={`w-full text-left px-4 py-3 rounded-xl font-bold border-2 transition-all flex items-center gap-3 ${spaceSettingsTab === tab.id ? tab.id === 'danger' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-accent border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent border-transparent hover:bg-gray-100'} ${tab.id === 'danger' ? 'text-red-600 hover:bg-red-50' : ''}`}>
                                <tab.icon size={18} />{tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {spaceSettingsTab === 'general' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black">General Settings</h3>
                            <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-4">
                                <div>
                                    <label className="block font-bold mb-2">Space Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} maxLength={50} className="w-full border-2 border-black rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-pink-300" />
                                    <p className="text-xs text-gray-400 mt-1 text-right">{formData.name?.length || 0}/50</p>
                                </div>
                                <div>
                                    <label className="block font-bold mb-2">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} maxLength={200} rows={3} className="w-full border-2 border-black rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-pink-300 resize-none" />
                                    <p className="text-xs text-gray-400 mt-1 text-right">{formData.description?.length || 0}/200</p>
                                </div>
                                <div>
                                    <label className="block font-bold mb-3">Space Privacy</label>
                                    <div className="flex gap-3">
                                        <ToggleOption active={formData.visibility === 'public'} onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))} icon={Globe} label="Public" />
                                        <ToggleOption active={formData.visibility === 'private'} onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))} icon={Lock} label="Private" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">{formData.visibility === 'public' ? 'Anyone can find and view this space' : 'Only invited members can access this space'}</p>
                                </div>
                                {saveMessage && <div className={`text-sm font-bold ${saveMessage.includes('saved') ? 'text-green-600' : 'text-red-500'}`}>{saveMessage}</div>}
                                <Button onClick={handleSave} disabled={isSaving} variant="primary" className="!bg-black" icon={isSaving ? <Loader className="animate-spin" /> : <Save />}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                            </div>
                        </div>
                    )}

                    {spaceSettingsTab === 'appearance' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black">Appearance</h3>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                <label className="block font-bold mb-3">Thumbnail Type</label>
                                <div className="flex gap-3 mb-6">
                                    <ToggleOption active={thumbnailType === 'gradient'} onClick={() => setThumbnailType('gradient')} icon={Palette} label="Gradient" />
                                    <ToggleOption active={thumbnailType === 'image'} onClick={() => setThumbnailType('image')} icon={Image} label="Image" />
                                </div>
                                {thumbnailType === 'gradient' && (
                                    <>
                                        <label className="block font-bold mb-4">Choose Gradient</label>
                                        <div className="grid grid-cols-4 gap-3 mb-6">
                                            {GRADIENT_OPTIONS.map((gradient, i) => (
                                                <button key={i} onClick={() => setFormData(prev => ({ ...prev, thumbnail: gradient }))} className={`h-16 rounded-xl border-2 transition-all ${formData.thumbnail === gradient ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-105' : 'border-gray-200 hover:border-black'}`} style={{ background: gradient }} />
                                            ))}
                                        </div>
                                    </>
                                )}
                                {thumbnailType === 'image' && (
                                    <div className="mb-6">
                                        <label className="block font-bold mb-4">Upload Image</label>
                                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-black hover:bg-gray-50 transition-all">
                                            {isUploadingImage ? <Loader className="animate-spin text-blue-500" /> : <><Upload size={32} className="text-gray-400 mb-2" /><span className="text-sm font-bold text-gray-500">Click to upload image</span></>}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                )}
                                <label className="block font-bold mb-2">Preview</label>
                                <div className="h-32 rounded-xl border-2 border-black flex items-center justify-center text-white font-black text-2xl overflow-hidden" style={formData.thumbnail?.startsWith('linear-gradient') ? { background: formData.thumbnail } : { backgroundColor: '#333' }}>
                                    {formData.thumbnail && !formData.thumbnail.startsWith('linear-gradient') ? <img src={getImageUrl(formData.thumbnail)} alt="Preview" className="w-full h-full object-cover" /> : formData.name || 'Space Name'}
                                </div>
                                {saveMessage && <div className={`mt-4 text-sm font-bold ${saveMessage.includes('updated') || saveMessage.includes('saved') ? 'text-green-600' : 'text-red-500'}`}>{saveMessage}</div>}
                                {thumbnailType === 'gradient' && <Button onClick={handleSave} disabled={isSaving} className="mt-6 !bg-black" icon={<Save />}>Save Appearance</Button>}
                            </div>
                        </div>
                    )}

                    {spaceSettingsTab === 'roles' && (
                        <div className="flex flex-col h-full space-y-4">
                            <h3 className="text-xl font-black flex items-center gap-2"><Shield size={20} /> Roles & Permissions</h3>
                            {loadingRoles ? (
                                <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-gray-400" size={32} /></div>
                            ) : (
                                <div className="flex flex-1 gap-4 overflow-hidden" style={{ minHeight: '450px' }}>
                                    {/* Roles List */}
                                    <div className="w-1/3 border-r-2 border-black pr-4 flex flex-col justify-between overflow-y-auto">
                                        <div className="space-y-2">
                                            {spaceRoles.map(role => (
                                                <button
                                                    key={role.id}
                                                    onClick={() => {
                                                        setSelectedRole(role);
                                                        setEditingRole({
                                                            name: role.name || '',
                                                            color: role.color || '#6366f1',
                                                            permissions: role.permissions || []
                                                        });
                                                        setRolesMessage('');
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl font-bold border-2 transition-all flex items-center gap-2 ${selectedRole?.id === role.id ? 'bg-purple-100 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-gray-200 hover:border-black'}`}
                                                >
                                                    <span className="w-3.5 h-3.5 rounded-full border border-black" style={{ backgroundColor: role.color || '#6366f1' }} />
                                                    <span className="truncate flex-1 text-sm">{role.name}</span>
                                                    {role.isSystemDefault && <span className="text-[9px] bg-gray-250 border border-black px-1 py-0.2 rounded font-extrabold uppercase scale-90">System</span>}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedRole('new');
                                                setEditingRole({ name: '', color: '#6366f1', permissions: [] });
                                                setRolesMessage('');
                                            }}
                                            className={`w-full mt-4 flex items-center justify-center gap-2 border-2 border-dashed border-black hover:bg-purple-50 rounded-xl p-3 font-bold transition-all ${selectedRole === 'new' ? 'bg-purple-100 border-solid shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}
                                        >
                                            <Plus size={16} /> Create Custom Role
                                        </button>
                                    </div>

                                    {/* Role Config Panel */}
                                    <div className="w-2/3 pl-4 flex flex-col justify-between overflow-y-auto">
                                        {selectedRole ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block font-bold mb-1 text-sm">Role Name</label>
                                                    <input
                                                        type="text"
                                                        value={editingRole.name}
                                                        onChange={(e) => setEditingRole(prev => ({ ...prev, name: e.target.value }))}
                                                        disabled={selectedRole.isSystemDefault}
                                                        placeholder="e.g. Moderator"
                                                        className="w-full border-2 border-black rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-purple-300 disabled:bg-gray-100 disabled:opacity-75"
                                                    />
                                                </div>

                                                {!selectedRole.isSystemDefault && (
                                                    <div>
                                                        <label className="block font-bold mb-2 text-sm">Role Color</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'].map(c => (
                                                                <button
                                                                    key={c}
                                                                    onClick={() => setEditingRole(prev => ({ ...prev, color: c }))}
                                                                    className={`w-7 h-7 rounded-full border-2 transition-all ${editingRole.color === c ? 'border-black scale-110 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'border-transparent hover:border-black'}`}
                                                                    style={{ backgroundColor: c }}
                                                                />
                                                            ))}
                                                            <input
                                                                type="color"
                                                                value={editingRole.color || '#6366f1'}
                                                                onChange={(e) => setEditingRole(prev => ({ ...prev, color: e.target.value }))}
                                                                className="w-7 h-7 rounded-full border-2 border-black cursor-pointer p-0 overflow-hidden"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block font-bold mb-2 text-sm">Permissions</label>
                                                    <div className="border-2 border-black rounded-xl p-3 bg-gray-50 max-h-[260px] overflow-y-auto space-y-4">
                                                        {Object.entries(
                                                            availablePermissions.reduce((acc, p) => {
                                                                const cat = p.category || 'General';
                                                                if (!acc[cat]) acc[cat] = [];
                                                                acc[cat].push(p);
                                                                return acc;
                                                            }, {})
                                                        ).map(([category, perms]) => (
                                                            <div key={category} className="space-y-2">
                                                                <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider pl-1">{category}</h4>
                                                                <div className="grid grid-cols-1 gap-1.5">
                                                                    {perms.map(p => {
                                                                        const permKey = p.key || p.name;
                                                                        const isChecked = editingRole.permissions.includes(permKey);
                                                                        return (
                                                                            <Checkbox
                                                                                key={permKey}
                                                                                checked={isChecked}
                                                                                disabled={selectedRole.isSystemDefault}
                                                                                onChange={(e) => {
                                                                                    const newPerms = e.target.checked
                                                                                        ? [...editingRole.permissions, permKey]
                                                                                        : editingRole.permissions.filter(x => x !== permKey);
                                                                                    setEditingRole(prev => ({ ...prev, permissions: newPerms }));
                                                                                }}
                                                                                label={p.label}
                                                                                description={p.description}
                                                                            />
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Assigned Members - only for existing custom roles */}
                                                {selectedRole !== 'new' && !selectedRole.isSystemDefault && (
                                                    <div>
                                                        <label className="block font-bold mb-2 text-sm flex items-center gap-1.5">
                                                            <Users size={14} /> Assigned Members
                                                        </label>
                                                        <div className="border-2 border-black rounded-xl p-3 bg-gray-50 max-h-[180px] overflow-y-auto space-y-1">
                                                            {activeSpace.members?.filter(m => m.role !== 'Owner').length === 0 ? (
                                                                <p className="text-xs text-gray-400 text-center py-2">No members to assign</p>
                                                            ) : (
                                                                activeSpace.members?.filter(m => m.role !== 'Owner').map(member => {
                                                                    const isAssigned = member.customRoles?.some(r => r.id === selectedRole.id);
                                                                    return (
                                                                        <Checkbox
                                                                            key={member.id}
                                                                            checked={isAssigned}
                                                                            onChange={() => handleToggleRoleMember(member, selectedRole.id)}
                                                                            className="!p-1.5 hover:!bg-purple-50 !gap-2.5"
                                                                        >
                                                                            <Avatar user={member} size="xs" />
                                                                            <div className="min-w-0 flex-1">
                                                                                <span className="text-xs font-bold text-gray-800 block truncate leading-tight">{member.name}</span>
                                                                                <span className="text-[10px] text-gray-400 block truncate leading-tight">@{member.username} · {member.role}</span>
                                                                            </div>
                                                                        </Checkbox>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {rolesMessage && (
                                                    <div className={`text-xs font-bold ${rolesMessage.includes('successfully') ? 'text-green-650' : 'text-red-500'}`}>
                                                        {rolesMessage}
                                                    </div>
                                                )}

                                                {!selectedRole.isSystemDefault && (
                                                    <div className="flex gap-2 pt-2">
                                                        <Button onClick={handleSaveRole} size="sm" variant="primary" className="!bg-black" icon={<Save size={14} />}>
                                                            {selectedRole === 'new' ? 'Create Role' : 'Save Changes'}
                                                        </Button>
                                                        {selectedRole !== 'new' && (
                                                            <Button onClick={handleDeleteRole} size="sm" variant="danger" icon={<Trash2 size={14} />}>
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
                                                <Shield size={48} className="stroke-1 mb-2" />
                                                <p className="font-bold text-sm">Select a role or create one</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {spaceSettingsTab === 'invites' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-2"><Globe size={20} /> Pending Invites</h3>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                {loadingInvites ? <div className="flex justify-center py-8"><Loader className="animate-spin text-gray-400" size={24} /></div>
                                    : pendingInvites.length === 0 ? <div className="text-center py-8 text-gray-500 font-medium">No pending invites</div>
                                        : <div className="space-y-4">{pendingInvites.map(invite => <UserListItem key={invite.id} user={invite} action={() => handleRevokeInvite(invite.id)} actionLabel="Revoke" />)}</div>}
                            </div>
                        </div>
                    )}

                    {spaceSettingsTab === 'banned' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-2"><Ban size={20} /> Banned Users</h3>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                {loadingBans ? <div className="flex justify-center py-8"><Loader className="animate-spin text-gray-400" size={24} /></div>
                                    : bannedUsers.length === 0 ? <div className="text-center py-8 text-gray-500 font-medium">No banned users</div>
                                        : <div className="space-y-4">{bannedUsers.map(ban => <UserListItem key={ban.id} user={ban} action={() => handleUnban(ban.id)} actionLabel="Unban" variant="red" />)}</div>}
                            </div>
                        </div>
                    )}

                    {spaceSettingsTab === 'danger' && isOwner && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-red-600 flex items-center gap-2"><AlertTriangle size={24} /> Danger Zone</h3>
                            <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6">
                                <h4 className="font-bold text-red-700 mb-2">Delete this space</h4>
                                <p className="text-sm text-red-600 mb-4">Once you delete a space, there is no going back. This will permanently delete all files, messages, and members.</p>
                                {!showDeleteConfirm ? (
                                    <Button onClick={() => setShowDeleteConfirm(true)} variant="danger">Delete Space</Button>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-red-700">Type DELETE to confirm:</p>
                                        <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE" className="w-full border-2 border-red-400 rounded-xl p-3 font-mono font-bold outline-none focus:ring-2 focus:ring-red-300" />
                                        <div className="flex gap-2">
                                            <Button onClick={handleDelete} disabled={deleteConfirmText !== 'DELETE'} variant="danger">Confirm Delete</Button>
                                            <Button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} variant="secondary">Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ModalWrapper>
    );
}
