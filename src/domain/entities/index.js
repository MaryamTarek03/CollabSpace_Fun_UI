/**
 * Domain Entities - Barrel Export
 * Pure data structures only - NO transformation logic (SRP compliant)
 */

// Core entities
export { createUser, AVATAR_COLORS, getRandomColor } from './User.js';
export { createSpace } from './Space.js';
export { createMember } from './Member.js';
export { createMessage } from './Message.js';
export { createFile } from './File.js';
export { createNotification } from './Notification.js';

// Additional entities
export { createInvite } from './Invite.js';
export { createChannel } from './Channel.js';
export { createFolder } from './Folder.js';
export { createJoinRequest } from './JoinRequest.js';
export { createBan } from './Ban.js';
export { createFavorite } from './Favorite.js';
