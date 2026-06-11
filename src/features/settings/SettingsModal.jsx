import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, Bell, LogOut, User, Shield, Trash2, Save, Camera, ZoomIn, ZoomOut, Check, Clock, Loader, UserPlus } from 'lucide-react';
import api from '../../services/api';
import { formatDate, getImageUrl } from '../../shared/utils/helpers';
import { useUIStore, useAuthStore, useSpacesStore } from '../../store';
import ModalWrapper from '../../shared/components/ModalWrapper';
import Button, { CloseButton } from '../../shared/components/Button';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// ImageCropper Component
function ImageCropper({ imageUrl, onCrop, onCancel }) {
    const canvasRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imgRef = useRef(new Image());

    useEffect(() => { imgRef.current.src = imageUrl; imgRef.current.onload = () => drawImage(); }, [imageUrl]);
    useEffect(() => { drawImage(); }, [zoom, offset]);

    const drawImage = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imgRef.current.complete) return;
        const ctx = canvas.getContext('2d');
        const outputSize = 512, displaySize = 200, scale_factor = outputSize / displaySize;
        canvas.width = canvas.height = outputSize;
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, outputSize, outputSize);
        const img = imgRef.current;
        const scale = Math.max(outputSize / img.width, outputSize / img.height) * zoom;
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (outputSize - w) / 2 + offset.x * scale_factor, (outputSize - h) / 2 + offset.y * scale_factor, w, h);
    };

    const handleMouseDown = (e) => { setIsDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
    const handleMouseMove = (e) => { if (isDragging) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
    const handleMouseUp = () => setIsDragging(false);
    const handleCrop = () => onCrop(canvasRef.current.toDataURL('image/png'));

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4">
            <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Crop Avatar</h3>
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <canvas ref={canvasRef} className="rounded-full border-4 border-black cursor-move" style={{ width: 200, height: 200 }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-pink-400 pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><ZoomOut size={20} /></button>
                    <span className="text-sm font-medium w-16 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><ZoomIn size={20} /></button>
                </div>
                <p className="text-xs text-gray-500 text-center mb-4">Drag to reposition • Zoom to resize</p>
                <div className="flex gap-2">
                    <Button onClick={onCancel} variant="secondary" fullWidth>Cancel</Button>
                    <Button onClick={handleCrop} variant="success" fullWidth icon={<Check />}>Apply</Button>
                </div>
            </div>
        </div>
    );
}

// FormField Component - Defined outside to prevent re-creation on every render
function FormField({ label, value, onChange, error, maxLen, disabled, textarea, prefix }) {
    return (
        <div>
            <label className="block font-bold mb-2">{label}</label>
            <div className={prefix ? 'relative' : ''}>
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{prefix}</span>}
                {textarea ? (
                    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} maxLength={maxLen} className={`w-full border-2 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-pink-300 resize-none ${error ? 'border-red-500 bg-red-50' : 'border-black'}`} />
                ) : (
                    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLen} disabled={disabled} className={`w-full border-2 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-pink-300 ${prefix ? 'pl-8' : ''} ${disabled ? 'border-gray-300 bg-gray-100 text-gray-500' : error ? 'border-red-500 bg-red-50' : 'border-black'}`} />
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            {maxLen && <p className="text-xs text-gray-400 mt-1">{(value?.length || 0)}/{maxLen}</p>}
        </div>
    );
}

// Toggle Component - Defined outside to prevent re-creation on every render
function Toggle({ checked, onChange }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500 border-2 border-black" />
        </label>
    );
}

