import React from 'react';
import { getImageUrl } from '../utils/helpers';

/**
 * Avatar Component
 * Displays user avatar with image or initials fallback.
 * 
 * @param {object} user - User object with name, avatarImage, avatarColor
 * @param {string} size - Avatar size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} showOnline - Show online indicator dot
 * @param {boolean} isOnline - Online status
 * @param {string} className - Additional classes
 */
export default function Avatar({
    user,
    size = 'md',
    showOnline = false,
    isOnline = false,
    className = ''
}) {
    const sizeClasses = {
        xs: 'w-5 h-5 text-[8px]',
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
        xl: 'w-12 h-12 text-base'
    };

    const onlineDotSizes = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-3.5 h-3.5'
    };

    const imageUrl = getImageUrl(user?.avatarImage);
    const initial = user?.name?.[0]?.toUpperCase() || '?';
    const bgColor = user?.avatarColor || '#6b7280';

    return (
        <div className={`relative inline-block ${className}`}>
            <div
                className={`${sizeClasses[size]} rounded-xl border-2 border-black flex items-center justify-center font-bold text-white overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}
                style={{ backgroundColor: imageUrl ? 'transparent' : bgColor }}
                title={user?.name || 'Unknown'}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={user?.name || 'Avatar'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    initial
                )}
            </div>
            {showOnline && (
                <span
                    className={`absolute bottom-0 right-0 ${onlineDotSizes[size]} rounded-full border-2 border-black ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                />
            )}
        </div>
    );
}

/**
 * Avatar Group Component
 * Displays stacked avatars with overflow indicator.
 * 
 * @param {array} users - Array of user objects
 * @param {number} max - Maximum number of visible avatars
 * @param {string} size - Avatar size
 */
export function AvatarGroup({ users = [], max = 3, size = 'sm' }) {
    const visible = users.slice(0, max);
    const remaining = users.length - max;

    const overlapClasses = {
        xs: '-space-x-1',
        sm: '-space-x-1.5',
        md: '-space-x-2',
        lg: '-space-x-2.5',
        xl: '-space-x-3'
    };

    const sizeClasses = {
        xs: 'w-5 h-5 text-[8px]',
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
        xl: 'w-12 h-12 text-base'
    };

    if (users.length === 0) {
        return <span className="text-xs text-gray-400 font-medium">No members yet</span>;
    }

    return (
        <div className={`flex ${overlapClasses[size]}`}>
            {visible.map((user, i) => (
                <Avatar key={user.memberId || user.id || i} user={user} size={size} />
            ))}
            {remaining > 0 && (
                <div
                    className={`${sizeClasses[size]} rounded-xl border-2 border-black bg-black text-white flex items-center justify-center font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}
