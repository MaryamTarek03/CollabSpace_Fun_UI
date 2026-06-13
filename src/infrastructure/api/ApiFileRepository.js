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
            const url = folderId !== undefined && folderId !== null 
                ? `/spaces/${spaceId}/storage/folders/${folderId}` 
                : `/spaces/${spaceId}/storage`;
            const data = await httpClient.get(url);
            
            const apiFiles = data && data.files ? data.files : [];
            const apiLinks = data && data.links ? data.links : [];
            
            const mappedFiles = apiFiles.map(file => FileMapper.fromApi(file));
            
            const mappedLinks = apiLinks.map(link => FileMapper.fromApi({
                ...link,
                type: 'link'
            }));
            
            return [...mappedFiles, ...mappedLinks];
        },

        async upload(spaceId, file, uploadedBy, onProgress, folderId) {
            return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', file);
                
                let url = `${httpClient.getBaseUrl()}/spaces/${spaceId}/storage/files`;
                const queryParams = [];
                if (folderId !== undefined && folderId !== null) {
                    queryParams.push(`folderId=${folderId}`);
                }
                if (queryParams.length > 0) {
                    url += `?${queryParams.join('&')}`;
                }

                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable && onProgress) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        onProgress(percent, e.loaded, file.size);
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

                xhr.open('POST', url);
                
                const token = httpClient.getAccessToken();
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
                
                xhr.send(formData);
            });
        },

        async delete(fileId, userId, spaceId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const resolvedSpaceId = spaceId || useSpacesStore.getState().activeSpace?.id || useChatStore.getState().activeChatSpace?.id || 'default';
            return httpClient.delete(`/spaces/${resolvedSpaceId}/storage/items/${fileId}`);
        },

        async rename(fileId, name, userId, spaceId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const resolvedSpaceId = spaceId || useSpacesStore.getState().activeSpace?.id || useChatStore.getState().activeChatSpace?.id || 'default';
            const body = typeof name === 'object' ? name : { newName: name };
            return httpClient.put(`/spaces/${resolvedSpaceId}/storage/items/${fileId}/rename`, body);
        },

        async move(fileIds, folderId, userId, spaceId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const resolvedSpaceId = spaceId || useSpacesStore.getState().activeSpace?.id || useChatStore.getState().activeChatSpace?.id || 'default';
            const ids = Array.isArray(fileIds) ? fileIds : [fileIds];
            const promises = ids.map(id => 
                httpClient.post(`/spaces/${resolvedSpaceId}/storage/items/${id}/move`, { folderId: folderId || null })
            );
            return Promise.all(promises);
        },

        async copy(fileIds, folderId, userId, spaceId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const resolvedSpaceId = spaceId || useSpacesStore.getState().activeSpace?.id || useChatStore.getState().activeChatSpace?.id || 'default';
            const ids = Array.isArray(fileIds) ? fileIds : [fileIds];
            const promises = ids.map(id => 
                httpClient.post(`/spaces/${resolvedSpaceId}/storage/items/${id}/copy`, { folderId: folderId || null })
            );
            return Promise.all(promises);
        },

        getDownloadUrl(fileId, spaceId) {
            let resolvedSpaceId = spaceId;
            if (!resolvedSpaceId && typeof window !== 'undefined') {
                resolvedSpaceId = window.__activeSpaceId;
                if (!resolvedSpaceId) {
                    const match = window.location.pathname.match(/\/spaces\/([^\/]+)/) || window.location.pathname.match(/\/chat\/([^\/]+)/);
                    if (match) {
                        resolvedSpaceId = match[1];
                    }
                }
            }
            if (!resolvedSpaceId) {
                resolvedSpaceId = 'default';
            }
            return `${httpClient.getBaseUrl()}/spaces/${resolvedSpaceId}/storage/files/${fileId}/download`;
        },

        async download(fileId, spaceId) {
            let resolvedSpaceId = spaceId;
            if (!resolvedSpaceId && typeof window !== 'undefined') {
                resolvedSpaceId = window.__activeSpaceId;
                if (!resolvedSpaceId) {
                    const match = window.location.pathname.match(/\/spaces\/([^\/]+)/) || window.location.pathname.match(/\/chat\/([^\/]+)/);
                    if (match) {
                        resolvedSpaceId = match[1];
                    }
                }
            }
            if (!resolvedSpaceId) {
                resolvedSpaceId = 'default';
            }
            return httpClient.get(`/spaces/${resolvedSpaceId}/storage/files/${fileId}/download`, { responseType: 'blob' });
        },

        async createFolder(spaceId, folderData) {
            const body = {
                name: folderData.name || '',
                parentId: folderData.parentId || folderData.folderId || null
            };
            const result = await httpClient.post(`/spaces/${spaceId}/storage/folders`, body);
            return FolderMapper.fromApi(result);
        },

        async getFolders(spaceId, parentId) {
            const url = parentId !== undefined && parentId !== null 
                ? `/spaces/${spaceId}/storage/folders/${parentId}` 
                : `/spaces/${spaceId}/storage`;
            const data = await httpClient.get(url);
            const folders = data && data.folders ? data.folders : [];
            return FolderMapper.fromApiList(folders);
        },

        async getFolder(folderId, spaceId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const resolvedSpaceId = spaceId || useSpacesStore.getState().activeSpace?.id || useChatStore.getState().activeChatSpace?.id || 'default';
            const data = await httpClient.get(`/spaces/${resolvedSpaceId}/storage/folders/${folderId}`);
            return FolderMapper.fromApi(data);
        },

        async updateFolder(folderId, name, spaceId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const resolvedSpaceId = spaceId || useSpacesStore.getState().activeSpace?.id || useChatStore.getState().activeChatSpace?.id || 'default';
            const body = typeof name === 'object' ? name : { newName: name };
            return httpClient.put(`/spaces/${resolvedSpaceId}/storage/folders/${folderId}/rename`, body);
        },

        async deleteFolder(folderId, spaceId) {
            const { useChatStore, useSpacesStore } = await import('../../store/index.js');
            const resolvedSpaceId = spaceId || useSpacesStore.getState().activeSpace?.id || useChatStore.getState().activeChatSpace?.id || 'default';
            return httpClient.delete(`/spaces/${resolvedSpaceId}/storage/folders/${folderId}`);
        },

        async createLink(spaceId, name, url, uploadedBy, folderId) {
            const body = {
                name,
                url,
                folderId: folderId || null
            };
            const result = await httpClient.post(`/spaces/${spaceId}/storage/links`, body);
            return FileMapper.fromApi({
                ...result,
                type: 'link'
            });
        },

        async getRecent(spaceId, limit = 5) {
            const data = await httpClient.get(`/spaces/${spaceId}/storage/recent?page=1&pageSize=${limit}&Limit=${limit}`);
            const apiFiles = data && data.files ? data.files : [];
            const apiLinks = data && data.links ? data.links : [];
            
            const mappedFiles = apiFiles.map(file => FileMapper.fromApi(file));
            
            const mappedLinks = apiLinks.map(link => FileMapper.fromApi({
                ...link,
                type: 'link'
            }));
            
            return [...mappedFiles, ...mappedLinks];
        },
    };
}
