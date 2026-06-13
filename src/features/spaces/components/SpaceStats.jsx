import { Users, FileText, Crown, Calendar, Lock, Globe, Folder, Link2 } from 'lucide-react';
import { formatDate, formatBytes } from '../../../shared/utils/helpers';

export default function SpaceStats({ memberCount, fileCount, totalSize, folderCount, linkCount, ownerName, createdAt, isPrivate }) {
    return (
        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                About Space
            </h3>

            <div className="space-y-5">
                {/* Owner */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center border-2 border-transparent">
                        <Crown size={20} className="text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Owner</p>
                        <p className="font-bold text-lg">{ownerName || 'Unknown'}</p>
                    </div>
                </div>

                {/* Created */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center border-2 border-transparent">
                        <Calendar size={20} className="text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Created</p>
                        <p className="font-bold text-lg">{formatDate(createdAt)}</p>
                    </div>
                </div>
                {/* Visibility */}
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-transparent ${isPrivate ? 'bg-pink-100' : 'bg-cyan-100'}`}>
                        {isPrivate ? <Lock size={20} className="text-pink-600" /> : <Globe size={20} className="text-cyan-600" />}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visibility</p>
                        <p className="font-bold text-lg">{isPrivate ? 'Private' : 'Public'}</p>
                    </div>
                </div>

                {/* Members */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center border-2 border-transparent">
                        <Users size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Members</p>
                        <p className="font-bold text-lg">{memberCount}</p>
                    </div>
                </div>

                {/* Files & Links */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center border-2 border-transparent">
                        <FileText size={20} className="text-pink-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Files & Links</p>
                        <p className="font-bold text-lg">
                            {fileCount} {fileCount === 1 ? 'File' : 'Files'}
                            {totalSize > 0 && (
                                <span className="text-gray-400 text-sm font-normal ml-1">
                                    ({formatBytes(totalSize)})
                                </span>
                            )}
                            {linkCount !== undefined && linkCount > 0 && (
                                <span className="text-gray-400 text-sm font-normal ml-1">
                                    • {linkCount} {linkCount === 1 ? 'Link' : 'Links'}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Folders */}
                {folderCount !== undefined && folderCount > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center border-2 border-transparent">
                            <Folder size={20} className="text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Folders</p>
                            <p className="font-bold text-lg">{folderCount}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
