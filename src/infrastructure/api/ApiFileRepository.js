/**
 * API File Repository
 * Implements IFileRepository using HTTP API
 */

import { httpClient } from './httpClient.js';
import { FileMapper, FolderMapper } from '../../domain/mappers/index.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Create a File Repository that uses the HTTP API
 * @returns {IFileRepository}
 */
export function createApiFileRepository() {
    return {
        async getBySpace(spaceId, folderId) {
            const params = folderId !== undefined
                ? `?folderId=${folderId === null ? 'null' : folderId}`
                : '';
            const data = await httpClient.get(`/files/${spaceId}${params}`);
            return FileMapper.fromApiList(data);
        },

        async upload(spaceId, file, uploadedBy, onProgress, folderId) {
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
                                const result = JSON.parse(xhr.responseText);
                                resolve(FileMapper.fromApi(result));
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

        async delete(fileId, userId) {
            return httpClient.delete(`/files/${fileId}`, { userId });
        },

        async rename(fileId, name, userId) {
            return httpClient.put(`/files/${fileId}`, { name, userId });
        },

        async move(fileIds, folderId, userId) {
            return httpClient.put('/files/move', { fileIds, folderId, userId });
        },

        async copy(fileIds, folderId, userId) {
            return httpClient.post('/files/copy', { fileIds, folderId, userId });
        },

        getDownloadUrl(fileId) {
            return `${API_BASE_URL}/files/${fileId}/download`;
        },

        async createFolder(spaceId, folderData) {
            const result = await httpClient.post(`/spaces/${spaceId}/folders`, folderData);
            return FolderMapper.fromApi(result);
        },

        async getFolders(spaceId, parentId) {
            const params = parentId !== undefined
                ? `?parentId=${parentId === null ? 'null' : parentId}`
                : '';
            const data = await httpClient.get(`/spaces/${spaceId}/folders${params}`);
            return FolderMapper.fromApiList(data);
        },

        async getFolder(folderId) {
            const data = await httpClient.get(`/folders/${folderId}`);
            return FolderMapper.fromApi(data);
        },

        async updateFolder(folderId, name) {
            return httpClient.put(`/folders/${folderId}`, { name });
        },

        async deleteFolder(folderId) {
            return httpClient.delete(`/folders/${folderId}`);
        },

        async createLink(spaceId, name, url, uploadedBy, folderId) {
            return httpClient.post(`/files/${spaceId}/link`, {
                name, url, uploadedBy, folderId
            });
        },
    };
}
