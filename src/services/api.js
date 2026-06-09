// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
            // Attach the full error response for lockout info, warnings, etc.
            error.data = errorData;
            error.status = response.status;
            throw error;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
        throw error;
    }
}

// ============ AUTH ============
export const auth = {
    register: (data) => request('/auth/register', { method: 'POST', body: data }),
    login: (data) => request('/auth/login', { method: 'POST', body: data }),
};

// ============ USERS ============
export const users = {
    getAll: () => request('/users'),
    getById: (id) => request(`/users/${id}`),
    update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
    uploadAvatar: (id, imageData) => request(`/users/${id}/avatar`, { method: 'POST', body: { imageData } }),
    deleteAvatar: (id) => request(`/users/${id}/avatar`, { method: 'DELETE' }),
    getSpaces: (userId) => request(`/users/${userId}/spaces`),
    getInvites: (userId) => request(`/users/${userId}/invites`),
    // Profile & Privacy
    getProfile: (id, viewerId) => request(`/users/${id}/profile?viewerId=${viewerId}`),
    updatePrivacy: (id, data) => request(`/users/${id}/privacy`, { method: 'PUT', body: data }),
    getSharedSpaces: (id, viewerId) => request(`/users/${id}/shared-spaces?viewerId=${viewerId}`),
    search: (query, viewerId) => request(`/users/search?q=${encodeURIComponent(query)}&viewerId=${viewerId}`),
    // Favorites
    getFavorites: (userId) => request(`/users/${userId}/favorites`),
    addFavorite: (userId, spaceId) => request(`/users/${userId}/favorites/${spaceId}`, { method: 'POST' }),
    removeFavorite: (userId, spaceId) => request(`/users/${userId}/favorites/${spaceId}`, { method: 'DELETE' }),
    toggleFavorite: (userId, spaceId) => request(`/users/${userId}/favorites/${spaceId}/toggle`, { method: 'POST' }),
};

// ============ SPACES ============
export const spaces = {
    getAll: (userId) => request(`/spaces${userId ? `?userId=${userId}` : ''}`),
    search: (query, userId) => request(`/spaces/search?q=${encodeURIComponent(query)}&userId=${userId}`),
    getById: (id) => request(`/spaces/${id}`),
    create: (data) => request('/spaces', { method: 'POST', body: data }),
    update: (id, data) => request(`/spaces/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/spaces/${id}`, { method: 'DELETE' }),

    // Join Requests
    join: (spaceId, userId) => request(`/spaces/${spaceId}/join`, { method: 'POST', body: { userId } }),
    getRequests: (spaceId) => request(`/spaces/${spaceId}/requests`),
    approveRequest: (spaceId, requestId) => request(`/spaces/${spaceId}/requests/${requestId}/approve`, { method: 'POST' }),
    rejectRequest: (spaceId, requestId) => request(`/spaces/${spaceId}/requests/${requestId}/reject`, { method: 'POST' }),

    // Ownership
    transferOwnership: (spaceId, currentOwnerId, newOwnerId) => request(`/spaces/${spaceId}/transfer-ownership`, {
        method: 'POST',
        body: { currentOwnerId, newOwnerId }
    }),

    // Thumbnail
    uploadThumbnail: (spaceId, imageData) => request(`/spaces/${spaceId}/thumbnail`, {
        method: 'POST',
        body: { imageData }
    }),

    update: (id, data) => request(`/spaces/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/spaces/${id}`, { method: 'DELETE' }),

    // Bans
    getBans: (spaceId) => request(`/spaces/${spaceId}/bans`),
    unban: (spaceId, banId) => request(`/spaces/${spaceId}/bans/${banId}`, { method: 'DELETE' }),
};

// ============ SPACE MEMBERS ============
export const members = {
    getBySpace: (spaceId) => request(`/spaces/${spaceId}/members`),
    add: (spaceId, data) => request(`/spaces/${spaceId}/members`, { method: 'POST', body: data }),
    updateRole: (spaceId, memberId, role) => request(`/spaces/${spaceId}/members/${memberId}`, { method: 'PUT', body: { role } }),
    remove: (spaceId, memberId) => request(`/spaces/${spaceId}/members/${memberId}`, { method: 'DELETE' }),
    ban: (spaceId, memberId, bannedBy, reason) => request(`/spaces/${spaceId}/members/${memberId}/ban`, { method: 'POST', body: { bannedBy, reason } }),
    leave: (spaceId, userId) => request(`/spaces/${spaceId}/leave`, { method: 'POST', body: { userId } }),
    invite: (spaceId, data) => request(`/spaces/${spaceId}/invite`, { method: 'POST', body: data }),
    inviteUser: (spaceId, userId, inviterId) => request(`/spaces/${spaceId}/invite-user`, { method: 'POST', body: { userId, inviterId } }),
};

// ============ INVITES ============
export const invites = {
    accept: (inviteId) => request(`/invites/${inviteId}/accept`, { method: 'POST' }),
    decline: (inviteId) => request(`/invites/${inviteId}/decline`, { method: 'POST' }),
    getBySpace: (spaceId) => request(`/spaces/${spaceId}/invites`),
    getByCode: (code) => request(`/invites/code/${code}`),
    revoke: (inviteId) => request(`/invites/${inviteId}`, { method: 'DELETE' }),
};

