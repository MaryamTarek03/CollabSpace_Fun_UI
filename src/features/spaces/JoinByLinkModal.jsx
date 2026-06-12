import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Link as LinkIcon, ArrowRight, Users, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUIStore, useSpacesStore, useAuthStore } from '../../store';
import api from '../../services/api';
import { getSpaceThumbnailStyle, getSpaceThumbnailUrl, isImageThumbnail } from '../../shared/utils/helpers';

const ModalWrapper = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent hover:border-black z-10"
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
};

export const JoinByLinkModal = () => {
    const navigate = useNavigate();
    const { isJoinByLinkModalOpen, closeJoinByLinkModal, setCurrentView, inviteCodeToJoin, setInviteCodeToJoin } = useUIStore();
    const { spaces, setActiveSpace, fetchSpaces } = useSpacesStore();
    const { user } = useAuthStore();
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewSpace, setPreviewSpace] = useState(null);
    const [isJoining, setIsJoining] = useState(false);

    const isAlreadyMember = previewSpace && (spaces || []).some(s => s.id === previewSpace.id);

    const checkInviteCode = useCallback(async (targetCode) => {
        if (!targetCode || !targetCode.trim()) return;

        let code = targetCode.trim();
        if (code.includes('/invite/')) {
            code = code.split('/invite/')[1];
        }

        setIsLoading(true);
        setError(null);
        setPreviewSpace(null);

        try {
            const data = await api.get(`/invite/${code}`);
            setPreviewSpace(data.space);
        } catch (err) {
            console.error('Check invite error:', err);
            if (err.response?.status === 404) {
                setError('Invalid or expired invite code.');
            } else if (err.response?.status === 410) {
                setError('This invite link has expired or reached its limit.');
            } else {
                setError('Failed to find space. Please check the code.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reset state when modal closes
    useEffect(() => {
        if (!isJoinByLinkModalOpen) {
            setInviteCode('');
            setError(null);
            setPreviewSpace(null);
            setIsLoading(false);
        }
    }, [isJoinByLinkModalOpen]);

    // Consume and check invite code when modal opens
    useEffect(() => {
        if (isJoinByLinkModalOpen && inviteCodeToJoin) {
            setInviteCode(inviteCodeToJoin);
            checkInviteCode(inviteCodeToJoin);
            setInviteCodeToJoin(''); // Consume code
        }
    }, [isJoinByLinkModalOpen, inviteCodeToJoin, setInviteCodeToJoin, checkInviteCode]);

    const handleCheckCode = async () => {
        await checkInviteCode(inviteCode);
    };

    const handleEnterSpace = () => {
        if (!previewSpace) return;
        const matchedSpace = (spaces || []).find(s => s.id === previewSpace.id) || previewSpace;
        setActiveSpace(matchedSpace);
        navigate(`/dashboard/spaces/${matchedSpace.id}`);
        closeJoinByLinkModal();
    };

    const handleJoinSpace = async () => {
        if (!previewSpace) return;

        setIsJoining(true);
        try {
            // Extract code
            let code = inviteCode.trim();
            if (code.includes('/invite/')) {
                code = code.split('/invite/')[1];
            }

            // Get current spaces list
            const currentSpaces = useSpacesStore.getState().spaces || [];
            const currentIds = new Set(currentSpaces.map(s => s.id));

            await api.post(`/invite/${code}/join`, { userId: user.id });

            // Success! Fetch updated spaces
            const updatedSpaces = await fetchSpaces();
            const newSpace = (updatedSpaces || []).find(s => !currentIds.has(s.id));

            if (newSpace) {
                setActiveSpace(newSpace);
                navigate(`/dashboard/spaces/${newSpace.id}`);
            } else if (updatedSpaces && updatedSpaces.length > 0) {
                const lastSpace = updatedSpaces[updatedSpaces.length - 1];
                setActiveSpace(lastSpace);
                navigate(`/dashboard/spaces/${lastSpace.id}`);
            }

            closeJoinByLinkModal();

        } catch (err) {
            console.error('Join space error:', err);
            if (err.response?.status === 400 && err.response?.data?.error === 'Already a member') {
                // Fetch spaces anyway and try to find the matching one
                const updatedSpaces = await fetchSpaces();
                const matchedSpace = (updatedSpaces || []).find(s => s.name === previewSpace.name) || previewSpace;
                setActiveSpace(matchedSpace);
                navigate(`/dashboard/spaces/${matchedSpace.id}`);
                closeJoinByLinkModal();
            } else {
                setError(err.response?.data?.error || 'Failed to join space.');
            }
        } finally {
            setIsJoining(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (previewSpace) {
                if (isAlreadyMember) {
                    handleEnterSpace();
                } else {
                    handleJoinSpace();
                }
            } else {
                handleCheckCode();
            }
        }
    };

    return (
        <ModalWrapper isOpen={isJoinByLinkModalOpen} onClose={closeJoinByLinkModal}>
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <LinkIcon size={32} />
                </div>

                <h2 className="text-3xl font-black mb-2">Join a Space</h2>
                <p className="text-gray-500 font-medium mb-8">Enter an invite code or link below to join an existing space.</p>

                {!previewSpace ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => {
                                    setInviteCode(e.target.value);
                                    setError(null);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="collabspace.app/invite/AbCdEf"
                                className={`w-full p-4 text-center text-lg font-bold border-2 rounded-xl outline-none transition-all ${error ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-black focus:ring-4 focus:ring-blue-100'}`}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center justify-center gap-2 text-red-500 font-bold animate-in slide-in-from-top-2">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <button
                            onClick={handleCheckCode}
                            disabled={!inviteCode.trim() || isLoading}
                            className="w-full py-4 bg-black text-white font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Find Space <ArrowRight size={20} /></>}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                        <div className="bg-gray-50 border-2 border-black rounded-2xl p-4 text-left">
                            <div className="flex items-center gap-4 mb-3">
                                <div
                                    className="w-16 h-16 rounded-xl border-2 border-black flex-shrink-0 flex items-center justify-center overflow-hidden"
                                    style={getSpaceThumbnailStyle(previewSpace.thumbnail)}
                                >
                                    {isImageThumbnail(previewSpace.thumbnail) && (
                                        <img src={getSpaceThumbnailUrl(previewSpace.thumbnail)} alt={previewSpace.name} className="w-full h-full object-cover" />
                                    )}
                                    {!isImageThumbnail(previewSpace.thumbnail) && (
                                        <span className="text-2xl font-bold text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.4)]">{previewSpace.name?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-xl">{previewSpace.name}</h3>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                        <Users size={14} /> {previewSpace.memberCount || 1} Member{previewSpace.memberCount !== 1 ? 's' : ''}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-gray-400 mt-1">
                                        Topic: {previewSpace.category || 'General'}
                                    </div>
                                </div>
                            </div>
                            {previewSpace.description && (
                                <p className="text-gray-600 font-medium text-sm border-t-2 border-gray-200 pt-3 mt-3">
                                    "{previewSpace.description}"
                                </p>
                            )}
                        </div>

                        {isAlreadyMember && (
                            <div className="flex items-center gap-2 justify-center text-blue-600 font-bold text-sm bg-blue-50 border-2 border-blue-200 rounded-xl p-3 animate-in fade-in duration-150">
                                <CheckCircle2 size={16} />
                                You are already a member of this space!
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={isAlreadyMember ? handleEnterSpace : handleJoinSpace}
                                disabled={isJoining}
                                className={`w-full py-4 border-2 border-black font-black text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                    isAlreadyMember
                                        ? 'bg-blue-400 hover:bg-blue-500 text-black'
                                        : 'bg-green-400 hover:bg-green-500 text-black'
                                }`}
                            >
                                {isJoining ? (
                                    <Loader2 className="animate-spin" />
                                ) : isAlreadyMember ? (
                                    'Enter Space'
                                ) : (
                                    'Join Space'
                                )}
                            </button>
                            <button
                                onClick={() => setPreviewSpace(null)}
                                className="w-full py-3 bg-transparent text-gray-500 font-bold hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                            >
                                Back to code
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
};
