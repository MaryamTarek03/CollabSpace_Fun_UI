import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, Copy, Check, Send, UserPlus, Loader2, AlertCircle, Upload } from 'lucide-react';
import { useUIStore, useSpacesStore, useAuthStore } from '../../store';
import { SPACE_TEMPLATES, getTemplateIcon } from '../../data/spaceTemplates';
import api from '../../services/api';
import ModalWrapper from '../../shared/components/ModalWrapper';
import Button, { CloseButton } from '../../shared/components/Button';

export default function CreateSpaceModal() {
    const navigate = useNavigate();
    const {
        isCreateModalOpen, closeCreateModal, createStep, setCreateStep,
        newSpaceName, setNewSpaceName, newSpaceDescription, setNewSpaceDescription,
        createdSpaceLink, setCreatedSpaceLink, resetCreateFlow
    } = useUIStore();
    const { createSpace } = useSpacesStore();
    const { user } = useAuthStore();

    const [copied, setCopied] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteEmails, setInviteEmails] = useState([]);
    const [isAddingInvite, setIsAddingInvite] = useState(false);
    const [addSuccess, setAddSuccess] = useState(false);
    const [addError, setAddError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [createdSpaceId, setCreatedSpaceId] = useState(null);
    const [isSendingInvites, setIsSendingInvites] = useState(false);
    const [inviteSent, setInviteSent] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImageFile(null);
        setImagePreview(null);
    };

    useEffect(() => {
        if (!isCreateModalOpen) {
            setSelectedImageFile(null);
            setImagePreview(null);
            setInviteEmail('');
            setInviteEmails([]);
            setCreatedSpaceId(null);
        }
    }, [isCreateModalOpen]);

    if (!isCreateModalOpen) return null;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(createdSpaceLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { }
    };

    const handleAddInvite = async () => {
        const trimmed = inviteEmail.trim();
        if (!trimmed) return;
        if (user && (trimmed === user.email || trimmed === user.username)) {
            setAddError(true); setErrorMessage("You can't invite yourself!");
            setTimeout(() => { setAddError(false); setErrorMessage(''); }, 2000);
            return;
        }
        if (inviteEmails.includes(trimmed)) {
            setAddError(true); setErrorMessage("Already added!");
            setTimeout(() => { setAddError(false); setErrorMessage(''); }, 2000);
            return;
        }
        setIsAddingInvite(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        setInviteEmails(prev => [...prev, trimmed]);
        setInviteEmail('');
        setIsAddingInvite(false);
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 1500);
    };

    const handleSendInvites = async () => {
        if (inviteEmails.length === 0 || !createdSpaceId) return;
        setIsSendingInvites(true);
        try {
            await api.members.invite(createdSpaceId, { emails: inviteEmails, inviterName: user?.name, inviterId: user?.id });
            setInviteSent(true);
            setInviteEmails([]);
            setTimeout(() => setInviteSent(false), 2000);
        } catch (err) {
            setAddError(true); setErrorMessage('Failed to send invites');
            setTimeout(() => { setAddError(false); setErrorMessage(''); }, 2000);
        } finally {
            setIsSendingInvites(false);
        }
    };

    const handleConfirm = async (template) => {
        const spaceData = {
            name: newSpaceName,
            description: newSpaceDescription || "A brand new shiny space!",
            thumbnailColor: template.defaultColor || template.gradient,
            spaceType: template.id || 1,
            thumbnailImage: selectedImageFile
        };
        try {
            const newSpace = await createSpace(spaceData);
            if (newSpace?.id) {
                setCreatedSpaceId(newSpace.id);

                // Create default channels for the space template
                if (template.defaultChannels && template.defaultChannels.length > 0) {
                    try {
                        await Promise.all(
                            template.defaultChannels.map(c =>
                                api.channels.create(newSpace.id, {
                                    name: c.name,
                                    description: c.description || `Default channel for ${template.name}`
                                })
                            )
                        );
                    } catch (channelErr) {
                        console.error('Failed to create default channels:', channelErr);
                    }
                }

                // Create default custom roles for the space template
                if (template.defaultRoles && template.defaultRoles.length > 0) {
                    try {
                        await Promise.all(
                            template.defaultRoles.map(r =>
                                api.roles.create(newSpace.id, {
                                    name: r.name,
                                    color: r.color,
                                    permissions: r.permissions
                                })
                            )
                        );
                    } catch (roleErr) {
                        console.error('Failed to create default custom roles:', roleErr);
                    }
                }
                
                let shareCode = newSpace.code || newSpace.inviteCode || newSpace.id;
                try {
                    const inviteRes = await api.post(`/spaces/${newSpace.id}/invites/codes`, {
                        maxUses: null,
                        expiresAt: null
                    });
                    if (inviteRes && inviteRes.code) {
                        shareCode = inviteRes.code;
                    }
                } catch (codeErr) {
                    console.error('Failed to auto-generate invite code:', codeErr);
                }

                setCreatedSpaceLink(`${window.location.origin}/invite/${shareCode}`);
                setCreateStep(3);
            }
        } catch (err) {
            console.error('Failed to create space:', err);
        }
    };

    return (
        <ModalWrapper isOpen={isCreateModalOpen} onClose={closeCreateModal} size="xl" zLevel="low" className="!max-w-4xl">
            <CloseButton onClick={closeCreateModal} className="absolute top-4 right-4 z-10" />

            {createStep === 1 && (
                <div className="flex flex-col md:flex-row min-h-[500px]">
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-accent-50">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-black text-white rounded-full text-xs font-bold mb-4">Step 1/3</span>
                            <h2 className="text-4xl font-black text-gray-900 mb-2">Let's build your<br />dream space!</h2>
                            <p className="text-gray-600 font-medium">Give it a cool name to get started.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Space Name</label>
                                <input autoFocus value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} maxLength={50} className="w-full px-4 py-3 text-lg font-bold border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-300/50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]" placeholder="e.g. The Bat Cave" />
                                <p className="text-xs text-gray-400 mt-1 text-right">{newSpaceName.length}/50</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                                <textarea value={newSpaceDescription} onChange={(e) => setNewSpaceDescription(e.target.value)} maxLength={200} className="w-full px-4 py-3 font-medium border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-300/50 h-24 resize-none" placeholder="What happens in this space?" />
                                <p className="text-xs text-gray-400 mt-1 text-right">{newSpaceDescription.length}/200</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Custom Thumbnail Image (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-black rounded-xl cursor-pointer hover:bg-gray-50 active:translate-y-0.5 transition-all bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center">
                                            <Upload className="w-6 h-6 text-gray-500 mb-1" />
                                            <span className="text-[10px] font-bold text-gray-600">Choose File</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    {imagePreview ? (
                                        <div className="relative w-24 h-24 border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                                            <img src={imagePreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full border border-black hover:bg-red-600 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-400 font-medium">No custom image chosen. (A default theme color will be used based on the vibe you select next).</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button disabled={!newSpaceName.trim()} onClick={() => setCreateStep(2)} fullWidth className="mt-8 !bg-black !py-4 !text-lg">Next Step →</Button>
                    </div>
                    <div className="hidden md:flex w-1/2 bg-gradient-to-br from-white-400 to-accent-500 items-center justify-center relative border-l-4 border-black">
                        <div className="text-center p-8">
                            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rotate-3 max-w-xs mx-auto">
                                <div className="h-32 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-4xl overflow-hidden border-2 border-black">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        '💙'
                                    )}
                                </div>
                                <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded-full w-1/2" />
                            </div>
                            <p className="text-white font-bold mt-8 text-xl drop-shadow-md">Previewing: {newSpaceName || 'Untitled Space'}</p>
                        </div>
                    </div>
                </div>
            )}

            {createStep === 2 && (
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b-2 border-black flex items-center bg-pink-50">
                        <button onClick={() => setCreateStep(1)} className="mr-4 p-2 hover:bg-white rounded-lg"><ArrowLeft size={24} /></button>
                        <div><span className="text-xs font-bold uppercase text-pink-600">Step 2/3</span><h2 className="text-2xl font-black">Choose a Vibe</h2></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 max-h-[400px]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {SPACE_TEMPLATES.map((t) => (
                                <button key={t.id} onClick={() => handleConfirm(t)} className="group text-left border-2 border-black rounded-2xl p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all bg-white">
                                    <div className="h-32 rounded-xl mb-4 border-2 border-black flex items-center justify-center text-white" style={{ background: t.gradient }}>{getTemplateIcon(t.iconName, 32)}</div>
                                    <h3 className="font-bold text-lg">{t.name}</h3>
                                    <span className="text-xs font-bold text-gray-400 uppercase">{t.category}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {createStep === 3 && (
                <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center bg-[#FFFDF5]">
                    <h2 className="text-3xl font-black mb-2">Space Created! 🎉</h2>
                    <p className="text-gray-600 font-medium mb-6 max-w-md">Your space is ready. Share the link or invite teammates!</p>

                    {/* Copy Link */}
                    <div className="w-full max-w-md bg-white border-2 border-black rounded-xl p-2 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] mb-6">
                        <div className="flex-1 px-4 font-mono text-sm truncate text-gray-600">{createdSpaceLink}</div>
                        <Button onClick={handleCopyLink} variant={copied ? 'success' : 'warning'} size="sm" icon={copied ? <Check /> : <Copy />} />
                    </div>

                    {/* Invite Input */}
                    <div className="w-full max-w-md mb-6">
                        <div className="bg-white border-2 border-black rounded-xl p-2 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                            <input type="text" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddInvite()} placeholder="username or email" className="flex-1 px-4 text-sm font-mono focus:outline-none text-center" />
                            <Button onClick={handleAddInvite} disabled={isAddingInvite || addSuccess || addError} variant={addSuccess ? 'success' : addError ? 'danger' : 'warning'} size="sm" icon={isAddingInvite ? <Loader2 className="animate-spin" /> : addSuccess ? <Check /> : addError ? <AlertCircle /> : <UserPlus />} />
                        </div>
                        {errorMessage && <div className="text-red-500 text-xs font-bold mt-2">{errorMessage}</div>}

                        {inviteEmails.length > 0 && (
                            <>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {inviteEmails.map(email => (
                                        <span key={email} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            {email}
                                            <button onClick={() => setInviteEmails(prev => prev.filter(e => e !== email))} className="hover:text-red-500 ml-1"><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSendInvites}
                                    disabled={inviteSent || isSendingInvites}
                                    className={`w-full mt-3 py-3 rounded-xl border-2 border-black font-black text-base flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 ${inviteSent ? 'bg-green-400 hover:bg-green-500' : 'bg-accent hover:bg-accent-dark'}`}
                                >
                                    {isSendingInvites ? <Loader2 size={20} className="animate-spin" /> : inviteSent ? <Check size={20} /> : <Send size={20} />}
                                    {isSendingInvites ? 'Sending...' : inviteSent ? 'Invites Sent!' : `Send ${inviteEmails.length} Invite${inviteEmails.length > 1 ? 's' : ''}`}
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={resetCreateFlow} variant="secondary">Skip for Now</Button>
                        <Button
                            onClick={() => {
                                if (createdSpaceId) {
                                    navigate(`/dashboard/spaces/${createdSpaceId}`);
                                }
                                resetCreateFlow();
                            }}
                            variant="primary"
                            className="!bg-black"
                        >
                            Go to Space →
                        </Button>
                    </div>
                </div>
            )}
        </ModalWrapper>
    );
}
