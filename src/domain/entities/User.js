/**
 * User Entity Interface
 * Pure data structure - NO transformation logic (SRP compliant)
 */

const AVATAR_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
    '#8b5cf6', '#ef4444', '#14b8a6', '#f97316',
];

function getRandomColor() {
    return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/**
 * @typedef {Object} IUser
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} avatarColor - Avatar background color
 * @property {string|null} avatarImage - Avatar image URL
 * @property {string} bio - User bio
 * @property {string} createdAt - Registration date
 */

/**
 * User entity factory - creates a pure data object
 * @param {Object} data - Raw user data
 * @returns {IUser}
 */
export function createUser(data = {}) {
    const name = data.name || '';

    return {
        id: data.id || null,
        name,
        username: data.username || '',
        email: data.email || '',
        avatarColor: data.avatarColor || getRandomColor(),
        avatarImage: data.avatarImage || null,
        bio: data.bio || '',
        createdAt: data.createdAt || null,

        // Computed property
        get initials() {
            if (!name) return '?';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
    };
}

export { AVATAR_COLORS, getRandomColor };
