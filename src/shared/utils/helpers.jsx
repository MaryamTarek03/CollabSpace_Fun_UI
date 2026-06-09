import React from 'react';
import { FileText, Image as ImageIcon, Film, Presentation, File, FileArchive, FileCode, FileSpreadsheet, Music, Link2 } from 'lucide-react';

// API Base URL for images
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

/**
 * Format bytes to human readable string (e.g., "1.5 MB")
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted string
 */
export const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    // If already a formatted string (contains letters), return as-is
    if (typeof bytes === 'string' && /[a-zA-Z]/.test(bytes)) return bytes;
    // Parse to number if string
    const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(numBytes) || numBytes === 0) return '0 B';
    if (numBytes >= 1024 * 1024 * 1024) return (numBytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    if (numBytes >= 1024 * 1024) return (numBytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (numBytes >= 1024) return (numBytes / 1024).toFixed(1) + ' KB';
    return numBytes + ' B';
};

/**
 * Get file icon based on file type/extension
 * @param {string} type - File extension or type (e.g., 'PDF', 'png', 'doc')
 * @returns {JSX.Element} Lucide icon component
 */
export const getFileIcon = (type) => {
    const ext = (type || '').toLowerCase();

    // Images
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'fig'].includes(ext)) {
        return <ImageIcon size={20} className="text-pink-500" />;
    }

    // Videos
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv'].includes(ext)) {
        return <Film size={20} className="text-purple-500" />;
    }

    // Audio
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
        return <Music size={20} className="text-green-500" />;
    }

    // PDF (special case - distinct red color)
    if (ext === 'pdf') {
        return <FileText size={20} className="text-red-500" />;
    }

    // Documents (excluding PDF)
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
        return <FileText size={20} className="text-blue-500" />;
    }

    // Spreadsheets
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
        return <FileSpreadsheet size={20} className="text-green-600" />;
    }

    // Presentations
    if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) {
        return <Presentation size={20} className="text-orange-500" />;
    }

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
        return <FileArchive size={20} className="text-yellow-600" />;
    }

    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml', 'md'].includes(ext)) {
        return <FileCode size={20} className="text-emerald-500" />;
    }

    // Links
    if (ext === 'link') {
        return <Link2 size={20} className="text-blue-500" />;
    }

    // Default
    return <File size={20} className="text-gray-500" />;
};

/**
 * Get full URL for an image path from the backend
 * @param {string} path - The relative image path (e.g., "/images/avatar.jpg")
 * @returns {string|null} Full URL or null if no path
 */
export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}${path}`;
};

export const GRADIENT_OPTIONS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
];

/**
 * Check if thumbnail is an image (vs gradient/color)
 * @param {string} thumbnail - The thumbnail value
 * @returns {boolean} True if it's an image URL
 */
export const isImageThumbnail = (thumbnail) => {
    if (!thumbnail) return false;
    if (thumbnail.startsWith('linear-gradient')) return false;
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(thumbnail)) return false;
    return true;
};

/**
 * Get inline style for space thumbnail background
 * @param {string} thumbnail - The thumbnail value (gradient, hex color, or image path)
 * @returns {object} Style object for the container
 */
export const getSpaceThumbnailStyle = (thumbnail) => {
    if (!thumbnail) {
        return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    }
    if (thumbnail.startsWith('linear-gradient')) {
        return { background: thumbnail };
    }
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(thumbnail)) {
        const hex = thumbnail.startsWith('#') ? thumbnail : `#${thumbnail}`;
        const matchingGradient = GRADIENT_OPTIONS.find(g => g.toLowerCase().includes(hex.toLowerCase()));
        if (matchingGradient) {
            return { background: matchingGradient };
        }
        return { background: `linear-gradient(135deg, ${hex} 0%, #764ba2 100%)` };
    }
    return {
        backgroundImage: `url(${getImageUrl(thumbnail)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };
};

/**
 * Get full URL for space thumbnail image
 * @param {string} thumbnail - The thumbnail value
 * @returns {string|null} Full URL for image or null if gradient/color
 */
export const getSpaceThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('linear-gradient')) return null;
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(thumbnail)) return null;
    return getImageUrl(thumbnail);
};

/**
 * Get full URL for a file download path from the backend
 * @param {string} path - The relative file path (e.g., "/uploads/file.pdf")
 * @returns {string|null} Full URL or null if no path
 */
export const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}${path}`;
};

/**
 * Get initials from a name (e.g., "John Doe" -> "JD")
 * @param {string} name - The full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

/**
 * Get avatar display props (image URL or initials fallback)
 * @param {object} user - User object with avatarImage, avatarColor, and name
 * @returns {object} { imageUrl, initials, backgroundColor }
 * @returns {object} { imageUrl, initials, backgroundColor }
 */
export const getAvatarProps = (user) => {
    return {
        imageUrl: getImageUrl(user?.avatarImage),
        initials: getInitials(user?.name),
        backgroundColor: user?.avatarColor || '#ec4899'
    };
};

/**
 * Format a date string or Date object to "21 Dec, 2025" format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';

    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month}, ${year}`;
};

/**
 * Format a date to relative time (e.g., "2 hours ago", "Yesterday")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    if (!date) return 'N/A';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';

    const now = new Date();
    const diffMs = now - d;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return formatDate(date);
};
