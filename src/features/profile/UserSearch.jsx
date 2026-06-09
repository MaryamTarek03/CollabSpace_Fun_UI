import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';
import api from '../../services/api';
import { getImageUrl } from '../../shared/utils/helpers';
import { useAuthStore } from '../../store';
import UserProfileModal from './UserProfileModal';

export default function UserSearch() {
    const { user } = useAuthStore();
    const [query, setQuery] = useState('');
    const [allUsers, setAllUsers] = useState([]); // Store all users
    const [results, setResults] = useState([]); // Filtered results
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [viewingProfileId, setViewingProfileId] = useState(null);
    const inputRef = useRef(null);

    // Load users on open
    useEffect(() => {
        if (isOpen) {
            loadAllUsers();
        }
    }, [isOpen]);

    const loadAllUsers = async () => {
        setIsSearching(true);
        try {
            const data = await api.users.search('', user?.id);
            setAllUsers(data);
            setResults(data);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (!val) {
            setResults(allUsers);
            return;
        }

        const lowerVal = val.toLowerCase();
        const filtered = allUsers.filter(u =>
            u.name.toLowerCase().includes(lowerVal) ||
            u.username.toLowerCase().includes(lowerVal)
        );
        setResults(filtered);
    };

    const handleResultClick = (userId) => {
        setViewingProfileId(userId);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative">
            {/* Search Button */}
            <button
                onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-xl font-bold hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
                <Search size={18} />
                <span className="hidden sm:inline">Find People</span>
            </button>

            {/* Search Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-hidden">
                        {/* Search Input */}
                        <div className="flex items-center gap-3 p-4 border-b-2 border-black">
                            <Search size={20} className="text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={handleSearch}
                                placeholder="Search by name or @username..."
                                className="flex-1 text-lg font-medium outline-none"
                                autoFocus
                            />
                            {query && (
                                <button onClick={() => { setQuery(''); setResults(allUsers); }} className="text-gray-400 hover:text-gray-600">
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        <div className="max-h-80 overflow-y-auto">
                            {isSearching ? (
                                <div className="flex justify-center p-8">
                                    <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : results.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    No users found
                                </div>
                            ) : (
                                <div className="p-2">
                                    {results.map(result => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleResultClick(result.id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors text-left"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bold text-white flex-shrink-0"
                                                style={{ backgroundColor: result.avatarColor || '#9ca3af' }}
                                            >
                                                {result.avatarImage ? (
                                                    <img
                                                        src={getImageUrl(result.avatarImage)}
                                                        alt=""
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    result.name?.[0] || '?'
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate">{result.name}</p>
                                                <p className="text-sm text-gray-500 truncate">@{result.username}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {viewingProfileId && (
                <UserProfileModal
                    userId={viewingProfileId}
                    viewerId={user?.id}
                    onClose={() => setViewingProfileId(null)}
                />
            )}
        </div>
    );
}