// Space request management
export const requests = {
    cancel: (spaceId, requestId) => request(`/spaces/${spaceId}/requests/${requestId}`, { method: 'DELETE' }),
    getMy: (userId) => request(`/users/${userId}/join-requests`),
    cancelMy: (userId, requestId) => request(`/users/${userId}/join-requests/${requestId}`, { method: 'DELETE' }),
};

// ============ NOTIFICATIONS ============
export const notifications = {
    getAll: (userId) => request(`/notifications${userId ? `?userId=${userId}` : ''}`),
    create: (data) => request('/notifications', { method: 'POST', body: data }),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
};

// ============ CHANNELS ============
export const channels = {
    getBySpace: (spaceId) => request(`/channels/${spaceId}`),
    create: (spaceId, data) => request(`/channels/${spaceId}`, { method: 'POST', body: data }),
    update: (channelId, data) => request(`/channels/${channelId}`, { method: 'PUT', body: data }),
    delete: (channelId) => request(`/channels/${channelId}`, { method: 'DELETE' }),
};

// ============ MESSAGES ============
export const messages = {
    getByChannel: (channelId) => request(`/messages/${channelId}`),
    send: (channelId, data) => request(`/messages/${channelId}`, { method: 'POST', body: data }),
    update: (id, text, senderId) => request(`/messages/${id}`, { method: 'PUT', body: { text, senderId } }),
    delete: (id, senderId) => request(`/messages/${id}`, { method: 'DELETE', body: { senderId } }),
    forward: (messageId, targetChannelId, senderId, spaceId) => request(`/messages/${messageId}/forward`, {
        method: 'POST',
        body: { targetChannelId, senderId, spaceId }
    }),
};

// ============ FOLDERS ============
export const folders = {
    getBySpace: (spaceId, parentId) => {
        const params = parentId !== undefined ? `?parentId=${parentId === null ? 'null' : parentId}` : '';
        return request(`/spaces/${spaceId}/folders${params}`);
    },
    getById: (folderId) => request(`/folders/${folderId}`),
    create: (spaceId, data) => request(`/spaces/${spaceId}/folders`, { method: 'POST', body: data }),
    update: (folderId, name) => request(`/folders/${folderId}`, { method: 'PUT', body: { name } }),
    delete: (folderId) => request(`/folders/${folderId}`, { method: 'DELETE' }),
};

// ============ FILES ============
export const files = {
    getBySpace: (spaceId, folderId) => {
        const params = folderId !== undefined ? `?folderId=${folderId === null ? 'null' : folderId}` : '';
        return request(`/files/${spaceId}${params}`);
    },
    rename: (fileId, name, userId) => request(`/files/${fileId}`, { method: 'PUT', body: { name, userId } }),
    /**
     * Upload a file to a space with real progress tracking
     * @param {string} spaceId - The space ID
     * @param {File} file - The file object from input
     * @param {string} uploadedBy - User ID who uploaded
     * @param {function} onProgress - Callback with (percent, loaded, total)
     * @param {string} folderId - Optional folder ID to upload into
     */
    upload: (spaceId, file, uploadedBy, onProgress, folderId) => {
        return new Promise((resolve, reject) => {
            const totalSize = file.size;

            // Phase 1: Read file (0-30% of progress)
            const reader = new FileReader();

            reader.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    const readPercent = Math.round((e.loaded / e.total) * 30);
                    onProgress(readPercent, e.loaded, totalSize);
                }
            };

            reader.onload = () => {
                const base64 = reader.result;
                if (onProgress) onProgress(30, Math.round(totalSize * 0.3), totalSize);

                const body = JSON.stringify({
                    name: file.name,
                    fileData: base64,
                    uploadedBy: uploadedBy,
                    folderId: folderId || null
                });

                const xhr = new XMLHttpRequest();

                // Phase 2: Upload (30-100%)
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable && onProgress) {
                        const uploadPercent = 30 + Math.round((e.loaded / e.total) * 70);
                        const uploadedBytes = Math.round(totalSize * 0.3 + (e.loaded / e.total) * totalSize * 0.7);
                        onProgress(uploadPercent, uploadedBytes, totalSize);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch {
                            resolve(xhr.responseText);
                        }
                    } else {
                        reject(new Error(xhr.statusText || 'Upload failed'));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Upload failed')));
                xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

                xhr.open('POST', `${API_BASE_URL}/files/${spaceId}`);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(body);
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    },
    download: (fileId) => `${API_BASE_URL}/files/${fileId}/download`,
    delete: (fileId, userId) => request(`/files/${fileId}`, { method: 'DELETE', body: { userId } }),
    move: (fileIds, folderId, userId) => request('/files/move', { method: 'PUT', body: { fileIds, folderId, userId } }),
    copy: (fileIds, folderId, userId) => request('/files/copy', { method: 'POST', body: { fileIds, folderId, userId } }),
    createLink: (spaceId, name, url, uploadedBy, folderId) => request(`/files/${spaceId}/link`, {
        method: 'POST',
        body: { name, url, uploadedBy, folderId }
    }),
};

// Export grouped API
const api = {
    auth,
    users,
    spaces,
    members,
    invites,
    requests,
    notifications,
    channels,
    messages,
    folders,
    files,
    // Generic methods
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
    delete: (endpoint, body) => request(endpoint, { method: 'DELETE', body }),
};

export default api;
