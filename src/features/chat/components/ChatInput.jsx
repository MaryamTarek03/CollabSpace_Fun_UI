import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Reply, Paperclip, Image, FileText, Loader2 } from 'lucide-react';
import { useChatStore } from '../../../store';
import MentionList from './MentionList';

export default function ChatInput({
    chatInput,
    setChatInput,
    handleSendMessage,
    spaceName,
    selectedFiles,
    setSelectedFiles,
    isSending = false
}) {
    const { replyingTo, clearReplyingTo, members } = useChatStore();
    const [mentionFilter, setMentionFilter] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionCoords, setMentionCoords] = useState({ left: 0 });
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Monitor input for @ mentions
    useEffect(() => {
        const lastAtIndex = chatInput.lastIndexOf('@', cursorPosition - 1);

        if (lastAtIndex !== -1) {
            const textAfterAt = chatInput.slice(lastAtIndex + 1, cursorPosition);

            // Check if there's a space before the @ (or it's at start)
            const isStartOrSpace = lastAtIndex === 0 || chatInput[lastAtIndex - 1] === ' ';
            // Check if there are no spaces in the query (simple username matching)
            const hasNoSpaces = !textAfterAt.includes(' ');

            if (isStartOrSpace && hasNoSpaces) {
                setMentionFilter(textAfterAt);
                setShowMentions(true);

                // Calculate position for popup
                const inputRect = inputRef.current?.getBoundingClientRect();
                if (inputRect) {
                    const leftOffset = Math.min((lastAtIndex * 8) + 20, inputRect.width - 220);
                    setMentionCoords({ left: leftOffset });
                }
                return;
            }
        }

        setShowMentions(false);
    }, [chatInput, cursorPosition]);

    const handleMentionSelect = (member) => {
        const lastAtIndex = chatInput.lastIndexOf('@', cursorPosition - 1);
        const textBeforeAt = chatInput.slice(0, lastAtIndex);
        const textAfterCursor = chatInput.slice(cursorPosition);

        const insertedMention = member.username || member.name.replace(/\s+/g, '');
        const newValue = `${textBeforeAt}@${insertedMention} ${textAfterCursor}`;
        setChatInput(newValue);
        setShowMentions(false);

        if (inputRef.current) {
            inputRef.current.focus();
            setTimeout(() => {
                const newCursorPos = lastAtIndex + 1 + insertedMention.length + 1;
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (showMentions) return;
        }

        if (e.key === 'Enter') {
            if (showMentions) {
                e.preventDefault();
                return;
            }
        }

        if (e.key === 'Escape') {
            if (showMentions) {
                e.preventDefault();
                setShowMentions(false);
                return;
            }
            if (replyingTo) {
                clearReplyingTo();
            }
        }
    };

    const onInputChange = (e) => {
        setChatInput(e.target.value);
        setCursorPosition(e.target.selectionStart);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const isImage = (file) => file.type.startsWith('image/');

    const hasContent = chatInput.trim() || selectedFiles.length > 0;

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
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                                {isImage(file) ? (
                                    <div className="w-16 h-16 rounded-xl border-2 border-black overflow-hidden bg-gray-100">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-xl border-2 border-black bg-gray-100 flex flex-col items-center justify-center p-1">
                                        <FileText size={20} className="text-gray-500" />
                                        <span className="text-[8px] text-gray-500 truncate w-full text-center mt-1">
                                            {file.name.split('.').pop()?.toUpperCase()}
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
                <form onSubmit={(e) => {
                    if (showMentions) {
                        e.preventDefault();
                        return;
                    }
                    handleSendMessage(e);
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
                            value={chatInput}
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
