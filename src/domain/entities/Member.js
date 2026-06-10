/**
 * Member Entity Interface
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
 * @typedef {Object} IMember
 * @property {string} id - User ID (for compatibility)
 * @property {string} userId - User ID
 * @property {string} memberId - Membership ID
 * @property {string} spaceId - Space ID
 * @property {string} name - Member name
 * @property {string} username - Member username
 * @property {string} email - Member email
 * @property {string} role - 'owner' | 'admin' | 'member'
 * @property {string} joinedAt - Join timestamp
 * @property {string} avatarColor - Avatar background color
 * @property {string|null} avatarImage - Avatar image URL
 */

/**
 * Member entity factory - creates a pure data object
 * @param {Object} data - Raw member data
 * @returns {IMember}
 */
export function createMember(data = {}) {
    const name = data.name || '';

    return {
        id: data.id || data.memberId || data.userId || null,
        userId: data.userId || data.id || null,
        memberId: data.memberId || data.id || null,
        spaceId: data.spaceId || null,
        name,
        username: data.username || '',
        email: data.email || '',
        role: data.role || 'member',
        joinedAt: data.joinedAt || null,
        avatarColor: data.avatarColor || data.avatar || getRandomColor(),
        avatarImage: data.avatarImage || null,
        customRoles: data.customRoles || [],

        // Computed property
        get initials() {
            if (!name) return '?';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
    };
}
