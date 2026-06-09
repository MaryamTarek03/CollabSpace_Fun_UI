import React from 'react';
import { Lock, Globe } from 'lucide-react';

/**
 * Badge Component
 * Displays status, category, or label badges with consistent styling.
 * 
 * @param {string} variant - Badge style: 'live' | 'offline' | 'category' | 'private' | 'public' | 'success' | 'warning' | 'danger' | 'info'
 * @param {string} size - Badge size: 'xs' | 'sm' | 'md'
 * @param {boolean} pulse - Animate with pulse effect
 * @param {React.ReactNode} children - Badge content
 */
export default function Badge({
    variant = 'category',
    size = 'sm',
    pulse = false,
    className = '',
    children
}) {
    const baseClasses = 'inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded-lg border';

    const variantClasses = {
        live: 'bg-green-400 text-black border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]',
        offline: 'bg-gray-200 text-gray-600 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]',
        category: 'bg-blue-100 text-blue-800 border-blue-200',
        private: 'bg-pink-100 text-pink-500 border-pink-200',
        public: 'bg-cyan-100 text-cyan-600 border-cyan-200',
        success: 'bg-green-100 text-green-700 border-green-200',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        danger: 'bg-red-100 text-red-700 border-red-200',
        info: 'bg-blue-100 text-blue-700 border-blue-200'
    };

    const sizeClasses = {
        xs: 'px-1 py-0.5 text-[8px]',
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2 py-1 text-xs'
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${pulse ? 'animate-pulse' : ''} ${className}`}>
            {children}
        </span>
    );
}

/**
 * Privacy Badge - Shows lock/globe icon based on privacy status
 */
export function PrivacyBadge({ isPrivate, size = 'sm' }) {
    const iconSizes = { xs: 10, sm: 12, md: 14 };

    if (isPrivate) {
        return (
            <div className={`p-1 rounded-md bg-pink-100 text-pink-500 border border-pink-200`} title="Private Space">
                <Lock size={iconSizes[size]} />
            </div>
        );
    }

    return (
        <div className={`p-1 rounded-md bg-cyan-100 text-cyan-600 border border-cyan-200`} title="Public Space">
            <Globe size={iconSizes[size]} />
        </div>
    );
}

/**
 * Status Badge - For online/offline status
 */
export function StatusBadge({ isOnline, userCount, size = 'sm' }) {
    if (isOnline) {
        return (
            <Badge variant="live" size={size} pulse>
                LIVE {userCount > 0 && `(${userCount})`}
            </Badge>
        );
    }
    return <Badge variant="offline" size={size}>OFFLINE</Badge>;
}
