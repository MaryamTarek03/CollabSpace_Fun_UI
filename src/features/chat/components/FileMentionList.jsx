import React, { useEffect, useRef } from 'react';
import { FileText, Link2, Image, FileCode, Film, Music } from 'lucide-react';

export default function FileMentionList({
    files,
    filter,
    onSelect,
    onClose,
    position
}) {
    const containerRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const getFileIcon = (type, name) => {
        const ext = name?.split('.').pop()?.toLowerCase();
        if (type === 'link') return Link2;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return Image;
        if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return Film;
        if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return Music;
        if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'cs', 'go', 'sh'].includes(ext)) return FileCode;
        return FileText;
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(filter.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions

    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    useEffect(() => {
        if (containerRef.current) {
            const selectedElement = containerRef.current.children[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'auto'
                });
            }
        }
    }, [selectedIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if (filteredFiles[selectedIndex]) {
                    onSelect(filteredFiles[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        const input = document.getElementById('chat-input');
        input?.addEventListener('keydown', handleKeyDown);

        return () => {
            input?.removeEventListener('keydown', handleKeyDown);
        };
    }, [filteredFiles, selectedIndex, onSelect, onClose]);

    if (filteredFiles.length === 0) return null;

    return (
        <div
            className="absolute z-50 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-w-[240px]"
            style={{
                bottom: '100%',
                left: position?.left || 0,
                marginBottom: '10px'
            }}
        >
            <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-500 border-b-2 border-gray-200">
                Mention File from Storage
            </div>
            <div ref={containerRef} className="max-h-60 overflow-y-auto">
                {filteredFiles.map((file, index) => {
                    const Icon = getFileIcon(file.type, file.name);
                    return (
                        <button
                            key={file.id}
                            onClick={() => onSelect(file)}
                            className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                                index === selectedIndex ? 'bg-accent/10 border-l-4 border-accent' : 'hover:bg-gray-50 border-l-4 border-transparent'
                            }`}
                        >
                            <div className="w-8 h-8 rounded-lg border-2 border-black bg-gray-50 flex items-center justify-center shrink-0">
                                <Icon size={16} className="text-gray-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm truncate">{file.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">
                                    {file.size} • {file.uploaderName || 'Unknown'}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="bg-gray-50 px-3 py-2 text-[10px] text-gray-400 border-t border-gray-100 flex justify-between">
                <span>Tab/Enter to select</span>
                <span>Esc to close</span>
            </div>
        </div>
    );
}
