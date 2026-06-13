import React, { useState, useEffect } from 'react';
import { X, FileText, Folder, FolderPlus, ChevronRight, Home, Edit2, Trash2, Scissors, Copy, Clipboard, CheckSquare, Square, LayoutGrid, List, Link2 } from 'lucide-react';
import FileCard from './components/FileCard';
import UploadCard from './components/UploadCard';
import { getFileIcon, formatBytes } from '../../shared/utils/helpers';
import { useUIStore, useSpacesStore, useAuthStore } from '../../store';
import useFileUpload from './hooks/useFileUpload';
import api from '../../services/api';

export default function FilesModal() {
    // Get state from stores
    const {
        isFilesModalOpen,
        closeFilesModal,
        fileFilter,
        setFileFilter,
        setViewingFile,
        openConfirmation
    } = useUIStore();

    const { activeSpace } = useSpacesStore();
    const { user } = useAuthStore();

    // Folder navigation state
    const [currentFolderId, setCurrentFolderId] = useState(null); // null = root
    const [folderPath, setFolderPath] = useState([]); // breadcrumb path
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editFolderName, setEditFolderName] = useState('');

    // Link creation state
    const [showCreateLink, setShowCreateLink] = useState(false);
    const [newLinkName, setNewLinkName] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    // Selection & Clipboard state
    const [selectedFiles, setSelectedFiles] = useState([]); // array of file ids
    const [clipboard, setClipboard] = useState({ files: [], mode: null }); // mode: 'cut' | 'copy'
    const [selectMode, setSelectMode] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const longPressTimer = React.useRef(null);
    const longPressTriggered = React.useRef(false);

    // Long press to enter select mode
    const handleLongPressStart = (fileId) => {
        longPressTriggered.current = false;
        longPressTimer.current = setTimeout(() => {
            longPressTriggered.current = true;
            setSelectMode(true);
            setSelectedFiles([fileId]);
        }, 500); // 500ms for long press
    };

    const handleLongPressEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const wasLongPress = () => {
        const was = longPressTriggered.current;
        longPressTriggered.current = false;
        return was;
    };

    const fetchContents = async () => {
        if (!isFilesModalOpen || !activeSpace) return;
        setLoading(true);
        try {
            const [foldersData, filesData, statsData] = await Promise.all([
                api.folders.getBySpace(activeSpace.id, currentFolderId),
                api.files.getBySpace(activeSpace.id, currentFolderId),
                api.files.getStats(activeSpace.id)
            ]);
            setFolders(foldersData);
            setFiles(filesData);
            setStats(statsData);
        } catch (err) {
            console.error('Failed to fetch folder contents:', err);
        }
        setLoading(false);
    };

    // File upload hook - pass current folder and success handler
    const {
        uploadState,
        uploadProgress,
        uploadedBytes,
        totalBytes,
        fileInputRef,
        handleFileSelect,
        triggerFileUpload
    } = useFileUpload({ 
        activeSpace, 
        folderId: currentFolderId,
        onUploadSuccess: fetchContents
    });

    // Fetch folders and files when folder changes (excluding uploadState from deps)
    useEffect(() => {
        fetchContents();
    }, [isFilesModalOpen, activeSpace?.id, currentFolderId]);

    // Navigate into a folder
    const navigateToFolder = async (folder) => {
        setCurrentFolderId(folder.id);
        setFolderPath([...folderPath, folder]);
    };

    // Navigate via breadcrumb
    const navigateToBreadcrumb = (index) => {
        if (index === -1) {
            // Go to root
            setCurrentFolderId(null);
            setFolderPath([]);
        } else {
            const folder = folderPath[index];
            setCurrentFolderId(folder.id);
            setFolderPath(folderPath.slice(0, index + 1));
        }
    };

    // Navigate back to parent folder
    const navigateBack = () => {
        if (folderPath.length === 0) return; // Already at root
        if (folderPath.length === 1) {
            // Go to root
            setCurrentFolderId(null);
            setFolderPath([]);
        } else {
            // Go to parent
            const newPath = folderPath.slice(0, -1);
            setCurrentFolderId(newPath[newPath.length - 1].id);
            setFolderPath(newPath);
        }
    };

    // Create folder
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await api.folders.create(activeSpace.id, {
                name: newFolderName.trim(),
                parentId: currentFolderId,
                createdBy: user.id
            });
            setNewFolderName('');
            setShowCreateFolder(false);
            // Refresh
            const foldersData = await api.folders.getBySpace(activeSpace.id, currentFolderId);
            setFolders(foldersData);
        } catch (err) {
            console.error('Failed to create folder:', err);
        }
    };

    // Create link
    const handleCreateLink = async () => {
        if (!newLinkName.trim() || !newLinkUrl.trim()) return;
        try {
            const newFile = await api.files.createLink(
                activeSpace.id,
                newLinkName.trim(),
                newLinkUrl.trim(),
                user.id,
                currentFolderId
            );
            setNewLinkName('');
            setNewLinkUrl('');
            setShowCreateLink(false);
            // Refresh files
            const filesData = await api.files.getBySpace(activeSpace.id, currentFolderId);
            setFiles(filesData);
        } catch (err) {
            console.error('Failed to create link:', err);
        }
    };

    // Rename folder
    const handleRenameFolder = async (folderId) => {
        if (!editFolderName.trim()) return;
        try {
            await api.folders.update(folderId, editFolderName.trim(), activeSpace.id);
            setEditingFolderId(null);
            setEditFolderName('');
            // Refresh
            const foldersData = await api.folders.getBySpace(activeSpace.id, currentFolderId);
            setFolders(foldersData);
        } catch (err) {
            console.error('Failed to rename folder:', err);
        }
    };

    // Rename file
    const [editingFileId, setEditingFileId] = useState(null);
    const [editFileName, setEditFileName] = useState('');

    const handleRenameFile = async (fileId) => {
        if (!editFileName.trim()) return;
        try {
            await api.files.rename(fileId, editFileName.trim(), user.id, activeSpace.id);
            setEditingFileId(null);
            setEditFileName('');
            // Refresh
            const filesData = await api.files.getBySpace(activeSpace.id, currentFolderId);
            setFiles(filesData);
        } catch (err) {
            console.error('Failed to rename file:', err);
        }
    };

    // Delete folder
    const handleDeleteFolder = (folderId, folderName) => {
        openConfirmation({
            title: 'Delete Folder',
            message: `Delete "${folderName}"? Files inside will be moved to root.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.folders.delete(folderId, activeSpace.id);
                    // Refresh
                    const foldersData = await api.folders.getBySpace(activeSpace.id, currentFolderId);
                    setFolders(foldersData);
                } catch (err) {
                    console.error('Failed to delete folder:', err);
                }
            }
        });
    };

    // Selection handlers
    const toggleFileSelection = (fileId) => {
        setSelectedFiles(prev =>
            prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
        );
    };

    const selectAll = () => {
        setSelectedFiles(files.map(f => f.id));
    };

    const clearSelection = () => {
        setSelectedFiles([]);
        setSelectMode(false);
    };

    // Clipboard handlers
    const handleCut = () => {
        if (selectedFiles.length === 0) return;
        setClipboard({ files: [...selectedFiles], mode: 'cut' });
        clearSelection();
    };

    const handleCopy = () => {
        if (selectedFiles.length === 0) return;
        setClipboard({ files: [...selectedFiles], mode: 'copy' });
        clearSelection();
    };

    const handlePaste = async () => {
        if (clipboard.files.length === 0) return;
        try {
            if (clipboard.mode === 'cut') {
                // Cut = move files
                await api.files.move(clipboard.files, currentFolderId, user.id, activeSpace.id);
            } else {
                // Copy = duplicate files
                await api.files.copy(clipboard.files, currentFolderId, user.id, activeSpace.id);
            }
            // Clear clipboard after paste (for both modes)
            setClipboard({ files: [], mode: null });
            // Refresh
            const filesData = await api.files.getBySpace(activeSpace.id, currentFolderId);
            setFiles(filesData);
        } catch (err) {
            console.error('Failed to paste files:', err);
        }
    };

    // Check if user can delete selected files (owns all OR is admin/owner)
    const isOwnerOrAdmin = activeSpace?.ownerId === user?.id ||
        ['Admin', 'Owner'].includes(activeSpace?.members?.find(m => m.userId === user?.id)?.role);

    const canDeleteSelected = () => {
        if (selectedFiles.length === 0) return false;
        if (isOwnerOrAdmin) return true; // Admin/Owner can delete anything
        // Regular user can only delete their own files
        const selectedFileObjects = files.filter(f => selectedFiles.includes(f.id));
        return selectedFileObjects.every(f => f.uploadedBy === user?.id);
    };

    const handleDeleteSelected = () => {
        if (!canDeleteSelected()) return;
        const count = selectedFiles.length;
        openConfirmation({
            title: 'Delete Files',
            message: `Delete ${count} selected file(s)? This cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                try {
                    for (const fileId of selectedFiles) {
                        await api.files.delete(fileId, user.id, activeSpace.id);
                    }
                    clearSelection();
                    // Refresh
                    const filesData = await api.files.getBySpace(activeSpace.id, currentFolderId);
                    setFiles(filesData);
                } catch (err) {
                    console.error('Failed to delete files:', err);
                }
            }
        });
    };

    // Reset state when modal closes
    useEffect(() => {
        if (!isFilesModalOpen) {
            setCurrentFolderId(null);
            setFolderPath([]);
            setSelectedFiles([]);
            setClipboard({ files: [], mode: null });
            setSelectMode(false);
        }
    }, [isFilesModalOpen]);

    // Clear selection when changing folders
    useEffect(() => {
        setSelectedFiles([]);
    }, [currentFolderId]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isFilesModalOpen) return;

        const handleKeyDown = (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Ctrl+A: Select all files
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                setSelectMode(true);
                setSelectedFiles(files.map(f => f.id));
            }
            // Ctrl+X: Cut selected
            if (e.ctrlKey && e.key === 'x' && selectedFiles.length > 0) {
                e.preventDefault();
                handleCut();
            }
            // Ctrl+C: Copy selected
            if (e.ctrlKey && e.key === 'c' && selectedFiles.length > 0) {
                e.preventDefault();
                handleCopy();
            }
            // Ctrl+V: Paste
            if (e.ctrlKey && e.key === 'v' && clipboard.files.length > 0) {
                e.preventDefault();
                handlePaste();
            }
            // Delete: Delete selected
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFiles.length > 0 && canDeleteSelected()) {
                e.preventDefault();
                handleDeleteSelected();
            }
            // Escape: Cancel/clear selection
            if (e.key === 'Escape') {
                if (clipboard.files.length > 0) {
                    setClipboard({ files: [], mode: null });
                } else if (selectedFiles.length > 0) {
                    clearSelection();
                } else if (selectMode) {
                    setSelectMode(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFilesModalOpen, files, selectedFiles, clipboard, selectMode]);

    if (!isFilesModalOpen || !activeSpace) return null;

    // Filter files and resolve uploader name
    const members = activeSpace?.members || [];
    const filteredFiles = files.filter(f => {
        if (fileFilter === 'all') return true;
        if (fileFilter === 'owned') return f.uploadedBy === user?.id;
        const ext = f.type?.toLowerCase();
        if (fileFilter === 'image') {
            return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'fig'].includes(ext);
        }
        if (fileFilter === 'video') {
            return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv'].includes(ext);
        }
        if (fileFilter === 'doc') {
            return ['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv'].includes(ext);
        }
        if (fileFilter === 'presentation') {
            return ['ppt', 'pptx', 'odp', 'key'].includes(ext);
        }
        if (fileFilter === 'link') {
            return ext === 'link';
        }
        return false;
    }).map(f => {
        if (f.uploaderName === 'Unknown' || !f.uploaderName) {
            const uploaderId = f.uploadedBy;
            const uploader = members.find(m => m.id === uploaderId);
            if (uploader) {
                return { ...f, uploaderName: uploader.name || uploader.username };
            }
        }
        return f;
    });

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeFilesModal}></div>
            <div className="relative w-full max-w-3xl bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col h-[600px] animate-in zoom-in-95 duration-200">

                {/* Header with Filter */}
                <div className="p-6 border-b-2 border-black bg-blue-50 rounded-t-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            {/* Back Button - in header when not at root */}
                            {currentFolderId !== null && (
                                <button
                                    onClick={navigateBack}
                                    className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                                    title="Go back"
                                >
                                    <ChevronRight size={20} className="rotate-180" />
                                </button>
                            )}
                            <div>
                                <h2 className="text-2xl font-black flex items-center gap-2"><FileText size={24} /> File Library</h2>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Workspace: {activeSpace.name}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Selection mode toggle */}
                            <button
                                onClick={() => { setSelectMode(!selectMode); if (selectMode) clearSelection(); }}
                                className={`p-2 border-2 border-black rounded-xl transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${selectMode ? 'bg-blue-400 text-white' : 'bg-white hover:bg-blue-100'}`}
                                title={selectMode ? 'Exit selection mode' : 'Select files'}
                            >
                                {selectMode ? <CheckSquare size={20} /> : <Square size={20} />}
                            </button>

                            {/* Selection actions - visible when files selected or clipboard has content */}
                            {(selectedFiles.length > 0 || clipboard.files.length > 0) && (
                                <>
                                    {selectedFiles.length > 0 && (
                                        <>
                                            <button
                                                onClick={handleCut}
                                                className="p-2 bg-white border-2 border-black rounded-xl hover:bg-orange-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                                                title={`Cut ${selectedFiles.length} file(s)`}
                                            >
                                                <Scissors size={20} />
                                            </button>
                                            <button
                                                onClick={handleCopy}
                                                className="p-2 bg-white border-2 border-black rounded-xl hover:bg-blue-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                                                title={`Copy ${selectedFiles.length} file(s)`}
                                            >
                                                <Copy size={20} />
                                            </button>
                                            <button
                                                onClick={handleDeleteSelected}
                                                disabled={!canDeleteSelected()}
                                                className={`p-2 border-2 border-black rounded-xl transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${canDeleteSelected() ? 'bg-white hover:bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                title={canDeleteSelected() ? `Delete ${selectedFiles.length} file(s)` : 'Cannot delete: includes files you don\'t own'}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </>
                                    )}
                                    {clipboard.files.length > 0 && (
                                        <>
                                            <button
                                                onClick={handlePaste}
                                                className={`p-2 border-2 border-black rounded-xl transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${clipboard.mode === 'cut' ? 'bg-orange-200 hover:bg-orange-300' : 'bg-blue-200 hover:bg-blue-300'}`}
                                                title={`Paste ${clipboard.files.length} file(s) here (${clipboard.mode})`}
                                            >
                                                <Clipboard size={20} />
                                            </button>
                                            <button
                                                onClick={() => setClipboard({ files: [], mode: null })}
                                                className="p-2 bg-white border-2 border-black rounded-xl hover:bg-red-100 text-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                                                title="Cancel (clear clipboard)"
                                            >
                                                <X size={20} />
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Divider when selection tools are visible */}
                            {(selectedFiles.length > 0 || clipboard.files.length > 0 || selectMode) && (
                                <div className="w-px bg-gray-300 mx-1"></div>
                            )}

                            <button
                                onClick={() => setShowCreateFolder(!showCreateFolder)}
                                className="p-2 bg-white border-2 border-black rounded-xl hover:bg-accent-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                                title="Create Folder"
                            >
                                <FolderPlus size={20} />
                            </button>
                            <button
                                onClick={() => setShowCreateLink(!showCreateLink)}
                                className="p-2 bg-white border-2 border-black rounded-xl hover:bg-blue-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                                title="Add Link"
                            >
                                <Link2 size={20} />
                            </button>
                            <button onClick={closeFilesModal} className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-red-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"><X size={20} /></button>
                        </div>
                    </div>

                    {/* Selection info bar */}
                    {selectMode && (
                        <div className="flex items-center gap-2 mb-3 text-sm font-bold">
                            <span className="text-gray-600">{selectedFiles.length} selected</span>
                            <button onClick={selectAll} className="text-blue-600 hover:underline">Select all</button>
                            {selectedFiles.length > 0 && (
                                <button onClick={clearSelection} className="text-red-600 hover:underline">Clear</button>
                            )}
                        </div>
                    )}

                    {/* Breadcrumb Navigation */}
                    <div className="flex items-center gap-1 text-sm font-bold mb-3 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => navigateToBreadcrumb(-1)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${currentFolderId === null ? 'bg-black text-white' : 'hover:bg-gray-200'}`}
                        >
                            <Home size={14} /> Root
                        </button>
                        {folderPath.map((folder, i) => (
                            <React.Fragment key={folder.id}>
                                <ChevronRight size={14} className="text-gray-400" />
                                <button
                                    onClick={() => navigateToBreadcrumb(i)}
                                    className={`px-2 py-1 rounded-lg transition-colors truncate max-w-[120px] ${i === folderPath.length - 1 ? 'bg-black text-white' : 'hover:bg-gray-200'}`}
                                >
                                    {folder.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Create Folder Input */}
                    {showCreateFolder && (
                        <div className="flex gap-2 mb-3 animate-in slide-in-from-top-2">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="New folder name..."
                                className="flex-1 px-3 py-2 border-2 border-black rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                autoFocus
                            />
                            <button
                                onClick={handleCreateFolder}
                                className="px-4 py-2 bg-accent border-2 border-black rounded-xl font-bold hover:bg-accent-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                            >
                                Create
                            </button>
                        </div>
                    )}

                    {/* Create Link Input */}
                    {showCreateLink && (
                        <div className="flex gap-2 mb-3 animate-in slide-in-from-top-2">
                            <input
                                type="text"
                                value={newLinkName}
                                onChange={(e) => setNewLinkName(e.target.value)}
                                placeholder="Link name..."
                                className="w-1/3 px-3 py-2 border-2 border-black rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
                                autoFocus
                            />
                            <input
                                type="url"
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 px-3 py-2 border-2 border-black rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateLink()}
                            />
                            <button
                                onClick={handleCreateLink}
                                disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                                className="px-4 py-2 bg-blue-400 text-white border-2 border-black rounded-xl font-bold hover:bg-blue-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                    )}

                    {/* Filter Chips */}
                    {/* Filter Chips & View Toggle */}
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
                            {['all', 'owned', 'image', 'video', 'doc', 'presentation', 'link'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFileFilter(f)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 capitalize transition-all shrink-0 ${fileFilter === f ? 'bg-black text-white border-black' : 'bg-white border-transparent hover:border-black text-gray-500 hover:text-black'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="flex bg-white border-2 border-black rounded-xl p-0.5 shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                                title="Grid View"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                                title="List View"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin w-8 h-8 border-4 border-black border-t-accent rounded-full"></div>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" : "flex flex-col gap-2 mb-6"}>
                            {/* Upload Card */}
                            <UploadCard
                                uploadState={uploadState}
                                uploadProgress={uploadProgress}
                                uploadedBytes={uploadedBytes}
                                totalBytes={totalBytes}
                                triggerFileUpload={triggerFileUpload}
                                fileInputRef={fileInputRef}
                                handleFileSelect={handleFileSelect}
                            />

                            {/* Folder Cards */}
                            {folders.map(folder => (
                                <div
                                    key={folder.id}
                                    className={viewMode === 'grid'
                                        ? "bg-accent-100 border-2 border-black rounded-2xl p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group relative min-h-[100px] flex flex-col justify-between cursor-pointer"
                                        : "bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all group relative flex items-center gap-4 cursor-pointer"
                                    }
                                    onClick={() => editingFolderId !== folder.id && navigateToFolder(folder)}
                                >
                                    {/* Action buttons - top right corner, visible on hover */}
                                    {editingFolderId !== folder.id && (
                                        <div
                                            className={`absolute flex gap-1 z-10 ${viewMode === 'grid' ? 'top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity' : 'right-4 opacity-0 group-hover:opacity-100 transition-opacity'}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => { setEditingFolderId(folder.id); setEditFolderName(folder.name); }}
                                                className="w-7 h-7 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-blue-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px]"
                                                title="Rename"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFolder(folder.id, folder.name)}
                                                className="w-7 h-7 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-red-100 text-red-600 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px]"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {editingFolderId === folder.id ? (
                                        // Editing mode - stacked layout
                                        <div className="flex flex-col gap-2 w-full justify-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editFolderName}
                                                onChange={(e) => setEditFolderName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleRenameFolder(folder.id);
                                                    if (e.key === 'Escape') { setEditingFolderId(null); setEditFolderName(''); }
                                                }}
                                                className="w-full px-3 py-2 border-2 border-black rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRenameFolder(folder.id)}
                                                    className="flex-1 py-2 bg-green-400 border-2 border-black rounded-xl font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px]"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => { setEditingFolderId(null); setEditFolderName(''); }}
                                                    className="flex-1 py-2 bg-gray-200 border-2 border-black rounded-xl font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px]"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Normal mode
                                        <>
                                            <div className="w-10 h-10 bg-accent border-2 border-black rounded-lg flex items-center justify-center shrink-0">
                                                <Folder size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate leading-tight" title={folder.name}>{folder.name}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* File Cards Filtered */}
                            {filteredFiles.map((file, i) => {
                                const canEdit = isOwnerOrAdmin || file.uploadedBy === user?.id;
                                const editButton = (!selectMode && canEdit && editingFileId !== file.id) ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingFileId(file.id); setEditFileName(file.name); }}
                                        className="w-7 h-7 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-blue-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Rename"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                ) : null;

                                return (
                                    <div
                                        key={i}
                                        className="relative group"
                                        onMouseDown={() => !selectMode && handleLongPressStart(file.id)}
                                        onMouseUp={handleLongPressEnd}
                                        onMouseLeave={handleLongPressEnd}
                                        onTouchStart={() => !selectMode && handleLongPressStart(file.id)}
                                        onTouchEnd={handleLongPressEnd}
                                    >
                                        {/* Selection checkbox - visible in select mode */}
                                        {selectMode && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleFileSelection(file.id); }}
                                                className={`absolute z-10 w-6 h-6 border-2 border-black rounded flex items-center justify-center transition-colors ${selectedFiles.includes(file.id) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'} ${viewMode === 'grid' ? 'top-2 left-2' : 'top-1/2 -translate-y-1/2 left-2'}`}
                                            >
                                                {selectedFiles.includes(file.id) && <span className="text-xs font-bold">✓</span>}
                                            </button>
                                        )}

                                        {editingFileId === file.id ? (
                                            // Edit Mode
                                            <div className={`bg-white border-2 border-black rounded-xl p-3 flex flex-col gap-2 z-20 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${viewMode === 'grid' ? 'min-h-[160px] justify-center' : ''}`} onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editFileName}
                                                    onChange={(e) => setEditFileName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleRenameFile(file.id);
                                                        if (e.key === 'Escape') { setEditingFileId(null); setEditFileName(''); }
                                                    }}
                                                    className="w-full px-2 py-1.5 border-2 border-black rounded-lg font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRenameFile(file.id)}
                                                        className="flex-1 py-1 bg-green-400 border-2 border-black rounded-lg font-bold text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingFileId(null); setEditFileName(''); }}
                                                        className="flex-1 py-1 bg-gray-200 border-2 border-black rounded-lg font-bold text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <FileCard
                                                file={file}
                                                getFileIcon={getFileIcon}
                                                onClick={() => {
                                                    if (wasLongPress()) return; // Skip if long press triggered
                                                    if (selectMode) {
                                                        toggleFileSelection(file.id);
                                                    } else {
                                                        setViewingFile(file);
                                                    }
                                                }}
                                                className={selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                                viewMode={viewMode}
                                                actionButton={editButton}
                                            />
                                        )}
                                    </div>
                                );
                            })}

                            {/* Empty state */}
                            {folders.length === 0 && filteredFiles.length === 0 && (
                                <div className="col-span-3 text-center py-12 text-gray-400">
                                    <Folder size={48} className="mx-auto mb-2 opacity-50" />
                                    <p className="font-medium">This folder is empty</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Stats Footer */}
                {stats && (
                    <div className="px-6 py-4 border-t-2 border-black bg-gray-50 flex flex-wrap items-center justify-between gap-4 rounded-b-2xl select-none">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-black">
                            <span className="px-3 py-1.5 bg-white border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 select-none">
                                <Folder size={14} className="text-yellow-600" />
                                <span>{stats.folderCount || stats.FolderCount || 0} Folders</span>
                            </span>
                            <span className="px-3 py-1.5 bg-accent border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 select-none">
                                <div className="flex items-center gap-1">
                                    <FileText size={14} />
                                    <span>{stats.fileCount || stats.FileCount || 0} Files ({formatBytes(stats.totalFileSize || stats.TotalFileSize || 0)})</span>
                                </div>
                                {(stats.linkCount || stats.LinkCount || 0) > 0 && (
                                    <div className="flex items-center gap-1 border-l border-black/20 pl-2">
                                        <Link2 size={14} />
                                        <span>{stats.linkCount || stats.LinkCount || 0} Link${(stats.linkCount || stats.LinkCount || 0) === 1 ? '' : 's'}</span>
                                    </div>
                                )}
                            </span>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-500">
                            Storage Summary
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
