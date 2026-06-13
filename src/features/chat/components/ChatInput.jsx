import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Reply, Paperclip, FileText, Loader2 } from 'lucide-react';
import { useChatStore } from '../../../store';
import MentionList from './MentionList';
import FileMentionList from './FileMentionList';

export default function ChatInput({
    onSendMessage,
    spaceName,
    isSending = false,
    spaceFiles = []
}) {
    const { replyingTo, clearReplyingTo, members } = useChatStore();
    const [text, setText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [mentionFilter, setMentionFilter] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionCoords, setMentionCoords] = useState({ left: 0 });
    const [fileFilter, setFileFilter] = useState('');
    const [showFileMentions, setShowFileMentions] = useState(false);
    const [fileCoords, setFileCoords] = useState({ left: 0 });
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Track selected files in a ref for cleanup on unmount
    const selectedFilesRef = useRef(selectedFiles);
    useEffect(() => {
        selectedFilesRef.current = selectedFiles;
    }, [selectedFiles]);

    // Revoke object URLs on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            selectedFilesRef.current.forEach(item => {
                if (item.previewUrl && item.file) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, []);

    // Monitor input for @ and # mentions
    useEffect(() => {
        const lastAtIndex = text.lastIndexOf('@', cursorPosition - 1);
        const lastHashIndex = text.lastIndexOf('#', cursorPosition - 1);

        if (lastAtIndex !== -1 && (lastHashIndex === -1 || lastAtIndex > lastHashIndex)) {
            const textAfterAt = text.slice(lastAtIndex + 1, cursorPosition);
            const isStartOrSpace = lastAtIndex === 0 || text[lastAtIndex - 1] === ' ';
            const hasNoSpaces = !textAfterAt.includes(' ');

            if (isStartOrSpace && hasNoSpaces) {
                setMentionFilter(textAfterAt);
                setShowMentions(true);
                setShowFileMentions(false);

                const inputRect = inputRef.current?.getBoundingClientRect();
                if (inputRect) {
                    const leftOffset = Math.min((lastAtIndex * 8) + 20, inputRect.width - 220);
                    setMentionCoords({ left: leftOffset });
                }
                return;
            }
        } else if (lastHashIndex !== -1 && (lastAtIndex === -1 || lastHashIndex > lastAtIndex)) {
            const textAfterHash = text.slice(lastHashIndex + 1, cursorPosition);
            const isStartOrSpace = lastHashIndex === 0 || text[lastHashIndex - 1] === ' ';
            const hasNoSpaces = !textAfterHash.includes(' ');

            if (isStartOrSpace && hasNoSpaces) {
                setFileFilter(textAfterHash);
                setShowFileMentions(true);
                setShowMentions(false);

                const inputRect = inputRef.current?.getBoundingClientRect();
                if (inputRect) {
                    const leftOffset = Math.min((lastHashIndex * 8) + 20, inputRect.width - 220);
                    setFileCoords({ left: leftOffset });
                }
                return;
            }
        }

        setShowMentions(false);
        setShowFileMentions(false);
    }, [text, cursorPosition]);

    const handleMentionSelect = (member) => {
        const lastAtIndex = text.lastIndexOf('@', cursorPosition - 1);
        const textBeforeAt = text.slice(0, lastAtIndex);
        const textAfterCursor = text.slice(cursorPosition);

        const insertedMention = member.username || member.name.replace(/\s+/g, '');
        const newValue = `${textBeforeAt}@${insertedMention} ${textAfterCursor}`;
        setText(newValue);
        setShowMentions(false);

        if (inputRef.current) {
            inputRef.current.focus();
            setTimeout(() => {
                const newCursorPos = lastAtIndex + 1 + insertedMention.length + 1;
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
    };

    const handleFileMentionSelect = (file) => {
        const lastHashIndex = text.lastIndexOf('#', cursorPosition - 1);
        const textBeforeHash = text.slice(0, lastHashIndex);
        const textAfterCursor = text.slice(cursorPosition);

        const insertedName = file.name;
        const newValue = `${textBeforeHash}#${insertedName} ${textAfterCursor}`;
        setText(newValue);
        setShowFileMentions(false);

        // Add to selectedFiles as an existing file
        const alreadyAttached = selectedFiles.some(f => f.fileId === file.id);
        if (!alreadyAttached) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5153/api';
            const isImage = file.mimeType?.startsWith('image/') || file.name?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
            const previewUrl = isImage ? `${baseUrl}/spaces/storage/files/${file.id}/download` : null;

            setSelectedFiles(prev => [...prev, {
                id: Math.random().toString(36).substring(2, 9),
                fileId: file.id,
                name: file.name,
                mimeType: file.mimeType || file.type,
                size: file.size,
                previewUrl
            }].slice(0, 5)); // Max 5 attachments
        }

        if (inputRef.current) {
            inputRef.current.focus();
            setTimeout(() => {
                const newCursorPos = lastHashIndex + 1 + insertedName.length + 1;
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (showMentions || showFileMentions) return;
        }

        if (e.key === 'Enter') {
            if (showMentions || showFileMentions) {
                e.preventDefault();
                return;
            }
        }

        if (e.key === 'Escape') {
            if (showMentions || showFileMentions) {
                e.preventDefault();
                setShowMentions(false);
                setShowFileMentions(false);
                return;
            }
            if (replyingTo) {
                clearReplyingTo();
            }
        }
    };

    const onInputChange = (e) => {
        setText(e.target.value);
        setCursorPosition(e.target.selectionStart);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files).map(file => {
            const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
            return {
                id: Math.random().toString(36).substring(2, 9),
                file,
                previewUrl
            };
        });

        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const removeFile = (index) => {
        const item = selectedFiles[index];
        if (item?.previewUrl && item.file) {
            URL.revokeObjectURL(item.previewUrl);
        }
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const hasContent = text.trim() || selectedFiles.length > 0;

    return (
        <div className="border-t-2 border-black bg-white relative">
            {/* Mention List Popup */}
            {showMentions && (
                <MentionList
                    members={members}
                    filter={mentionFilter}
                    onSelect={handleMentionSelect}
                    onClose={() => setShowMentions(false)}
                    position={mentionCoords}
                />
            )}

            {/* File Mention List Popup */}
            {showFileMentions && (
                <FileMentionList
                    files={spaceFiles}
                    filter={fileFilter}
                    onSelect={handleFileMentionSelect}
                    onClose={() => setShowFileMentions(false)}
                    position={fileCoords}
                />
            )}

            {/* Reply Preview */}
            {replyingTo && (
                <div className="px-4 pt-3 pb-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 border-l-4 border-l-accent rounded-xl">
                        <Reply size={16} className="text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-accent block">Replying to {replyingTo.sender}</span>
                            <p className="text-sm text-gray-600 truncate">{replyingTo.text}</p>
                        </div>
                        <button
                            onClick={clearReplyingTo}
                            className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-black transition-colors flex-shrink-0"
                            title="Cancel reply (Esc)"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* File Preview Bar */}
            {selectedFiles.length > 0 && (
                <div className="px-4 pt-3 pb-2">
                    <div className="flex gap-2 flex-wrap">
                        {selectedFiles.map((fileObj, index) => (
                            <div key={fileObj.id || index} className="relative group">
                                {fileObj.previewUrl ? (
                                    <div className="w-16 h-16 rounded-xl border-2 border-black overflow-hidden bg-gray-100">
                                        <img
                                            src={fileObj.previewUrl}
                                            alt={fileObj.file?.name || fileObj.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-xl border-2 border-black bg-gray-100 flex flex-col items-center justify-center p-1">
                                        <FileText size={20} className="text-gray-500" />
                                        <span className="text-[8px] text-gray-500 truncate w-full text-center mt-1">
                                            {(fileObj.file?.name || fileObj.name).split('.').pop()?.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-4">
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (showMentions || showFileMentions) {
                        return;
                    }
                    if (!hasContent || isSending) return;

                    const filesToSend = selectedFiles.filter(item => item.file).map(item => item.file);
                    const existingFileIds = selectedFiles.filter(item => item.fileId).map(item => item.fileId);
                    const success = await onSendMessage(text, filesToSend, existingFileIds);
                    if (success) {
                        setText('');
                        // Revoke all preview URLs before clearing
                        selectedFiles.forEach(item => {
                            if (item.previewUrl && item.file) {
                                URL.revokeObjectURL(item.previewUrl);
                            }
                        });
                        setSelectedFiles([]);
                    }
                }} className="relative flex gap-2">
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Attachment button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 w-14 h-14 bg-gray-50 border-2 border-black rounded-2xl flex items-center justify-center hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        title="Attach files"
                    >
                        <Paperclip size={22} className="text-gray-600" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            id="chat-input"
                            value={text}
                            onChange={onInputChange}
                            onClick={(e) => setCursorPosition(e.target.selectionStart)}
                            onKeyUp={(e) => setCursorPosition(e.target.selectionStart)}
                            onKeyDown={handleInputKeyDown}
                            autoComplete='off'
                            className="w-full bg-gray-50 border-2 border-black rounded-2xl py-4 pl-4 pr-14 font-medium focus:outline-none focus:ring-2 focus:ring-accent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                            placeholder={replyingTo ? `Reply to ${replyingTo.sender}...` : `Message #${spaceName}...`}
                        />
                        <button
                            type="submit"
                            disabled={!hasContent || isSending}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-accent border-2 border-black rounded-xl flex items-center justify-center hover:bg-accent-dark active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
