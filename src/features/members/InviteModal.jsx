import React, { useState, useEffect } from 'react';
import { X, Link, Copy, Mail, CheckCircle2, Loader2, AlertCircle, UserPlus, Send, Clock, Hash, Trash2, ChevronDown, Plus } from 'lucide-react';
import { useUIStore, useSpacesStore, useAuthStore } from '../../store';
import api from '../../services/api';
import ModalWrapper from '../../shared/components/ModalWrapper';
import Button, { CloseButton } from '../../shared/components/Button';

// Simple helper for expiration time
const formatExpiration = (dateStr) => {
    if (!dateStr) return 'Never expires';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date - now;

    if (diffMs <= 0) return 'Expired';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `Expires in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    return 'Expires in < 1 min';
};

export default function InviteModal() {
    const { isInviteModalOpen, closeInviteModal } = useUIStore();
    const { activeSpace } = useSpacesStore();
    const { user } = useAuthStore();

    // Email Invite State
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteEmails, setInviteEmails] = useState([]);
    const [isAddingInvite, setIsAddingInvite] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSendingInvites, setIsSendingInvites] = useState(false);
    const [inviteSent, setInviteSent] = useState(false);

    // Invite Link State
    const [activeLinks, setActiveLinks] = useState([]);
    const [isLoadingLinks, setIsLoadingLinks] = useState(false);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [showLinkSettings, setShowLinkSettings] = useState(false);
    const [expireAfter, setExpireAfter] = useState('7d');
    const [maxUses, setMaxUses] = useState('');
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Fetch links when modal opens
    useEffect(() => {
        if (isInviteModalOpen && activeSpace) {
            fetchLinks();
        }
    }, [isInviteModalOpen, activeSpace]);

    const fetchLinks = async () => {
        setIsLoadingLinks(true);
        try {
            const res = await api.get(`/spaces/${activeSpace.id}/invites/codes`);
            const links = res && res.data ? res.data : (Array.isArray(res) ? res : []);
            setActiveLinks(links);
        } catch (err) {
            console.error('Fetch links error:', err);
        } finally {
            setIsLoadingLinks(false);
        }
    };

    const handleGenerateLink = async () => {
        setIsGeneratingLink(true);
        try {
            let expiresAt = null;
            if (expireAfter) {
                const now = new Date();
                if (expireAfter === '30m') now.setMinutes(now.getMinutes() + 30);
                else if (expireAfter === '1h') now.setHours(now.getHours() + 1);
                else if (expireAfter === '6h') now.setHours(now.getHours() + 6);
                else if (expireAfter === '12h') now.setHours(now.getHours() + 12);
                else if (expireAfter === '1d') now.setDate(now.getDate() + 1);
                else if (expireAfter === '7d') now.setDate(now.getDate() + 7);
                expiresAt = now.toISOString();
            }

            const newLink = await api.post(`/spaces/${activeSpace.id}/invites/codes`, {
                maxUses: maxUses ? parseInt(maxUses) : null,
                expiresAt: expiresAt
            });
            setActiveLinks([newLink, ...activeLinks]);
            setShowLinkSettings(false);
        } catch (err) {
            console.error('Generate link error:', err);
            setErrorMessage('Failed to generate link');
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const handleRevokeLink = async (linkId) => {
        try {
            await api.delete(`/spaces/${activeSpace.id}/invites/codes/${linkId}`);
            setActiveLinks(activeLinks.filter(l => l.id !== linkId));
        } catch (err) {
            console.error('Revoke link error:', err);
        }
    };

    const handleCopyLink = async (code, index) => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // ... existing email handling functions ...
    const handleAddInvite = () => {
        if (!inviteEmail || !inviteEmail.includes('@')) {
            setErrorMessage('Please enter a valid email');
            setTimeout(() => setErrorMessage(''), 2000);
            return;
        }
        if (inviteEmails.includes(inviteEmail)) {
            setErrorMessage('Email already added');
            setTimeout(() => setErrorMessage(''), 2000);
            return;
        }
        setIsAddingInvite(true);
        setTimeout(() => {
            setInviteEmails([...inviteEmails, inviteEmail]);
            setInviteEmail('');
            setIsAddingInvite(false);
            setEmailSuccess(true);
            setTimeout(() => setEmailSuccess(false), 1500);
        }, 500);
    };

    const handleRemoveInvite = (email) => {
        setInviteEmails(inviteEmails.filter(e => e !== email));
    };

    const handleSendInvites = async () => {
        if (inviteEmails.length === 0) return;
        setIsSendingInvites(true);
        try {
            await api.members.invite(activeSpace.id, {
                emails: inviteEmails,
                inviterName: user?.name,
                inviterId: user?.id
            });
            setInviteSent(true);
            setInviteEmails([]);
            setTimeout(() => setInviteSent(false), 2000);
        } catch (err) {
            console.error('Failed to send invites:', err);
            setEmailError(true);
            setErrorMessage('Failed to send invites');
            setTimeout(() => { setEmailError(false); setErrorMessage(''); }, 2000);
        } finally {
            setIsSendingInvites(false);
        }
    };

    if (!isInviteModalOpen || !activeSpace) return null;

    return (
        <ModalWrapper isOpen={isInviteModalOpen} onClose={closeInviteModal} size="lg" zLevel="medium">
            <div className="p-6 border-b-2 border-black bg-accent-50 flex justify-between items-center">
                <h2 className="text-2xl font-black">Invite People 🚀</h2>
                <CloseButton onClick={closeInviteModal} />
            </div>

            <div className="p-8 flex flex-col md:flex-row gap-8">
                {/* Left Column: Email Invites */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Mail size={20} /> Invite by Email</h3>
                        <div className="w-full bg-white border-2 border-black rounded-xl p-2 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddInvite()}
                                placeholder="friend@example.com"
                                className="flex-1 px-4 text-sm font-mono font-medium focus:outline-none bg-transparent text-gray-600"
                            />
                            <Button
                                onClick={handleAddInvite}
                                disabled={isAddingInvite || emailSuccess || emailError}
                                variant={emailSuccess ? 'success' : emailError ? 'danger' : 'warning'}
                                size="sm"
                            >
                                {isAddingInvite ? <Loader2 size={18} className="animate-spin" />
                                    : emailSuccess ? <CheckCircle2 size={18} />
                                        : emailError ? <AlertCircle size={18} />
                                            : <UserPlus size={18} />}
                            </Button>
                        </div>
                        {errorMessage && <div className="text-red-500 text-xs font-bold mt-2">{errorMessage}</div>}
                    </div>

                    {inviteEmails.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {inviteEmails.map(email => (
                                <span key={email} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    {email}
                                    <button onClick={() => handleRemoveInvite(email)} className="hover:text-red-500 ml-1"><X size={14} /></button>
                                </span>
                            ))}
                        </div>
                    )}

                    {inviteEmails.length > 0 && (
                        <button
                            onClick={handleSendInvites}
                            disabled={inviteSent || isSendingInvites}
                            className={`w-full py-3 rounded-xl border-2 border-black font-black text-base flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 ${inviteSent ? 'bg-green-400 hover:bg-green-500' : 'bg-accent hover:bg-accent-dark'}`}
                        >
                            {isSendingInvites ? <Loader2 size={20} className="animate-spin" /> : inviteSent ? <CheckCircle2 size={20} /> : <Send size={20} />}
                            {isSendingInvites ? 'Sending...' : inviteSent ? 'Invites Sent!' : `Send ${inviteEmails.length} Invite${inviteEmails.length > 1 ? 's' : ''}`}
                        </button>
                    )}
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-0.5 bg-gray-200"></div>

                {/* Right Column: Invite Links */}
                <div className="flex-1 space-y-6">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Link size={20} /> Invite Links</h3>

                    {!showLinkSettings ? (
                        <button
                            onClick={() => setShowLinkSettings(true)}
                            className="w-full py-3 text-sm font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Generate New Link
                        </button>
                    ) : (
                        <div className="bg-gray-50 border-2 border-black rounded-xl p-4 animate-in slide-in-from-top-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Expire After</label>
                                    <select
                                        value={expireAfter}
                                        onChange={(e) => setExpireAfter(e.target.value)}
                                        className="w-full mt-1 p-2 border-2 border-gray-200 rounded-lg font-bold text-sm bg-white"
                                    >
                                        <option value="30m">30 Minutes</option>
                                        <option value="1h">1 Hour</option>
                                        <option value="6h">6 Hours</option>
                                        <option value="12h">12 Hours</option>
                                        <option value="1d">1 Day</option>
                                        <option value="7d">7 Days</option>
                                        <option value="">Never</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Max Uses</label>
                                    <select
                                        value={maxUses}
                                        onChange={(e) => setMaxUses(e.target.value)}
                                        className="w-full mt-1 p-2 border-2 border-gray-200 rounded-lg font-bold text-sm bg-white"
                                    >
                                        <option value="">No Limit</option>
                                        <option value="1">1 Use</option>
                                        <option value="5">5 Uses</option>
                                        <option value="10">10 Uses</option>
                                        <option value="50">50 Uses</option>
                                        <option value="100">100 Uses</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleGenerateLink}
                                        disabled={isGeneratingLink}
                                        className="flex-1 py-2 bg-black text-white font-bold rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {isGeneratingLink ? 'Generating...' : 'Generate'}
                                    </button>
                                    <button
                                        onClick={() => setShowLinkSettings(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {isLoadingLinks ? (
                            <div className="text-center py-4 text-gray-400"><Loader2 className="animate-spin mx-auto" /></div>
                        ) : activeLinks.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 font-medium text-sm bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                No active invite links
                            </div>
                        ) : (
                            activeLinks.map((link, index) => (
                                <div key={link.id} className="bg-white border-2 border-gray-200 rounded-xl p-3 hover:border-black transition-colors group">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <code className="bg-gray-100 px-2 py-1 rounded-md font-mono font-bold text-blue-600">
                                            {link.code}
                                        </code>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopyLink(link.code, index)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors"
                                                title="Copy Link"
                                            >
                                                {copiedIndex === index ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleRevokeLink(link.id)}
                                                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                                title="Revoke Link"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Hash size={12} /> {link.uses} / {link.maxUses || '∞'} uses
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> {formatExpiration(link.expiresAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
}
