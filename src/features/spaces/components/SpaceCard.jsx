import React from 'react';
import { Heart } from 'lucide-react';
import { isImageThumbnail, getSpaceThumbnailStyle, getSpaceThumbnailUrl } from '../../../shared/utils/helpers';
import { useAuthStore } from '../../../store';
import { AvatarGroup } from '../../../shared/components/Avatar';
import Badge, { StatusBadge, PrivacyBadge } from '../../../shared/components/Badge';
import { IconButton } from '../../../shared/components/Button';

export default function SpaceCard({ space, viewMode, onEnter, isFavorite, onToggleFavorite }) {
    const { user } = useAuthStore();
    const memberCount = space.members?.length || space.memberCount || 0;

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onToggleFavorite?.(space.id);
    };

    const FavoriteButton = ({ size = 16, className = '' }) => (
        <button
            onClick={handleFavoriteClick}
            className={`bg-white p-1.5 rounded-lg border-2 border-black hover:bg-pink-50 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${className}`}
        >
            <Heart size={size} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} />
        </button>
    );

    // List View - Compact horizontal layout
    if (viewMode === 'list') {
        return (
            <div
                onClick={() => onEnter(space)}
                className="group relative bg-white border-2 border-black rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center h-20"
            >
                {/* Thumbnail */}
                <div
                    className="relative h-full w-24 shrink-0 border-r-2 border-black"
                    style={getSpaceThumbnailStyle(space.thumbnail)}
                >
                    {isImageThumbnail(space.thumbnail) && (
                        <img
                            src={getSpaceThumbnailUrl(space.thumbnail)}
                            alt={space.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ objectPosition: space.thumbnailPosition || space.thumbnailposition || '50% 50%' }}
                        />
                    )}
                    <div className="absolute top-1 left-1 z-10">
                        <StatusBadge isOnline={space.isOnline} size="xs" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-between px-4 py-2 min-w-0">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-black text-gray-900 truncate group-hover:text-pink-600 transition-colors" title={space.name}>
                                {space.name}
                            </h3>
                            <PrivacyBadge isPrivate={space.isPrivate} size="xs" />
                        </div>
                        <p className="text-xs text-gray-500 truncate">{space.description || 'No description'}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <Badge variant="category" size="sm">{space.category}</Badge>
                        <AvatarGroup users={space.members} max={3} size="xs" />
                    </div>

                    <FavoriteButton size={14} className="ml-4 shrink-0" />
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <div
            onClick={() => onEnter(space)}
            className="group relative bg-white border-2 border-black rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
            <div
                className="relative h-40 overflow-hidden"
                style={getSpaceThumbnailStyle(space.thumbnail)}
            >
                {isImageThumbnail(space.thumbnail) && (
                    <img
                        src={getSpaceThumbnailUrl(space.thumbnail)}
                        alt={space.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: space.thumbnailPosition || space.thumbnailposition || '50% 50%' }}
                    />
                )}
                <div className="absolute top-3 left-3 z-10">
                    <StatusBadge isOnline={space.isOnline} userCount={space.userCount} size="sm" />
                </div>
                <FavoriteButton size={16} className="absolute top-3 right-3 z-10" />
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2 h-[60px]">
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                            <Badge variant="category" size="sm">{space.category}</Badge>
                            <PrivacyBadge isPrivate={space.isPrivate} size="sm" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-pink-600 transition-colors line-clamp-1 break-words" title={space.name}>
                            {space.name}
                        </h3>
                    </div>
                </div>
                <div className="h-[40px] mb-4">
                    <p className="text-sm text-gray-500 font-medium line-clamp-2">{space.description}</p>
                </div>
                <div className="flex items-center justify-between border-t-2 border-gray-100 pt-3 mt-auto">
                    <AvatarGroup users={space.members} max={3} size="sm" />
                </div>
            </div>
        </div>
    );
}
