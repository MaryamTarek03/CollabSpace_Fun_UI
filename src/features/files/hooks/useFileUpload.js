import { useState, useRef } from 'react';
import api from '../../../services/api';
import { useAuthStore, useSpacesStore } from '../../../store';

export default function useFileUpload({ activeSpace, folderId }) {
    const [uploadState, setUploadState] = useState('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedBytes, setUploadedBytes] = useState(0);
    const [totalBytes, setTotalBytes] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !activeSpace) return;

        const user = useAuthStore.getState().user;

        // Start upload animation
        setUploadState('uploading');
        setUploadProgress(0);
        setUploadedBytes(0);
        setTotalBytes(0);

        try {
            // Real API upload with progress tracking (now with folderId)
            await api.files.upload(activeSpace.id, file, user?.id, (progress, loaded, total) => {
                setUploadProgress(progress);
                setUploadedBytes(loaded);
                setTotalBytes(total);
            }, folderId);

            // Upload complete
            setUploadProgress(100);
            setUploadState('success');

            // Refresh spaces to get updated file list
            await useSpacesStore.getState().fetchSpaces();

            // Reset after delay
            setTimeout(() => {
                setUploadState('idle');
                setUploadProgress(0);
                setUploadedBytes(0);
                setTotalBytes(0);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }, 2000);

        } catch (error) {
            console.error('Upload failed:', error);
            setUploadState('idle');
            setUploadProgress(0);
            setUploadedBytes(0);
            setTotalBytes(0);
            alert('Failed to upload file. Please try again.');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return {
        uploadState,
        uploadProgress,
        uploadedBytes,
        totalBytes,
        fileInputRef,
        handleFileSelect,
        triggerFileUpload
    };
}

