import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store';

export default function FileUploadButton({ spaceId, onUploadComplete }) {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const { user } = useAuthStore();

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadedFile = await api.files.upload(spaceId, file, user?.id);
            console.log('File uploaded:', uploadedFile);
            if (onUploadComplete) {
                onUploadComplete(uploadedFile);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
            // Reset input so same file can be uploaded again
            e.target.value = '';
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={handleClick}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-green-400 text-black font-bold rounded-xl border-2 border-black hover:bg-green-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload size={18} />
                        Upload File
                    </>
                )}
            </button>
        </>
    );
}
