import React from 'react';
import { Lock, Users, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { getSpaceThumbnailStyle, getSpaceThumbnailUrl, isImageThumbnail } from '../../../shared/utils/helpers';

export default function SpacePreviewCard({ space, onJoin, isInvite, onLogin }) {
    if (!space) return null;

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                {/* Header Image with Blur */}
                <div className="h-48 relative overflow-hidden bg-gray-100">
                    <div className="absolute inset-0 filter blur-sm scale-110">
                        <div className="w-full h-full" style={getSpaceThumbnailStyle(space.thumbnail)}>
                            {isImageThumbnail(space.thumbnail) && (
                                <img src={getSpaceThumbnailUrl(space.thumbnail)} alt="Preview" className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl border-2 border-white/50 flex items-center justify-center">
                            <Lock className="text-white" size={32} />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center relative">
                    {/* Category Badge */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-2 bg-yellow-300 border-2 border-black rounded-full font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {space.category || 'Space'}
                    </div>

                    <h1 className="text-3xl font-black mb-2 mt-4">{space.name}</h1>

                    <div className="flex items-center justify-center gap-2 text-gray-500 font-bold mb-6">
                        <Users size={18} />
                        <span>{space.memberCount || 0} Members</span>
                        <span>•</span>
                        <Shield size={18} />
                        <span className="capitalize">{space.visibility || 'Private'}</span>
                    </div>

                    <p className="text-gray-600 mb-8 line-clamp-3">
                        {space.description || "This space is private. Join to see the content and collaborate with members."}
                    </p>

                    {onJoin ? (
                        <button
                            onClick={onJoin}
                            className="w-full py-4 bg-black text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none flex items-center justify-center gap-2 group"
                        >
                            <Sparkles className="text-yellow-300 group-hover:rotate-12 transition-transform" />
                            {isInvite ? 'Accept Invite & Join' : 'Request to Join'}
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="font-bold text-gray-900">Sign in to join this space</p>
                            <button
                                onClick={onLogin}
                                className="w-full py-4 bg-white text-black font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none"
                            >
                                Sign In / Register
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
