import React from 'react';
import { UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';

// Format bytes to human readable (1.3 MB)
const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
};

export default function UploadCard({
    uploadState,
    uploadProgress,
    uploadedBytes,
    totalBytes,
    triggerFileUpload,
    fileInputRef,
    handleFileSelect
}) {
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    };

    return (
        <div
            onClick={uploadState === 'idle' ? triggerFileUpload : undefined}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[160px] ${isDragging
                ? 'border-blue-500 bg-blue-100 scale-105'
                : 'border-gray-400 bg-gray-50 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600'
                }`}
        >
            {/* Hidden Input */}
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

            {uploadState === 'idle' ? (
                <>
                    <div className={`w-12 h-12 bg-white rounded-full border-2 flex items-center justify-center mb-3 transition-all ${isDragging ? 'border-blue-500 scale-110' : 'border-gray-300 group-hover:border-blue-500 group-hover:scale-110'
                        }`}>
                        <UploadCloud size={24} className={isDragging ? 'text-blue-500' : ''} />
                    </div>
                    <p className="font-bold">{isDragging ? 'Drop it like it\'s hot! 🔥' : 'Click to Upload'}</p>
                    <p className="text-xs text-gray-500">{isDragging ? 'Release to upload' : 'or Drag & Drop files here'}</p>
                </>
            ) : uploadState === 'uploading' ? (
                <div className="w-full">
                    <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-3" />
                    <div className="w-full h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden relative">
                        <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-xs font-bold mt-2 text-blue-600">
                        {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
                    </p>
                    <p className="text-xs text-gray-500">{uploadProgress}%</p>
                </div>
            ) : (
                <div className="animate-in zoom-in">
                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-2" />
                    <p className="font-black text-green-600">Done!</p>
                </div>
            )}
        </div>
    );
}

