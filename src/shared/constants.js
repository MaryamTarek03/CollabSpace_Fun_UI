/**
 * Centralized Constants
 * DRY principle - single source of truth for repeated values
 */

// Z-Index Layers
export const Z_INDEX = {
    dropdown: 40,
    modal: 70,
    overlay: 80,
    tooltip: 90,
    highest: 100
};

// User Roles
export const ROLES = ['Owner', 'Admin', 'Member'];
export const ADMIN_ROLES = ['Owner', 'Admin'];

// File Type Categories
export const FILE_TYPES = {
    image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'fig'],
    video: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv'],
    document: ['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv'],
    presentation: ['ppt', 'pptx', 'odp', 'key'],
    audio: ['mp3', 'wav', 'ogg', 'flac', 'aac'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz']
};

// Space Categories
export const SPACE_CATEGORIES = [
    'Education',
    'Business',
    'Technology',
    'Art & Design',
    'Entertainment',
    'Gaming',
    'Health',
    'Science',
    'Sports',
    'Other'
];

// Time Limits (in milliseconds)
export const TIME_LIMITS = {
    messageEdit: 15 * 60 * 1000,      // 15 minutes
    messageDelete: 15 * 60 * 1000,    // 15 minutes
    longPress: 500                     // 500ms for long press
};

// Animation Durations (in ms)
export const ANIMATION = {
    fast: 150,
    normal: 200,
    slow: 300
};

// Breakpoints (match Tailwind defaults)
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
};

// API Limits
export const LIMITS = {
    maxFileSize: 50 * 1024 * 1024,    // 50MB
    maxAvatarsShown: 3,
    maxNotifications: 50,
    maxSearchResults: 20
};

/**
 * Helper to check if file type belongs to category
 */
export function isFileType(extension, category) {
    const ext = extension?.toLowerCase();
    return FILE_TYPES[category]?.includes(ext) || false;
}

/**
 * Get file category from extension
 */
export function getFileCategory(extension) {
    const ext = extension?.toLowerCase();
    for (const [category, extensions] of Object.entries(FILE_TYPES)) {
        if (extensions.includes(ext)) return category;
    }
    return 'other';
}