export default function SettingsModal() {
    const { isSettingsModalOpen, closeSettingsModal, settingsTab, setSettingsTab, themeColor } = useUIStore();
    const { user, logout, updateProfile, uploadAvatar, deleteAvatar } = useAuthStore();
    const { fetchSpaces } = useSpacesStore();

    const [profileData, setProfileData] = useState({ name: '', username: '', bio: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [cropperImage, setCropperImage] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
    const [privacySettings, setPrivacySettings] = useState({ showEmail: false, profileVisibility: 'public' });
    const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
    const [privacyMessage, setPrivacyMessage] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [loadingInvitations, setLoadingInvitations] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        email: true,
        push: true,
        invites: true,
        mentions: false
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isSettingsModalOpen) {
            const saved = localStorage.getItem('notification_settings');
            if (saved) {
                try {
                    setNotificationSettings(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse notification settings', e);
                }
            }
        }
    }, [isSettingsModalOpen]);

    const handleToggleSetting = (key) => {
        setNotificationSettings(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('notification_settings', JSON.stringify(next));
            return next;
        });
    };

    useEffect(() => {
        if (user?.id && isSettingsModalOpen) {
            api.users.getProfile(user.id, user.id).then(profile => {
                if (profile) setPrivacySettings({ showEmail: profile.showEmail === 1 || profile.showEmail === true, profileVisibility: profile.profileVisibility || 'public' });
            }).catch(console.error);
        }
    }, [user?.id, isSettingsModalOpen]);

    useEffect(() => {
        if (settingsTab === 'requests' && user?.id && isSettingsModalOpen) {
            setLoadingRequests(true);
            api.requests.getMy(user.id).then(data => setPendingRequests(data || [])).catch(console.error).finally(() => setLoadingRequests(false));
        }
    }, [settingsTab, user?.id, isSettingsModalOpen]);

    useEffect(() => {
        if (settingsTab === 'invitations' && user?.id && isSettingsModalOpen) {
            setLoadingInvitations(true);
            api.invites.getByUser(user.id).then(data => setPendingInvitations(data || [])).catch(console.error).finally(() => setLoadingInvitations(false));
        }
    }, [settingsTab, user?.id, isSettingsModalOpen]);

    useEffect(() => { if (user) setProfileData({ name: user.name || '', username: user.username || '', bio: user.bio || '' }); }, [user, isSettingsModalOpen]);

    if (!isSettingsModalOpen) return null;

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'invitations', label: 'Invitations', icon: UserPlus },
        { id: 'requests', label: 'My Requests', icon: Clock },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'general', label: 'General', icon: Settings }
    ];

    // Validation
    const validateName = (name) => (!name || name.trim().length < 2) ? 'Min 2 chars' : name.trim().length > 30 ? 'Max 30 chars' : null;
    const validateUsername = (u) => (!u || u.length < 3) ? 'Min 3 chars' : u.length > 20 ? 'Max 20 chars' : !/^[a-z0-9_]+$/.test(u) ? 'Lowercase, numbers, underscores only' : null;
    const validateBio = (bio) => bio && bio.length > 160 ? 'Max 160 chars' : null;

    const handleFieldChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
        const validators = { name: validateName, username: validateUsername, bio: validateBio };
        setValidationErrors(prev => ({ ...prev, [field]: validators[field]?.(value) }));
    };

    const handleSaveProfile = async () => {
        const errors = { name: validateName(profileData.name), username: validateUsername(profileData.username), bio: validateBio(profileData.bio) };
        setValidationErrors(errors);
        if (Object.values(errors).some(e => e)) return;
        setIsSaving(true);
        try {
            await updateProfile({ ...profileData, name: profileData.name.trim() });
            setSaveMessage('Profile updated!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch { setSaveMessage('Failed to save'); }
        finally { setIsSaving(false); }
    };

    const handleSavePrivacy = async () => {
        setIsSavingPrivacy(true);
        try { await api.users.updatePrivacy(user.id, privacySettings); setPrivacyMessage('Saved!'); setTimeout(() => setPrivacyMessage(''), 3000); }
        catch { setPrivacyMessage('Failed'); }
        finally { setIsSavingPrivacy(false); }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        try { await api.users.delete(user.id); logout(); } catch { }
        setShowDeleteConfirm(false);
    };

    const handleCancelRequest = async (requestId) => {
        try { await api.requests.cancelMy(user.id, requestId); setPendingRequests(prev => prev.filter(r => r.id !== requestId)); } catch { }
    };

    const handleAcceptInvitation = async (inviteId) => {
        try {
            await api.invites.accept(inviteId);
            setPendingInvitations(prev => prev.filter(inv => inv.id !== inviteId));
            fetchSpaces();
        } catch (err) {
            console.error('Failed to accept invitation:', err);
        }
    };

    const handleDeclineInvitation = async (inviteId) => {
        try {
            await api.invites.decline(inviteId);
            setPendingInvitations(prev => prev.filter(inv => inv.id !== inviteId));
        } catch (err) {
            console.error('Failed to decline invitation:', err);
        }
    };

    // Avatar handlers
    const processAvatarFile = (file) => {
        if (!file || !user?.id) return;
        setUploadError('');
        if (!ALLOWED_TYPES.includes(file.type)) { setUploadError('Invalid file type'); return; }
        if (file.size > MAX_FILE_SIZE) { setUploadError('Max 2MB'); return; }
        const reader = new FileReader();
        reader.onload = () => setCropperImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedImageData) => {
        setCropperImage(null);
        setIsUploadingAvatar(true);
        try {
            await uploadAvatar(croppedImageData);
        } catch { setUploadError('Upload failed'); }
        finally { setIsUploadingAvatar(false); }
    };

    const handleRemoveAvatar = async () => {
        if (!user?.id) return;
        setIsUploadingAvatar(true);
        try {
            await deleteAvatar();
        } catch { }
        finally { setIsUploadingAvatar(false); }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAvatar(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAvatar(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAvatar(false); processAvatarFile(e.dataTransfer.files?.[0]); };


    return (
        <ModalWrapper isOpen={isSettingsModalOpen} onClose={closeSettingsModal} size="xl" zLevel="medium" className="!max-w-4xl !h-[600px]">
            <CloseButton onClick={closeSettingsModal} className="absolute top-4 right-4 z-10" />
            <input type="file" ref={fileInputRef} onChange={(e) => { processAvatarFile(e.target.files?.[0]); e.target.value = ''; }} accept="image/*" className="hidden" />

            <div className="flex flex-col md:flex-row h-full">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-white border-b-2 md:border-b-0 md:border-r-2 border-black p-6 flex flex-col shrink-0">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Settings size={24} /> Settings</h2>
                    <div className="space-y-2">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setSettingsTab(tab.id)} className={`w-full text-left px-4 py-3 rounded-xl font-bold border-2 transition-all flex items-center gap-3 ${settingsTab === tab.id ? 'bg-accent border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent border-transparent hover:bg-gray-100'}`}>
                                <tab.icon size={18} />{tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <button onClick={logout} className="flex items-center gap-2 text-red-500 font-bold hover:underline w-full px-4 py-2 hover:bg-red-50 rounded-xl">
                            <LogOut size={18} /> Log Out
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {/* Profile Tab */}
                    {settingsTab === 'profile' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black">Profile Settings</h3>
                            {/* Avatar */}
                            <div className={`flex items-center gap-6 p-4 rounded-2xl border-2 border-dashed transition-all ${isDraggingAvatar ? 'border-pink-500 bg-pink-50' : 'border-transparent'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                <div onClick={() => fileInputRef.current?.click()} className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl font-black text-white relative group cursor-pointer overflow-hidden ${isDraggingAvatar ? 'border-pink-500' : 'border-black'}`} style={{ backgroundColor: user?.avatarColor || '#ec4899' }}>
                                    {user?.avatarImage ? <img src={getImageUrl(user.avatarImage)} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                                    <div className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center ${isDraggingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {isUploadingAvatar ? <Loader className="animate-spin text-white" /> : <Camera size={24} className="text-white" />}
                                    </div>
                                </div>
                                <div>
                                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar} className="mb-2">{isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}</Button>
                                    {user?.avatarImage && <button onClick={handleRemoveAvatar} className="text-red-500 text-sm font-bold hover:underline block">Remove avatar</button>}
                                    <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP, GIF. Max 2MB</p>
                                    {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
                                </div>
                            </div>
                            {cropperImage && <ImageCropper imageUrl={cropperImage} onCrop={handleCropComplete} onCancel={() => setCropperImage(null)} />}

                            {/* Form */}
                            <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Display Name" value={profileData.name} onChange={(v) => handleFieldChange('name', v)} error={validationErrors.name} maxLen={30} />
                                    <FormField label="Username" value={profileData.username} onChange={(v) => handleFieldChange('username', v.toLowerCase().replace(/[^a-z0-9_]/g, ''))} error={validationErrors.username} maxLen={20} prefix="@" />
                                </div>
                                <FormField label="Email" value={user?.email || ''} disabled />
                                <FormField label="Bio" value={profileData.bio} onChange={(v) => handleFieldChange('bio', v)} error={validationErrors.bio} maxLen={160} textarea />
                                {saveMessage && <div className={`text-sm font-bold ${saveMessage.includes('updated') ? 'text-green-600' : 'text-red-500'}`}>{saveMessage}</div>}
                                <Button onClick={handleSaveProfile} disabled={isSaving} variant="primary" className="!bg-black" icon={isSaving ? <Loader className="animate-spin" /> : <Save />}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                            </div>
                        </div>
                    )}

                    {/* Invitations Tab */}
                    {settingsTab === 'invitations' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-2"><UserPlus size={20} /> Received Invitations</h3>
                            <p className="text-gray-500 text-sm">Spaces you have been invited to join.</p>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                {loadingInvitations ? <div className="flex justify-center py-8"><Loader className="animate-spin text-gray-400" /></div>
                                    : pendingInvitations.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                                            <p>No pending invitations</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingInvitations.map(inv => (
                                                <div key={inv.id} className="flex items-center justify-between p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
                                                    <div>
                                                        <p className="font-bold">{inv.spaceName}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Invited by <span className="font-semibold">{inv.inviterName || 'unknown'}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleAcceptInvitation(inv.id)}
                                                            variant="success"
                                                            size="sm"
                                                            icon={<Check size={14} />}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeclineInvitation(inv.id)}
                                                            variant="danger"
                                                            size="sm"
                                                            icon={<X size={14} />}
                                                        >
                                                            Decline
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    )}

                    {/* Requests Tab */}
                    {settingsTab === 'requests' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-2"><Clock size={20} /> Pending Join Requests</h3>
                            <p className="text-gray-500 text-sm">Spaces you've requested to join, waiting for approval.</p>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                {loadingRequests ? <div className="flex justify-center py-8"><Loader className="animate-spin text-gray-400" /></div>
                                    : pendingRequests.length === 0 ? <div className="text-center py-8 text-gray-500"><Clock size={32} className="mx-auto mb-2 opacity-50" /><p>No pending requests</p></div>
                                        : <div className="space-y-3">{pendingRequests.map(req => (
                                            <div key={req.id} className="flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-300 rounded-xl">
                                                <div><p className="font-bold">{req.spaceName}</p><p className="text-xs text-gray-500">Waiting for approval...</p></div>
                                                <Button onClick={() => handleCancelRequest(req.id)} variant="danger" size="sm">Cancel</Button>
                                            </div>
                                        ))}</div>}
                            </div>
                        </div>
                    )}

                    {/* Privacy Tab */}
                    {settingsTab === 'privacy' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black">Privacy Settings</h3>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                <h4 className="font-bold mb-4">Profile Visibility</h4>
                                <div className="space-y-3">
                                    {[{ value: 'public', label: 'Public', desc: 'Anyone can view' }, { value: 'members', label: 'Members Only', desc: 'Shared spaces only' }, { value: 'private', label: 'Private', desc: 'Only you' }].map(opt => (
                                        <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer ${privacySettings.profileVisibility === opt.value ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" name="visibility" value={opt.value} checked={privacySettings.profileVisibility === opt.value} onChange={(e) => setPrivacySettings(p => ({ ...p, profileVisibility: e.target.value }))} className="mt-1" />
                                            <div><div className="font-bold">{opt.label}</div><div className="text-sm text-gray-500">{opt.desc}</div></div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                <label className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200 cursor-pointer">
                                    <div><div className="font-bold">Show Email</div><div className="text-sm text-gray-500">Display email on profile</div></div>
                                    <Toggle checked={privacySettings.showEmail} onChange={(e) => setPrivacySettings(p => ({ ...p, showEmail: e.target.checked }))} />
                                </label>
                            </div>
                            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                                <h4 className="font-bold mb-4 text-gray-600">Account Info</h4>
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">User ID</span><span className="font-mono font-bold">{user?.id?.slice(0, 8)}...</span></div>
                                    <div className="flex justify-between py-2"><span className="text-gray-500">Member since</span><span className="font-bold">{formatDate(user?.createdAt)}</span></div>
                                </div>
                            </div>
                            {privacyMessage && <div className={`text-sm font-bold ${privacyMessage.includes('Saved') ? 'text-green-600' : 'text-red-500'}`}>{privacyMessage}</div>}
                            <Button onClick={handleSavePrivacy} disabled={isSavingPrivacy} variant="primary" className="!bg-black" icon={isSavingPrivacy ? <Loader className="animate-spin" /> : <Save />}>Save Privacy</Button>

                            {/* Danger Zone */}
                            <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6">
                                <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2"><Trash2 size={18} /> Danger Zone</h4>
                                <p className="text-sm text-red-600 mb-4">Deleting your account is permanent.</p>
                                {!showDeleteConfirm ? (
                                    <Button onClick={() => setShowDeleteConfirm(true)} variant="danger">Delete Account</Button>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-red-700">Type DELETE to confirm:</p>
                                        <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" className="w-full border-2 border-red-400 rounded-xl p-3 font-mono font-bold" />
                                        <div className="flex gap-2">
                                            <Button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE'} variant="danger">Confirm</Button>
                                            <Button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} variant="secondary">Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {settingsTab === 'notifications' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black">Notifications</h3>
                            <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-4">
                                {[
                                    { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
                                    { key: 'push', label: 'Push notifications', desc: 'Browser push notifications' },
                                    { key: 'invites', label: 'Space invites', desc: 'When someone invites you' },
                                    { key: 'mentions', label: 'Chat mentions', desc: 'When mentioned in chat' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <div><p className="font-bold">{item.label}</p><p className="text-sm text-gray-500">{item.desc}</p></div>
                                        <Toggle checked={!!notificationSettings[item.key]} onChange={() => handleToggleSetting(item.key)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* General Tab */}
                    {settingsTab === 'general' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black">General</h3>
                            <div className="bg-white border-2 border-black rounded-2xl p-6">
                                <label className="block font-bold mb-3">Theme Color</label>
                                <div className="flex gap-3">
                                    {[
                                        { name: 'yellow', color: '#fde047' },
                                        { name: 'pink', color: '#f9a8d4' },
                                        { name: 'blue', color: '#93c5fd' },
                                        { name: 'green', color: '#86efac' },
                                        { name: 'purple', color: '#c4b5fd' }
                                    ].map(theme => (
                                        <button
                                            key={theme.name}
                                            onClick={() => useUIStore.getState().setThemeColor(theme.name)}
                                            className={`w-10 h-10 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform ${themeColor === theme.name ? 'border-black ring-2 ring-offset-2 ring-black' : 'border-black'}`}
                                            style={{ backgroundColor: theme.color }}
                                            title={theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Changes apply immediately across the app</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ModalWrapper>
    );
}
