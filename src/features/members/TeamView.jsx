import React, { useState, useEffect } from 'react';
import { Users, Search, X } from 'lucide-react';
import { useAuthStore } from '../../store';
import api from '../../services/api';
import { getImageUrl } from '../../shared/utils/helpers';
import UserProfileModal from '../profile/UserProfileModal';
import Avatar from '../../shared/components/Avatar';

export default function TeamView() {
    const { user } = useAuthStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [viewingProfileId, setViewingProfileId] = useState(null);

    const [allUsers, setAllUsers] = useState([]);

    // Load all users on mount
    useEffect(() => {
        const loadUsers = async () => {
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
        loadUsers();
    }, [user?.id]);

    // Local filtering
    useEffect(() => {
        if (!query) {
            setResults(allUsers);
            return;
        }

        const lowerVal = query.toLowerCase();
        const filtered = allUsers.filter(u =>
            u.name.toLowerCase().includes(lowerVal) ||
            u.username.toLowerCase().includes(lowerVal)
        );
        setResults(filtered);
    }, [query, allUsers]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight flex items-center gap-3">
                    <Users size={36} className="text-blue-500" />
                    Team Directory
                </h1>
                <p className="text-gray-500 font-medium">Find and connect with other users</p>
            </header>

            {/* Search Box */}
            <div className="bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-6 mb-8">
                <div className="flex items-center gap-3 bg-gray-50 border-2 border-black rounded-xl px-4 py-3">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or @username..."
                        className="flex-1 bg-transparent text-lg font-medium outline-none"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] overflow-hidden">
                {isSearching ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : results.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Users Found</h3>
                        <p className="text-gray-500">Try a different search term</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Users Found</h3>
                        <p className="text-gray-500">Try a different search term</p>
                    </div>
                ) : (
                    <div className="divide-y-2 divide-black bg-white">
                        {results.map(result => (
                            <button
                                key={result.id}
                                onClick={() => setViewingProfileId(result.id)}
                                className="w-full flex items-center gap-4 p-5 hover:bg-yellow-50 transition-colors text-left first:rounded-t-2xl last:rounded-b-2xl border-black"
                            >
                                <Avatar user={result} size="xl" className="flex-shrink-0 !shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-lg truncate hover:text-pink-600 transition-colors">{result.name}</p>
                                    <p className="text-gray-500 font-medium">@{result.username}</p>
                                    {result.bio && (
                                        <p className="text-sm text-gray-400 truncate mt-1">{result.bio}</p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

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
