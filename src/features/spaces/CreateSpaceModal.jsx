import React, { useState } from 'react';
import { X, ArrowLeft, Copy, Check, Send, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useUIStore, useSpacesStore, useAuthStore } from '../../store';
import { SPACE_TEMPLATES } from '../../data/mockData';
import api from '../../services/api';
import ModalWrapper from '../../shared/components/ModalWrapper';
import Button, { CloseButton } from '../../shared/components/Button';

export default function CreateSpaceModal() {
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

    if (!isCreateModalOpen) return null;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(createdSpaceLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { }
    };

    const handleAddInvite = async () => {
        if (!inviteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) return;
        if (user && inviteEmail === user.email) {
            setAddError(true); setErrorMessage("You can't invite yourself!");
            setTimeout(() => { setAddError(false); setErrorMessage(''); }, 2000);
            return;
        }
        if (inviteEmails.includes(inviteEmail)) {
            setAddError(true); setErrorMessage("Already invited!");
            setTimeout(() => { setAddError(false); setErrorMessage(''); }, 2000);
            return;
        }
        setIsAddingInvite(true);
        await new Promise(resolve => setTimeout(resolve, 600));
        setInviteEmails(prev => [...prev, inviteEmail]);
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
            thumbnail: template.gradient,
            category: template.category,
            description: newSpaceDescription || "A brand new shiny space!",
            ownerId: user?.id || null,
            files: [],
            members: [{ memberId: 'm1', userId: user?.id, name: user?.name || 'User', username: user?.username, role: 'Owner', avatarColor: user?.avatarColor || '#ec4899' }]
        };
        try {
            const newSpace = await createSpace(spaceData);
            if (newSpace?.id) {
                setCreatedSpaceId(newSpace.id);
                setCreatedSpaceLink(`https://collabspace.app/space/${Math.random().toString(36).substring(7)}`);
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
                        </div>
                        <Button disabled={!newSpaceName.trim()} onClick={() => setCreateStep(2)} fullWidth className="mt-8 !bg-black !py-4 !text-lg">Next Step →</Button>
                    </div>
                    <div className="hidden md:flex w-1/2 bg-gradient-to-br from-white-400 to-accent-500 items-center justify-center relative border-l-4 border-black">
                        <div className="text-center p-8">
                            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] rotate-3 max-w-xs mx-auto">
                                <div className="h-32 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-4xl">💙</div>
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
                                    <div className="h-32 rounded-xl mb-4 border-2 border-black flex items-center justify-center text-white" style={{ background: t.gradient }}>{t.icon}</div>
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
                            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddInvite()} placeholder="teammate@example.com" className="flex-1 px-4 text-sm font-mono focus:outline-none text-center" />
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
                        <Button onClick={resetCreateFlow} variant="primary" className="!bg-black">Go to Space →</Button>
                    </div>
                </div>
            )}
        </ModalWrapper>
    );
}
