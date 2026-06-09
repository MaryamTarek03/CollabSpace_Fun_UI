import React from 'react';

export default function FileCard({ file, getFileIcon, onClick, className = '', viewMode = 'grid', actionButton }) {
    if (viewMode === 'list') {
        return (
            <div
                onClick={onClick}
                className={`bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer p-3 flex items-center gap-4 group/row w-full ${className}`}
            >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-transparent shrink-0">
                    {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate leading-tight text-gray-900 group-hover/row:text-blue-600" title={file.name}>{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size} • {file.uploaderName}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                    {actionButton}
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase text-gray-500">{file.type}</span>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`bg-white border-2 border-black rounded-2xl p-4 flex flex-col justify-between hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-pointer min-h-[160px] ${className}`}
        >
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-transparent">{getFileIcon(file.type)}</div>
                <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase">{file.type}</span>
            </div>
            <div>
                <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="font-bold text-sm truncate leading-tight flex-1 pt-1" title={file.name}>{file.name}</p>
                    <div className="shrink-0 -mt-1 -mr-1">
                        {actionButton}
                    </div>
                </div>
                <p className="text-xs text-gray-500">{file.size} • {file.uploaderName}</p>
            </div>
        </div>
    );
}
