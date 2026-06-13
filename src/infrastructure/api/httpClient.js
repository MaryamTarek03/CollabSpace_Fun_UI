/**
 * HTTP Client
 * Shared HTTP request functionality for API implementations
 * Extracted from the monolithic api.js for better separation of concerns
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5153/api';

// Token state in memory
let tokenState = {
    accessToken: null,
    refreshToken: localStorage.getItem('refreshToken') || null,
};

let refreshPromise = null;
let authFailureCallback = null;

/**
 * Register a callback to be executed when token refresh fails (auth session invalid)
 * @param {Function} callback 
 */
export function registerAuthFailureCallback(callback) {
    authFailureCallback = callback;
}

/**
 * Set the tokens in memory and localStorage
 */
export function setTokens(accessToken, refreshToken) {
    tokenState.accessToken = accessToken;
    tokenState.refreshToken = refreshToken;
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    } else {
        localStorage.removeItem('refreshToken');
    }
}

/**
 * Clear the tokens from memory and localStorage
 */
export function clearTokens() {
    tokenState.accessToken = null;
    tokenState.refreshToken = null;
    localStorage.removeItem('refreshToken');
    if (authFailureCallback) {
        authFailureCallback();
    }
}

/**
 * Get the current access token
 */
export function getAccessToken() {
    return tokenState.accessToken;
}

/**
 * Perform token refresh
 */
async function refreshTokens() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: tokenState.refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Refresh token invalid or expired');
            }

            const data = await response.json();
            // Store new tokens
            setTokens(data.accessToken, data.refreshToken);
            return data.accessToken;
        } catch (err) {
            console.warn('Session expired. Logging out...', err);
            clearTokens();
            throw err;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Get a valid access token, refreshing if necessary
 */
async function getValidToken() {
    if (tokenState.accessToken) return tokenState.accessToken;
    if (tokenState.refreshToken) {
        try {
            return await refreshTokens();
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * Helper to parse RFC 7807 problem details or other errors
 */
async function parseError(response) {
    let errorData = {};
    try {
        errorData = await response.json();
    } catch {
        // Fallback if not JSON
    }

    let message = '';
    if (errorData.detail) {
        message = errorData.detail;
    } else if (errorData.title) {
        message = errorData.title;
    } else if (errorData.error) {
        message = errorData.error;
    } else if (errorData.message) {
        message = errorData.message;
    }

    if (!message) {
        if (response.status === 401) {
            message = 'Invalid email/username or password.';
        } else if (response.status === 403) {
            message = 'You do not have permission to perform this action.';
        } else if (response.status === 404) {
            message = 'The requested resource was not found.';
        } else {
            message = 'An unexpected error occurred.';
        }
    }

    // Format fields/model validation errors
    if (errorData.errors) {
        if (Array.isArray(errorData.errors)) {
            // Array of code/message objects
            const list = errorData.errors.map(e => e.message || e.code).filter(Boolean);
            if (list.length > 0) {
                message = list.join(' ');
            }
        } else if (typeof errorData.errors === 'object') {
            // Dictionary of field validation messages
            const list = Object.entries(errorData.errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .filter(Boolean);
            if (list.length > 0) {
                message = list.join(' ');
            }
        }
    }

    if (message && (message.includes('already banned') || message.toLowerCase().includes('banned'))) {
        message = "You have been banned from this space and cannot join or request to join.";
    }

    const error = new Error(message || `HTTP ${response.status}`);
    error.data = errorData;
    error.status = response.status;
    return error;
}

/**
 * Generic fetch wrapper with error handling and automatic token management
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = { ...options.headers };

    // Don't set JSON content type if it is a FormData body
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers,
    };

    if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    // Attach Authorization header if not logging in/registering
    if (!endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register') && !endpoint.startsWith('/auth/refresh')) {
        const token = await getValidToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        let response = await fetch(url, config);

        // Check if expired and needs retry
        if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/refresh')) {
            const tokenExpired = response.headers.get('Token-Expired') === 'true';
            if (tokenExpired || response.status === 401) {
                try {
                    const newToken = await refreshTokens();
                    if (newToken) {
                        config.headers['Authorization'] = `Bearer ${newToken}`;
                        response = await fetch(url, config);
                    }
                } catch (refreshErr) {
                    throw await parseError(response);
                }
            }
        }

        if (!response.ok) {
            throw await parseError(response);
        }

        if (options.responseType === 'blob') {
            return await response.blob();
        }

        // Return JSON if present, otherwise text
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    } catch (error) {
        console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
        throw error;
    }
}

/**
 * HTTP Client with convenience methods
 */
export const httpClient = {
    get: (endpoint, config = {}) => request(endpoint, { ...config, method: 'GET' }),
    post: (endpoint, body, config = {}) => request(endpoint, { ...config, method: 'POST', body }),
    put: (endpoint, body, config = {}) => request(endpoint, { ...config, method: 'PUT', body }),
    patch: (endpoint, body, config = {}) => request(endpoint, { ...config, method: 'PATCH', body }),
    delete: (endpoint, body, config = {}) => request(endpoint, { ...config, method: 'DELETE', body }),

    /**
     * Custom upload method with progress tracking supporting multipart/form-data
     */
    uploadWithProgress: (endpoint, body, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress(percent, e.loaded, e.total);
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
                    reject(new Error(xhr.statusText || `Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => reject(new Error('Upload failed')));
            xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

            xhr.open('POST', `${API_BASE_URL}${endpoint}`);
            
            // Do not set Content-Type header if it's FormData, let XMLHttpRequest do it!
            if (!(body instanceof FormData)) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }

            const token = getAccessToken();
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.send(body instanceof FormData ? body : JSON.stringify(body));
        });
    },

    getBaseUrl: () => API_BASE_URL,
    getAccessToken: () => getAccessToken(),
    getValidToken: () => getValidToken(),
    setTokens: (access, refresh) => setTokens(access, refresh),
    clearTokens: () => clearTokens(),
};

export default httpClient;
