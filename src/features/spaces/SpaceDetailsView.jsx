import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2, MessageSquare, Link, FileText, Users, Eye, Settings, LogOut, Move, Save, X, Lock } from 'lucide-react';
import SpaceStats from './components/SpaceStats';
import SpacePreviewCard from './components/SpacePreviewCard';
import { getFileIcon, isImageThumbnail, getSpaceThumbnailStyle, getSpaceThumbnailUrl, getImageUrl } from '../../shared/utils/helpers';
import { useSpacesStore, useUIStore, useChatStore, useAuthStore } from '../../store';
import api from '../../services/api';

export default function SpaceDetailsView() {
    const { spaceId } = useParams();
    const navigate = useNavigate();

    // Get state directly from stores
    const { activeSpace, setActiveSpace, spaces, loading: spacesLoading } = useSpacesStore();
    const {
        openInviteModal,
        openFilesModal,
        openMembersModal,
        setViewingFile,
        setUnityLoadingProgress,
        openSpaceSettingsModal,
        openConfirmation,
        openJoinSessionModal
    } = useUIStore();
    const { setActiveChatSpace } = useChatStore();
    const { user } = useAuthStore();

    // Reposition state (must be before any early returns)
    const [isRepositioning, setIsRepositioning] = React.useState(false);
    const [repositionY, setRepositionY] = React.useState(50);
    const [isSavingPosition, setIsSavingPosition] = React.useState(false);
    const draggingRef = React.useRef(false);
    const startYRef = React.useRef(0);
    const startPosRef = React.useRef(0);

    const [isJoining, setIsJoining] = React.useState(false);
    const [recentFiles, setRecentFiles] = React.useState([]);
    const [recentFilesLoading, setRecentFilesLoading] = React.useState(false);

    // Set active space based on route param if not already set
    useEffect(() => {
        if (!spaceId) return;

        setRecentFilesLoading(true);
        // Fetch the full space details, files, and recent files in parallel
        Promise.all([
            api.spaces.getById(spaceId),
            api.files.getBySpace(spaceId),
            api.files.getRecent(spaceId, 5)
        ])
            .then(([space, files, recent]) => {
                const members = space.members || [];
                const resolvedFiles = (files || []).map(file => {
                    if (file.uploaderName === 'Unknown' || !file.uploaderName) {
                        const uploaderId = file.uploadedBy;
                        const uploader = members.find(m => m.id === uploaderId);
                        if (uploader) {
                            return { ...file, uploaderName: uploader.name || uploader.username };
                        }
                    }
                    return file;
                });
                const resolvedRecent = (recent || []).map(file => {
                    if (file.uploaderName === 'Unknown' || !file.uploaderName) {
                        const uploaderId = file.uploadedBy;
                        const uploader = members.find(m => m.id === uploaderId);
                        if (uploader) {
                            return { ...file, uploaderName: uploader.name || uploader.username };
                        }
                    }
                    return file;
                });
                setActiveSpace({
                    ...space,
                    files: resolvedFiles
                });
                setRecentFiles(resolvedRecent);
            })
            .catch(err => {
                console.error("Failed to fetch space details or files:", err);
                
                // Fallback to local space if API fails (e.g. offline)
                const localSpaces = useSpacesStore.getState().spaces;
                const localSpace = localSpaces.find(s => s.id === spaceId);
                if (localSpace) {
                    setActiveSpace(localSpace);
                } else {
                    navigate('/dashboard');
                }
            })
            .finally(() => {
                setRecentFilesLoading(false);
            });
    }, [spaceId, setActiveSpace, navigate]);

    // Show loading while spaces are loading or space not set yet
    if (spacesLoading || !activeSpace) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-12 h-12 border-4 border-black border-t-accent rounded-full"></div>
            </div>
        );
    }

    const onBack = () => {
        setActiveSpace(null);
        navigate('/dashboard');
    };

    const onLaunchUnity = () => {
        openJoinSessionModal();
    };

    const onStartUnitySession = () => {
        setUnityLoadingProgress(0);
        navigate(`/dashboard/session/${activeSpace.id}`);
        const interval = setInterval(() => {
            const current = useUIStore.getState().unityLoadingProgress;
            if (current >= 100) {
                clearInterval(interval);
                return;
            }
            useUIStore.setState({ unityLoadingProgress: current + 5 });
        }, 100);
    };

    const onTextChat = () => {
        setActiveChatSpace(activeSpace);
        navigate(`/dashboard/chat/${activeSpace.id}`, { state: { fromSpace: true } });
    };

    const handleLeaveSpace = () => {
        openConfirmation({
            title: 'Leave Space?',
            message: `Are you sure you want to leave ${activeSpace.name}? You will need to be re-invited to join again.`,
            confirmText: 'Leave Space',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.members.leave(activeSpace.id, user.id);
                    // Refresh spaces list to reflect removal
                    await useSpacesStore.getState().fetchSpaces();
                    setActiveSpace(null);
                    setCurrentView('dashboard');
                } catch (err) {
                    console.error('Failed to leave space:', err);
                }
            }
        });
    };

    // Check if user can access settings (Admin or Owner)
    const userMember = activeSpace.members?.find(m => m.userId === user?.id);
    const userRole = userMember?.role || null;
    const isOwner = userRole === 'Owner' || activeSpace.ownerId === user?.id;
    const isAdmin = userRole === 'Admin';
    const canAccessSettings = isOwner || isAdmin;
    const isPrivate = activeSpace.visibility === 'private';
    const canInvite = !isPrivate || canAccessSettings;



    const onStartReposition = () => {
        const currentPos = activeSpace.thumbnailPosition || activeSpace.thumbnailposition || '50% 50%';
        const yVal = parseFloat(currentPos.split(' ')[1] || '50');
        setRepositionY(yVal);
        setIsRepositioning(true);
    };

    const onSavePosition = async () => {
        setIsSavingPosition(true);
        try {
            const newPosition = `50% ${repositionY}%`;
            const updated = await api.spaces.update(activeSpace.id, { thumbnailPosition: newPosition });
            setActiveSpace(updated);
            // Also update list in background
            useSpacesStore.getState().fetchSpaces();
            setIsRepositioning(false);
        } catch (err) {
            console.error('Failed to save position:', err);
        } finally {
            setIsSavingPosition(false);
        }
    };

    const onCancelReposition = () => {
        setIsRepositioning(false);
    };

    const handleMouseDown = (e) => {
        if (!isRepositioning) return;
        e.preventDefault();
        draggingRef.current = true;
        startYRef.current = e.clientY;
        startPosRef.current = repositionY;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!draggingRef.current) return;
        const deltaY = e.clientY - startYRef.current;
        // Sensitivity: 1px = 0.5% change
        // Dragging DOWN (positive delta) -> Move TOWARDS 0% (Top) -> SUBTRACT
        // Dragging UP (negative delta) -> Move TOWARDS 100% (Bottom) -> ADD
        // Wait, standard scrolling logic:
        // Dragging content DOWN usually acts like pulling it.
        // If I pull content DOWN, I see the TOP. Top is 0%.
        // So drag DOWN -> DECREASE percentage.
        // deltaY > 0 => decrease.
        const newY = Math.max(0, Math.min(100, startPosRef.current - (deltaY * 0.2)));
        setRepositionY(newY);
    };

    const handleMouseUp = () => {
        draggingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Check membership
    // If we found it in the 'spaces' store, we are a member.
    // If we had to fetch it separately, we might not be.
    // Also check explicit members list if available.
    const isMember = spaces.some(s => s.id === activeSpace.id) || activeSpace.members?.some(m => m.userId === user?.id);

    const handleJoinRequest = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsJoining(true);
        try {
            await api.spaces.join(activeSpace.id, user.id);
            // Refresh spaces to update membership status
            await useSpacesStore.getState().fetchSpaces();
            // Show success ? 
            // The component will re-render, find space in store, and show normal view
        } catch (err) {
            console.error("Failed to join:", err);
            // using openConfirmation for error alert if needed or just console
        } finally {
            setIsJoining(false);
        }
    };

    if (!isMember) {
        // Validation: If private space, show Not Found (simulate 404)
        if (activeSpace.visibility === 'private') {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 border-4 border-gray-200">
                        <Lock size={40} className="text-gray-400" />
                    </div>
                    <h1 className="text-3xl font-black mb-2">Space Not Found</h1>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        The space you are looking for does not exist or you don't have permission to view it.
                    </p>
                    <button onClick={onBack} className="px-6 py-3 bg-black text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none">
                        Back to Dashboard
                    </button>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] relative">
                <SpacePreviewCard
                    space={activeSpace}
                    onJoin={user ? handleJoinRequest : null}
                    onLogin={() => navigate('/login')}
                    isInvite={false}
                />
                {isJoining && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
                        <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-500 font-bold hover:text-black hover:-translate-x-1 transition-all"><ArrowLeft size={20} /> Back to Dashboard</button>

            {/* Hero */}
            <div
                className={`w-full h-64 rounded-3xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden mb-8 ${isRepositioning ? 'cursor-move ring-4 ring-blue-400' : ''}`}
                style={{
                    ...getSpaceThumbnailStyle(activeSpace.thumbnail),
                    backgroundPosition: isRepositioning ? `50% ${repositionY}%` : (activeSpace.thumbnailPosition || activeSpace.thumbnailposition || '50% 50%')
                }}
                onMouseDown={handleMouseDown}
            >
                {/* Show image if thumbnail is a URL */}
                {isImageThumbnail(activeSpace.thumbnail) && (
                    <img
                        src={getSpaceThumbnailUrl(activeSpace.thumbnail)}
                        alt={activeSpace.name}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                        style={{ objectPosition: isRepositioning ? `50% ${repositionY}%` : (activeSpace.thumbnailPosition || activeSpace.thumbnailposition || '50% 50%') }}
                    />
                )}
                <div className={`absolute inset-0 bg-black/10 transition-opacity ${isRepositioning ? 'opacity-0' : 'opacity-100'}`}></div>

                {/* Reposition Controls */}
                {isRepositioning ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-30">
                        <div className="bg-white p-2 rounded-xl border-2 border-black shadow-lg flex gap-2 animate-in zoom-in duration-200" onMouseDown={e => e.stopPropagation()}>
                            <button onClick={onSavePosition} className="bg-green-400 hover:bg-green-500 text-black px-4 py-2 rounded-lg font-bold border-2 border-black flex items-center gap-2">
                                <Save size={18} /> Save Position
                            </button>
                            <button onClick={onCancelReposition} className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-lg font-bold border-2 border-black flex items-center gap-2">
                                <X size={18} /> Cancel
                            </button>
                        </div>
                        <div className="absolute bottom-4 text-white font-bold bg-black/50 px-4 py-2 rounded-full pointer-events-none">
                            Drag to Reposition
                        </div>
                    </div>
                ) : (
                    /* Settings & Reposition Buttons */
                    canAccessSettings && (
                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                            <button
                                onClick={onStartReposition}
                                className="bg-white/90 hover:bg-white p-2.5 rounded-xl border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none group"
                                title="Reposition Cover"
                            >
                                <Move size={20} className="text-gray-700 group-hover:text-black" />
                            </button>
                            <button
                                onClick={openSpaceSettingsModal}
                                className="bg-white/90 hover:bg-white p-2.5 rounded-xl border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none group"
                                title="Space Settings"
                            >
                                <Settings size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                    )
                )}

                <div className="absolute bottom-6 left-6 md:left-10 text-white drop-shadow-md max-w-[calc(100%-120px)] z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-white/90 text-black border-2 border-black px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{activeSpace.category}</span>
                        {activeSpace.isOnline && <span className="bg-green-400 text-black border-2 border-black px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse">LIVE NOW</span>}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2 text-shadow-lg truncate">{activeSpace.name}</h1>
                    <p className="text-white/90 font-bold text-lg line-clamp-2">{activeSpace.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">


                    {/* Quick Actions */}
                    <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-4">
                        <button onClick={onLaunchUnity} className="flex-1 min-w-[200px] bg-green-400 text-black font-bold py-3 px-4 rounded-xl border-2 border-black hover:bg-green-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 group">
                            <Gamepad2 size={24} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-lg">Join Space (3D)</span>
                        </button>
                        <button onClick={onTextChat} className="flex-1 min-w-[140px] bg-accent text-black font-bold py-3 px-4 rounded-xl border-2 border-black hover:bg-accent-light shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                            <MessageSquare size={20} /> Text Chat
                        </button>
                        {canInvite && (
                            <button onClick={openInviteModal} className="flex-1 min-w-[140px] bg-white text-black font-bold py-3 px-4 rounded-xl border-2 border-black hover:bg-gray-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                                <Link size={20} /> Invite
                            </button>
                        )}
                        {!isOwner && userMember && (
                            <button onClick={handleLeaveSpace} className="flex-1 min-w-[140px] bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl border-2 border-red-500 hover:bg-red-200 shadow-[1px_1px_0px_0px_rgba(239,68,68,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                                <LogOut size={20} /> Leave
                            </button>
                        )}
                    </div>
                    {/* RECENT FILES */}
                    <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black flex items-center gap-2"><FileText size={20} /> Recent Files</h3>
                            <button onClick={openFilesModal} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">View All <ArrowLeft size={16} className="rotate-180" /></button>
                        </div>
                        <div className="space-y-3">
                            {recentFilesLoading ? (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin w-6 h-6 border-2 border-black border-t-accent rounded-full"></div>
                                </div>
                            ) : recentFiles && recentFiles.length > 0 ? (
                                recentFiles.slice(0, 3).map((file, i) => (
                                    <div key={i} onClick={() => setViewingFile(file)} className="flex items-center gap-4 p-3 rounded-xl border-2 border-transparent hover:border-black hover:bg-gray-50 transition-all cursor-pointer group">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {getFileIcon(file.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate" title={file.name}>{file.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">Shared by {file.uploaderName} • {file.time}</p>
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors"><Eye size={18} /></button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 font-medium italic">No files shared yet. Be the first! 📂</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Info */}
                <div className="space-y-6">
                    {/* Stats */}
                    {/* Stats */}
                    <SpaceStats
                        memberCount={activeSpace.memberCount || 0}
                        fileCount={activeSpace.files?.length || activeSpace.fileCount || 0}
                        totalSize={(activeSpace.files || []).reduce((acc, f) => {
                            if (!f.size) return acc;
                            // Handle pre-formatted strings like "1.2 MB"
                            if (typeof f.size === 'string') {
                                const parts = f.size.split(' ');
                                const val = parseFloat(parts[0]);
                                const unit = parts[1]?.toUpperCase();
                                if (isNaN(val)) return acc;
                                if (unit === 'GB') return acc + val * 1024 * 1024 * 1024;
                                if (unit === 'MB') return acc + val * 1024 * 1024;
                                if (unit === 'KB') return acc + val * 1024;
                                return acc + val;
                            }
                            return acc + (Number(f.size) || 0);
                        }, 0)}
                        ownerName={activeSpace.ownerName || activeSpace.members?.find(m => m.userId === activeSpace.ownerId)?.name}
                        createdAt={activeSpace.createdAt}
                        isPrivate={isPrivate}
                    />

                    <div onClick={openMembersModal} className="bg-white border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-gray-50 transition-colors group">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-black flex items-center gap-2"><Users size={20} /> Members</h3>
                            <ArrowLeft size={16} className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(activeSpace.members || []).slice(0, 6).map((m, i) => {
                                const imageUrl = getImageUrl(m.avatarImage);
                                const initial = m.name?.[0]?.toUpperCase() || '?';
                                const bgColor = m.avatarColor || '#6b7280';
                                return (
                                    <div
                                        key={m.id || i}
                                        className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                        style={{ backgroundColor: imageUrl ? 'transparent' : bgColor }}
                                        title={m.name || 'Unknown'}
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={m.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            initial
                                        )}
                                    </div>
                                );
                            })}
                            {Math.max(0, (activeSpace.memberCount || 0) - Math.min(6, (activeSpace.members || []).length)) > 0 && (
                                <div className="w-10 h-10 rounded-xl bg-black text-white border-2 border-black flex items-center justify-center font-bold text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                    +{Math.max(0, (activeSpace.memberCount || 0) - Math.min(6, (activeSpace.members || []).length))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
