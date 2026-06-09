import React, { useState, useEffect } from 'react';
import { X, Settings, Palette, Trash2, Save, AlertTriangle, Lock, Globe, Image, Upload, Ban, Loader } from 'lucide-react';
import { useUIStore, useSpacesStore, useAuthStore } from '../../store';
import api from '../../services/api';
import { getImageUrl } from '../../shared/utils/helpers';
import ModalWrapper from '../../shared/components/ModalWrapper';
import Button, { CloseButton } from '../../shared/components/Button';
import Avatar from '../../shared/components/Avatar';
import { ADMIN_ROLES } from '../../shared/constants';

const GRADIENT_OPTIONS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
];

const CATEGORY_OPTIONS = ['CREATIVE', 'TECH', 'EDUCATION', 'MEETING'];

export default function SpaceSettingsModal() {
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
                setFormData(prev => ({ ...prev, thumbnail: result.thumbnailImage }));
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
        } catch (err) { }
    };

    const handleUnban = async (banId) => {
        try {
            await api.spaces.unban(activeSpace.id, banId);
            setBannedUsers(prev => prev.filter(b => b.id !== banId));
        } catch (err) { }
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
        ...(canAccess ? [{ id: 'invites', label: 'Pending Invites', icon: Globe }] : []),
        ...(canAccess ? [{ id: 'banned', label: 'Banned Users', icon: Ban }] : []),
        ...(isOwner ? [{ id: 'danger', label: 'Danger Zone', icon: Trash2 }] : []),
    ];

    const ToggleOption = ({ active, onClick, icon: Icon, label }) => (
        <button type="button" onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold transition-all ${active ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'}`}>
            <Icon size={18} /> {label}
        </button>
    );

    const UserListItem = ({ user: u, action, actionLabel, variant = 'blue' }) => (
        <div className={`flex items-center justify-between p-3 ${variant === 'red' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border-2 rounded-xl`}>
            <div className="flex items-center gap-3">
                <Avatar user={{ name: u.name, avatarImage: u.avatarImage, avatarColor: u.avatarColor }} size="sm" />
                <div>
                    <p className="font-bold">{u.name}</p>
                    <p className="text-xs text-gray-500">@{u.username} • {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
            <Button onClick={action} variant={variant === 'red' ? 'success' : 'danger'} size="sm">{actionLabel}</Button>
        </div>
    );

    return (
        <ModalWrapper isOpen={isSpaceSettingsModalOpen} onClose={closeSpaceSettingsModal} size="lg" zLevel="medium" className="!max-w-3xl !h-[550px]">
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

                    {spaceSettingsTab === 'invites' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-2"><Globe size={20} /> Pending Invites</h3>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                {loadingInvites ? <div className="flex justify-center py-8"><Loader className="animate-spin text-gray-400" size={24} /></div>
                                    : pendingInvites.length === 0 ? <div className="text-center py-8 text-gray-500 font-medium">No pending invites</div>
                                        : <div className="space-y-3">{pendingInvites.map(invite => <UserListItem key={invite.id} user={invite} action={() => handleRevokeInvite(invite.id)} actionLabel="Revoke" />)}</div>}
                            </div>
                        </div>
                    )}

                    {spaceSettingsTab === 'banned' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-2"><Ban size={20} /> Banned Users</h3>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                {loadingBans ? <div className="flex justify-center py-8"><Loader className="animate-spin text-gray-400" size={24} /></div>
                                    : bannedUsers.length === 0 ? <div className="text-center py-8 text-gray-500 font-medium">No banned users</div>
                                        : <div className="space-y-3">{bannedUsers.map(ban => <UserListItem key={ban.id} user={ban} action={() => handleUnban(ban.id)} actionLabel="Unban" variant="red" />)}</div>}
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
