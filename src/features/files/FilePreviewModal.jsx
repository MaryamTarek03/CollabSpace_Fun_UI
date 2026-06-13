import React from 'react';
import { FileText, Image as ImageIcon, Film, Presentation, Download, Trash2, ExternalLink, Link2 } from 'lucide-react';
import { useUIStore, useAuthStore, useSpacesStore } from '../../store';
import { getFileUrl, formatRelativeTime } from '../../shared/utils/helpers';
import api from '../../services/api';
import ModalWrapper from '../../shared/components/ModalWrapper';
import Button, { CloseButton } from '../../shared/components/Button';
import { ADMIN_ROLES } from '../../shared/constants';

export default function FilePreviewModal() {
    const { viewingFile, setViewingFile, openConfirmation } = useUIStore();
    const { user } = useAuthStore();
    const { activeSpace } = useSpacesStore();

    const [previewUrl, setPreviewUrl] = React.useState(null);
    const [loadingPreview, setLoadingPreview] = React.useState(false);
    const previewUrlRef = React.useRef(null);

    const fileType = viewingFile?.type?.toLowerCase();
    const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType);
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(fileType);
    const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(fileType);
    const isPdf = fileType === 'pdf';
    const isLink = fileType === 'link';

    React.useEffect(() => {
        if (!viewingFile || isLink) {
            if (previewUrlRef.current) {
                window.URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }
            setPreviewUrl(null);
            return;
        }

        let active = true;
        const loadPreview = async () => {
            try {
                setLoadingPreview(true);
                const blob = await api.files.download(viewingFile.id, viewingFile.spaceId || activeSpace?.id);
                if (active) {
                    if (previewUrlRef.current) {
                        window.URL.revokeObjectURL(previewUrlRef.current);
                    }
                    const url = window.URL.createObjectURL(blob);
                    previewUrlRef.current = url;
                    setPreviewUrl(url);
                }
            } catch (err) {
                console.error('Failed to load preview:', err);
            } finally {
                if (active) {
                    setLoadingPreview(false);
                }
            }
        };

        loadPreview();

        return () => {
            active = false;
        };
    }, [viewingFile]);

    React.useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                window.URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    if (!viewingFile) return null;

    const onClose = () => setViewingFile(null);

    // Permission check using constants
    const userMember = activeSpace?.members?.find(m => m.userId === user?.id);
    const isUploader = viewingFile.uploadedBy === user?.id;
    const canDelete = isUploader || activeSpace?.ownerId === user?.id || ADMIN_ROLES.includes(userMember?.role);

    const fileUrl = getFileUrl(viewingFile.downloadUrl);

    const handleView = () => {
        if (isLink && fileUrl) {
            window.open(fileUrl, '_blank');
        } else if (previewUrl) {
            window.open(previewUrl, '_blank');
        }
    };

    const handleDownload = async () => {
        try {
            const blob = await api.files.download(viewingFile.id, viewingFile.spaceId || activeSpace?.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = viewingFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download file:', err);
        }
    };

    const handleDelete = () => {
        const displayName = viewingFile.name.length > 30 ? viewingFile.name.substring(0, 30) + '...' : viewingFile.name;
        openConfirmation({
            title: 'Delete File?',
            message: `Are you sure you want to delete "${displayName}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.files.delete(viewingFile.id, user?.id, activeSpace?.id);
                    setViewingFile(null);
                    await useSpacesStore.getState().fetchSpaces();
                } catch (err) {
                    console.error('Failed to delete file:', err);
                }
            }
        });
    };

    const PreviewIcon = () => {
        if (isLink) return <Link2 size={80} className="text-blue-400" />;
        if (['ppt', 'pptx'].includes(fileType)) return <Presentation size={80} className="text-orange-300" />;
        if (isPdf) return <FileText size={80} className="text-red-400" />;
        return <FileText size={80} className="text-blue-300" />;
    };

    // Extract domain from URL for links
    const getLinkDomain = (url) => {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    };

    // Get embeddable URL for supported services
    const getEmbedUrl = (url) => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();

            // YouTube
            if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                let videoId = null;
                if (hostname.includes('youtu.be')) {
                    videoId = urlObj.pathname.slice(1).split('?')[0];
                } else {
                    videoId = urlObj.searchParams.get('v');
                }
                if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            }

            // Vimeo
            if (hostname.includes('vimeo.com')) {
                const videoId = urlObj.pathname.split('/').filter(Boolean).pop();
                if (videoId && /^\d+$/.test(videoId)) return `https://player.vimeo.com/video/${videoId}`;
            }

            // Google Docs/Sheets/Slides/Forms
            if (hostname.includes('docs.google.com')) {
                return url.replace('/edit', '/preview').replace('/view', '/preview');
            }

            // Google Maps
            if (hostname.includes('google.com') && urlObj.pathname.includes('/maps')) {
                return `https://www.google.com/maps/embed?pb=${urlObj.searchParams.get('pb') || ''}`;
            }

            // Figma
            if (hostname.includes('figma.com')) {
                return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
            }

            // Loom
            if (hostname.includes('loom.com') && urlObj.pathname.includes('/share/')) {
                const videoId = urlObj.pathname.split('/share/')[1]?.split('?')[0];
                if (videoId) return `https://www.loom.com/embed/${videoId}`;
            }

            // Miro
            if (hostname.includes('miro.com')) {
                return url.replace('/board/', '/embed/');
            }

            // Canva
            if (hostname.includes('canva.com') && urlObj.pathname.includes('/design/')) {
                return url.replace('/design/', '/embed/');
            }

            // CodePen
            if (hostname.includes('codepen.io')) {
                const parts = urlObj.pathname.split('/');
                if (parts.length >= 4) {
                    const [, user, , penId] = parts;
                    if (user && penId) return `https://codepen.io/${user}/embed/${penId}?default-tab=result`;
                }
            }

            // CodeSandbox
            if (hostname.includes('codesandbox.io')) {
                const sandboxId = urlObj.pathname.split('/s/')[1]?.split('?')[0];
                if (sandboxId) return `https://codesandbox.io/embed/${sandboxId}`;
            }

            // Spotify (tracks, albums, playlists)
            if (hostname.includes('open.spotify.com')) {
                return url.replace('open.spotify.com', 'open.spotify.com/embed');
            }

            // SoundCloud
            if (hostname.includes('soundcloud.com')) {
                return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false`;
            }

            // Notion (public pages)
            if (hostname.includes('notion.so') || hostname.includes('notion.site')) {
                return url;
            }

            // Airtable
            if (hostname.includes('airtable.com')) {
                return url.replace('airtable.com/', 'airtable.com/embed/');
            }

            // Twitter/X - limited support (timeline widgets)
            // Note: Individual tweets require different approach

            // Typeform
            if (hostname.includes('typeform.com') && urlObj.pathname.includes('/to/')) {
                const formId = urlObj.pathname.split('/to/')[1]?.split('?')[0];
                if (formId) return `https://form.typeform.com/to/${formId}`;
            }

            // SlideShare
            if (hostname.includes('slideshare.net')) {
                return `https://www.slideshare.net/slideshow/embed_code/key/${urlObj.pathname.split('/').pop()}`;
            }

            return null;
        } catch {
            return null;
        }
    };

    const embedUrl = isLink ? getEmbedUrl(viewingFile.downloadUrl) : null;
    const isEmbeddable = !!embedUrl;

    return (
        <ModalWrapper isOpen={!!viewingFile} onClose={onClose} size="lg" zLevel="high">
            {/* Preview Area */}
            <div className={`${(isEmbeddable || isPdf) ? 'h-80' : 'h-64'} border-b-2 border-black flex items-center justify-center relative overflow-hidden ${isLink ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-gray-100'}`}>
                {loadingPreview ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-mono text-xs text-gray-500 font-bold">Loading preview...</p>
                    </div>
                ) : isImage && previewUrl ? (
                    <img src={previewUrl} alt={viewingFile.name} className="max-w-full max-h-full object-contain" />
                ) : isVideo && previewUrl ? (
                    <video src={previewUrl} controls className="max-w-full max-h-full">Your browser does not support video.</video>
                ) : isPdf && previewUrl ? (
                    <iframe src={previewUrl} className="w-full h-full border-none" title={viewingFile.name} />
                ) : isLink && isEmbeddable ? (
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={viewingFile.name}
                    />
                ) : isLink ? (
                    <div className="text-center px-8">
                        <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-2xl border-2 border-blue-200 flex items-center justify-center">
                            <Link2 size={40} className="text-blue-500" />
                        </div>
                        <p className="font-mono text-sm text-blue-600 bg-white/80 px-4 py-2 rounded-lg border border-blue-200 max-w-full truncate">
                            {getLinkDomain(viewingFile.downloadUrl)}
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <PreviewIcon />
                        <p className="font-mono text-xs text-gray-400 mt-2">
                            {isPdf ? 'PDF Document' : ['ppt', 'pptx'].includes(fileType) ? 'Presentation' : 'No preview'}
                        </p>
                    </div>
                )}
                <CloseButton onClick={onClose} className="absolute top-4 right-4" />
            </div>

            {/* Details */}
            <div className="p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-black line-clamp-2 mb-1" title={viewingFile.name}>
                        {viewingFile.name.replace(/([_\-])/g, '$1\u200B')}
                    </h2>
                    <p className="text-gray-500 font-medium mb-4">
                        {isLink ? 'Added' : 'Uploaded'} by <span className="text-black font-bold">{viewingFile.uploaderName}</span> • {viewingFile.time || formatRelativeTime(viewingFile.createdAt)}
                    </p>
                    {/* URL display for links */}
                    {isLink && (
                        <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-100 mb-4">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">URL</p>
                            <p className="text-sm font-mono text-blue-600 truncate" title={viewingFile.downloadUrl}>
                                {viewingFile.downloadUrl}
                            </p>
                        </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="primary" onClick={handleView} icon={<ExternalLink />}>
                            {isLink ? 'Open Link' : 'View'}
                        </Button>
                        {!isLink && (
                            <Button variant="warning" onClick={handleDownload} icon={<Download />}>Download</Button>
                        )}
                        {canDelete && (
                            <Button variant="danger" onClick={handleDelete} icon={<Trash2 />}>Delete</Button>
                        )}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                    <h4 className="font-bold text-sm uppercase text-gray-400 mb-2">{isLink ? 'Link Details' : 'File Details'}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-gray-500">Type</p><p className="font-bold uppercase">{isLink ? 'External Link' : viewingFile.type}</p></div>
                        {!isLink && <div><p className="text-gray-500">Size</p><p className="font-bold">{viewingFile.size}</p></div>}
                        {isLink && <div><p className="text-gray-500">Domain</p><p className="font-bold">{getLinkDomain(viewingFile.downloadUrl)}</p></div>}
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
}
