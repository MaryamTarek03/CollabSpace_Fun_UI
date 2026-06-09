import React, { useEffect, useRef } from 'react';
import { getImageUrl } from '../../../shared/utils/helpers';
import { Users, Shield, Crown } from 'lucide-react';

export default function MentionList({
    members,
    filter,
    onSelect,
    onClose,
    position
}) {
    const listRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const special = [
        { id: 'everyone', name: 'Everyone', username: '[everyone]', type: 'special', icon: Users, color: '#ef4444' },
        { id: 'admins', name: 'Admins', username: '[admins]', type: 'special', icon: Shield, color: '#f59e0b' },
        { id: 'owner', name: 'Owner', username: '[owner]', type: 'special', icon: Crown, color: '#a855f7' }
    ];

    const filteredSpecial = special.filter(s =>
        s.name.toLowerCase().includes(filter.toLowerCase()) ||
        s.username.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredUsers = members.filter(member =>
        member.name.toLowerCase().includes(filter.toLowerCase()) ||
        member.username?.toLowerCase().includes(filter.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions

    const filteredMembers = [...filteredSpecial, ...filteredUsers];

    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredMembers.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if (filteredMembers[selectedIndex]) {
                    onSelect(filteredMembers[selectedIndex]);
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
    }, [filteredMembers, selectedIndex, onSelect, onClose]);

    if (filteredMembers.length === 0) return null;

    return (
        <div
            className="absolute z-50 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-w-[200px]"
            style={{
                bottom: '100%',
                left: position?.left || 0,
                marginBottom: '10px'
            }}
        >
            <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-500 border-b-2 border-gray-200">
                Mention Member
            </div>
            <div className="max-h-60 overflow-y-auto">
                {filteredMembers.map((member, index) => {
                    const Icon = member.icon;
                    return (
                        <button
                            key={member.id}
                            onClick={() => onSelect(member)}
                            className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${index === selectedIndex ? 'bg-accent/10 border-l-4 border-accent' : 'hover:bg-gray-50 border-l-4 border-transparent'
                                }`}
                        >
                            <div
                                className="w-8 h-8 rounded-full border-2 border-black flex-shrink-0 bg-cover bg-center flex items-center justify-center overflow-hidden"
                                style={{
                                    backgroundColor: member.type === 'special' ? member.color : (member.avatarColor || '#ec4899'),
                                    backgroundImage: member.avatarImage ? `url(${getImageUrl(member.avatarImage)})` : 'none'
                                }}
                            >
                                {member.type === 'special' ? (
                                    <Icon size={14} className="text-white" />
                                ) : (
                                    !member.avatarImage && (
                                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                            {member.name?.charAt(0) || '?'}
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm truncate">{member.name}</p>
                                <p className="text-xs text-gray-500 truncate">@{member.username || member.name.replace(/\s+/g, '').toLowerCase()}</p>
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
