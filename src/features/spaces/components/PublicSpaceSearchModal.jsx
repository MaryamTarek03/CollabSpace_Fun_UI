import React, { useState, useCallback, useRef } from 'react';
import { Search, X, Users, Globe, Lock, ArrowRight, Loader } from 'lucide-react';
import { useAuthStore, useSpacesStore, useUIStore } from '../../../store';
import api from '../../../services/api';

// Simple debounce utility
function useDebounce(callback, delay) {
    const timeoutRef = useRef(null);

    return useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}

export default function PublicSpaceSearchModal({ isOpen, onClose }) {
    const { user } = useAuthStore();
    const { joinSpace } = useSpacesStore();
    const { openInfo } = useUIStore();
    const [query, setQuery] = useState('');
    const [allSpaces, setAllSpaces] = useState([]); // Store all public spaces
    const [filteredResults, setFilteredResults] = useState([]); // Displayed results
    const [loading, setLoading] = useState(false);
    const [joiningId, setJoiningId] = useState(null);

    // Fetch all public spaces on open
    React.useEffect(() => {
        if (isOpen) {
            loadPublicSpaces();
        }
    }, [isOpen]);

    const loadPublicSpaces = async () => {
        setLoading(true);
        try {
            // Empty query returns top public spaces
            const data = await api.spaces.search('', user?.id);
            setAllSpaces(data);
            setFilteredResults(data);
        } catch (err) {
            console.error('Failed to load public spaces', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (!val) {
            setFilteredResults(allSpaces);
            return;
        }

        const lowerVal = val.toLowerCase();
        const filtered = allSpaces.filter(space =>
            space.name.toLowerCase().includes(lowerVal) ||
            (space.description || '').toLowerCase().includes(lowerVal)
        );
        setFilteredResults(filtered);
    };

    const handleJoinRequest = async (spaceId) => {
        if (joiningId) return;
        setJoiningId(spaceId);
        try {
            await joinSpace(spaceId);
            // Update local state to show pending in both full and filtered lists
            const updateSpaceStatus = (list) => list.map(s =>
                s.id === spaceId ? { ...s, membershipStatus: 'pending' } : s
            );
            setAllSpaces(prev => updateSpaceStatus(prev));
            setFilteredResults(prev => updateSpaceStatus(prev));
        } catch (err) {
            console.error('Failed to request join', err);
            openInfo({
                title: 'Request Failed',
                message: err?.message || 'Failed to send join request. You may be banned from this space.',
                type: 'error'
            });
        } finally {
            setJoiningId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-[#FFFDF5] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[600px] overflow-hidden animate-in zoom-in-95">

                {/* Header */}
                <div className="p-6 border-b-2 border-black flex items-center justify-between bg-accent">
                    <div className="flex items-center gap-3">
                        <div className="bg-black text-yellow-300 p-2 rounded-xl">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Public Spaces</h2>
                            <p className="font-bold text-sm text-gray-700">Find and join new communities</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-6 bg-white border-b-2 border-black">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={handleSearch}
                            placeholder="Search by name or description..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-black font-bold text-lg outline-none focus:ring-4 focus:ring-yellow-200 transition-all"
                            autoFocus
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader size={20} className="animate-spin text-black" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {filteredResults.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500 font-bold">
                            <Globe size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No public spaces found matching "{query}"</p>
                        </div>
                    )}

                    {filteredResults.map(space => (
                        <div key={space.id} className="bg-white border-2 border-black rounded-2xl p-4 flex items-center gap-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all">
                            <div
                                className="w-16 h-16 rounded-xl border-2 border-black flex items-center justify-center text-white font-black text-xl shrink-0"
                                style={{ background: space.thumbnail }}
                            >
                                {space.name[0]}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-lg truncate">{space.name}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">{space.description || 'No description'}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs font-bold text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Users size={14} /> {space.memberCount} members
                                    </span>
                                    <span>•</span>
                                    <span>By {space.ownerName || 'Unknown'}</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div>
                                {space.membershipStatus === 'member' && (
                                    <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl border-2 border-green-200 flex items-center gap-2">
                                        <Users size={16} /> Joined
                                    </span>
                                )}
                                {space.membershipStatus === 'pending' && (
                                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-xl border-2 border-yellow-200 flex items-center gap-2">
                                        <Loader size={16} className="animate-spin" /> Pending
                                    </span>
                                )}
                                {space.membershipStatus === 'none' && (
                                    <button
                                        onClick={() => handleJoinRequest(space.id)}
                                        disabled={joiningId === space.id}
                                        className="bg-black text-white px-5 py-2.5 rounded-xl font-bold border-2 border-black hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {joiningId === space.id ? (
                                            <Loader size={16} className="animate-spin" />
                                        ) : (
                                            <>Request Join <ArrowRight size={16} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
