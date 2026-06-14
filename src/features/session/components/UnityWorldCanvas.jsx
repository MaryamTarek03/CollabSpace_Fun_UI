import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Terminal, ArrowLeftRight, Mic, Video, Info, Sparkles, User, RefreshCw, Folder, FileText, ArrowLeft, X, Loader, Link2 } from 'lucide-react';
import useUIStore from '../../../store/useUIStore';
import useAuthStore from '../../../store/useAuthStore';
import api from '../../../services/api';
import { getFileUrl, getFileIcon } from '../../../shared/utils/helpers';

export default function UnityWorldCanvas({ spaceId }) {
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);

    useEffect(() => {
        navigateRef.current = navigate;
    }, [navigate]);

    const canvasRef = useRef(null);
    const scriptRef = useRef(null);
    const logContainerRef = useRef(null);

    const setUnityLoadingProgress = useUIStore((state) => state.setUnityLoadingProgress);
    const micEnabled = useUIStore((state) => state.sessionMicEnabled);
    const cameraEnabled = useUIStore((state) => state.sessionCameraEnabled);
    const setMicEnabled = useUIStore((state) => state.setSessionMicEnabled);
    const setCameraEnabled = useUIStore((state) => state.setSessionCameraEnabled);
    const { user } = useAuthStore();

        const [isSandbox, setIsSandbox] = useState(false);
    const [isRealUnityLoaded, setIsRealUnityLoaded] = useState(false);
    const [sandboxLogs, setSandboxLogs] = useState([]);
    const [playerPosition, setPlayerPosition] = useState({ x: 180, y: 70 });

    // Unity File Picker State
    const [filePickerOpen, setFilePickerOpen] = useState(false);
    const [filePickerTarget, setFilePickerTarget] = useState({ gameObject: 'ReactBridge', methodName: 'OnFileSelected' });
    const [filePickerAllowedTypes, setFilePickerAllowedTypes] = useState(null);
    const [filePickerFiles, setFilePickerFiles] = useState([]);
    const [filePickerFolders, setFilePickerFolders] = useState([]);
    const [filePickerCurrentFolderId, setFilePickerCurrentFolderId] = useState(null);
    const [filePickerLoading, setFilePickerLoading] = useState(false);
    const [filePickerBreadcrumbs, setFilePickerBreadcrumbs] = useState([]);

    // Helper to append log messages to console
    const logEvent = (source, message) => {
        const timestamp = new Date().toLocaleTimeString();
        setSandboxLogs((prev) => [...prev, { timestamp, source, message }]);
    };

    const callUnityExecute = (profileName, spaceId) => {
        logEvent('System', `Calling execute with name: "${profileName}", key: "${spaceId}"`);
        
        // 1. Check window.execute or window.Execute
        if (typeof window.execute === 'function') {
            try {
                window.execute(profileName, spaceId);
                logEvent('React -> Unity', `window.execute('${profileName}', '${spaceId}') succeeded`);
            } catch (err) {
                logEvent('React -> Unity', `window.execute failed: ${err.message}`);
            }
        }
        if (typeof window.Execute === 'function') {
            try {
                window.Execute(profileName, spaceId);
                logEvent('React -> Unity', `window.Execute('${profileName}', '${spaceId}') succeeded`);
            } catch (err) {
                logEvent('React -> Unity', `window.Execute failed: ${err.message}`);
            }
        }

        // 2. Check window.unityInstance.execute or window.unityInstance.Execute
        if (window.unityInstance) {
            if (typeof window.unityInstance.execute === 'function') {
                try {
                    window.unityInstance.execute(profileName, spaceId);
                    logEvent('React -> Unity', `unityInstance.execute('${profileName}', '${spaceId}') succeeded`);
                } catch (err) {
                    logEvent('React -> Unity', `unityInstance.execute failed: ${err.message}`);
                }
            }
            if (typeof window.unityInstance.Execute === 'function') {
                try {
                    window.unityInstance.Execute(profileName, spaceId);
                    logEvent('React -> Unity', `unityInstance.Execute('${profileName}', '${spaceId}') succeeded`);
                } catch (err) {
                    logEvent('React -> Unity', `unityInstance.Execute failed: ${err.message}`);
                }
            }

            // 3. SendMessage options (as individual arguments, as comma-separated string, and as JSON string)
            const sendMessageTargets = ['ReactBridge', 'execute', 'Execute'];
            sendMessageTargets.forEach(target => {
                try {
                    window.unityInstance.SendMessage(target, 'execute', profileName, spaceId);
                    window.unityInstance.SendMessage(target, 'Execute', profileName, spaceId);
                    
                    window.unityInstance.SendMessage(target, 'execute', `${profileName},${spaceId}`);
                    window.unityInstance.SendMessage(target, 'Execute', `${profileName},${spaceId}`);

                    window.unityInstance.SendMessage(target, 'execute', JSON.stringify({ name: profileName, key: spaceId }));
                    window.unityInstance.SendMessage(target, 'Execute', JSON.stringify({ name: profileName, key: spaceId }));
                } catch (err) {
                    // Fail silently for SendMessage targets that don't match
                }
            });
        }
    };

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [sandboxLogs]);

    // Handle interactive Sandbox keyboard movement (WASD / Arrows)
    useEffect(() => {
        if (!isSandbox) return;

        const handleKeyDown = (e) => {
            const step = 15;
            const key = e.key.toLowerCase();
            
            // Boundary constraints matching the playground dimensions
            const minX = 10;
            const maxX = 350;
            const minY = 10;
            const maxY = 150;

            let moved = false;
            let dir = '';

            setPlayerPosition((pos) => {
                let newX = pos.x;
                let newY = pos.y;

                if (key === 'w' || e.key === 'ArrowUp') {
                    newY = Math.max(minY, pos.y - step);
                    dir = 'UP';
                    moved = newY !== pos.y;
                } else if (key === 's' || e.key === 'ArrowDown') {
                    newY = Math.min(maxY, pos.y + step);
                    dir = 'DOWN';
                    moved = newY !== pos.y;
                } else if (key === 'a' || e.key === 'ArrowLeft') {
                    newX = Math.max(minX, pos.x - step);
                    dir = 'LEFT';
                    moved = newX !== pos.x;
                } else if (key === 'd' || e.key === 'ArrowRight') {
                    newX = Math.min(maxX, pos.x + step);
                    dir = 'RIGHT';
                    moved = newX !== pos.x;
                }

                if (moved) {
                    // Prevent page scroll
                    e.preventDefault();
                    logEvent('Unity Sandbox', `Player moved ${dir} to {x: ${newX}, y: ${newY}}`);
                }

                return { x: newX, y: newY };
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSandbox]);

    // Fetch file picker files and folders
    useEffect(() => {
        if (!filePickerOpen) return;

        let active = true;
        const fetchPickerContents = async () => {
            setFilePickerLoading(true);
            try {
                const [foldersData, filesData] = await Promise.all([
                    api.folders.getBySpace(spaceId, filePickerCurrentFolderId),
                    api.files.getBySpace(spaceId, filePickerCurrentFolderId)
                ]);
                if (active) {
                    setFilePickerFolders(foldersData || []);
                    setFilePickerFiles(filesData || []);
                }
            } catch (err) {
                console.error('Failed to fetch picker files:', err);
            } finally {
                if (active) setFilePickerLoading(false);
            }
        };

        fetchPickerContents();

        return () => {
            active = false;
        };
    }, [filePickerOpen, spaceId, filePickerCurrentFolderId]);

    const handleSelectFile = (file) => {
        const fileUrl = file.type === 'link' 
            ? file.url 
            : getFileUrl(file.downloadUrl || `/spaces/${spaceId}/storage/files/${file.id}/download`);

        if (window.unityInstance) {
            try {
                window.unityInstance.SendMessage(
                    filePickerTarget.gameObject, 
                    filePickerTarget.methodName, 
                    fileUrl
                );
                logEvent('React -> Unity', `Sent file URL to ${filePickerTarget.gameObject}.${filePickerTarget.methodName}: "${fileUrl}"`);
            } catch (err) {
                logEvent('React -> Unity', `Failed to SendMessage to Unity: ${err.message}`);
            }
        } else {
            logEvent('React -> Unity (Mock)', `Simulated response: Sent file URL "${fileUrl}" to target: "${filePickerTarget.gameObject}.${filePickerTarget.methodName}"`);
        }

        // Close the modal
        setFilePickerOpen(false);
    };

    useEffect(() => {
        // Define global callbacks for Unity to communicate with React
        window.unityCallbacks = {
            // Log outbound messages sent from SessionControlBar/React UI
            onOutboundMessage: (methodName, value) => {
                logEvent('React -> Unity', `SendMessage('ReactBridge', '${methodName}', ${value})`);
            },
            // Trigger leaving the session
            leaveSession: () => {
                logEvent('Unity -> React', 'leaveSession() called');
                if (navigateRef.current) {
                    navigateRef.current(`/dashboard/spaces/${spaceId}`);
                } else {
                    window.location.hash = `/dashboard/spaces/${spaceId}`;
                }
            },
            // Set mic muted from Unity side
            setMicMuted: (isMuted) => {
                logEvent('Unity -> React', `setMicMuted(${isMuted})`);
                setMicEnabled(!isMuted);
            },
            // Set camera muted from Unity side
            setCameraMuted: (isMuted) => {
                logEvent('Unity -> React', `setCameraMuted(${isMuted})`);
                setCameraEnabled(!isMuted);
            },
            // Open file picker modal
            openFilePicker: (gameObject, methodName, allowedTypes) => {
                logEvent('Unity -> React', `openFilePicker('${gameObject}', '${methodName}', '${allowedTypes || 'all'}') called`);
                setFilePickerTarget({
                    gameObject: gameObject || 'ReactBridge',
                    methodName: methodName || 'OnFileSelected'
                });
                setFilePickerAllowedTypes(allowedTypes || null);
                setFilePickerCurrentFolderId(null);
                setFilePickerBreadcrumbs([]);
                setFilePickerOpen(true);
            },
            // Mark Unity loaded from Unity side
            onUnityLoaded: () => {
                logEvent('Unity -> React', 'onUnityLoaded()');
                setUnityLoadingProgress(100);
                setIsRealUnityLoaded(true);
                const profileName = user?.name || user?.username || 'Guest';
                callUnityExecute(profileName, spaceId);
            }
        };

        window.openFilePicker = window.unityCallbacks.openFilePicker;

        // Initialize Loading
        logEvent('System', 'Checking for Unity WebGL build files...');
        
        // Path to the Unity WebGL loader script
        const loaderUrl = '/unity/Build/BB.loader.js';

        // Check if build files exist by performing a fetch check
        fetch(loaderUrl, { method: 'HEAD' })
            .then((res) => {
                if (res.ok) {
                    logEvent('System', 'Unity loader found. Spawning player...');
                    loadUnityPlayer(loaderUrl);
                } else {
                    throw new Error('404 loader not found');
                }
            })
            .catch(() => {
                logEvent('System', 'Unity WebGL build files not detected at /unity/Build/BB.loader.js');
                switchToSandboxMode();
            });

        return () => {
            const cleanupCanvas = (canvasElement) => {
                try {
                    const gl = canvasElement.getContext('webgl2') || canvasElement.getContext('webgl') || canvasElement.getContext('experimental-webgl');
                    if (gl) {
                        const loseContextExt = gl.getExtension('WEBGL_lose_context');
                        if (loseContextExt) {
                            loseContextExt.loseContext();
                        }
                    }
                } catch (err) {
                    console.warn('Failed to lose WebGL context:', err);
                }
                try {
                    if (canvasElement.parentNode) {
                        canvasElement.parentNode.removeChild(canvasElement);
                    }
                } catch (err) {
                    console.warn('Failed to remove canvas element from parent:', err);
                }
            };

            // Check if we have an active Unity instance and canvas
            if (window.unityInstance && canvasRef.current) {
                const instance = window.unityInstance;
                window.unityInstance = null;
                const canvas = canvasRef.current;

                // Move canvas to document.body offscreen to keep WebGL context alive for Quit
                try {
                    canvas.style.position = 'fixed';
                    canvas.style.left = '-9999px';
                    canvas.style.top = '-9999px';
                    canvas.style.width = '1px';
                    canvas.style.height = '1px';
                    document.body.appendChild(canvas);
                } catch (err) {
                    console.warn('Failed to move canvas to off-screen body container:', err);
                }

                try {
                    instance.Quit()
                        .then(() => {
                            console.log('Unity instance successfully quit');
                            cleanupCanvas(canvas);
                        })
                        .catch((err) => {
                            console.warn('Unity instance Quit error:', err);
                            cleanupCanvas(canvas);
                        });
                } catch (err) {
                    console.warn('Unity instance Quit catch:', err);
                    cleanupCanvas(canvas);
                }
            } else if (canvasRef.current) {
                cleanupCanvas(canvasRef.current);
            }

            delete window.openFilePicker;
            delete window.unityCallbacks;
        };
    }, [spaceId]);

    // Handle real Unity WebGL instantiation
    const loadUnityPlayer = (src) => {
        const instantiateUnity = () => {
            const config = {
                dataUrl: '/unity/Build/BB.data.gz',
                frameworkUrl: '/unity/Build/BB.framework.js.gz',
                codeUrl: '/unity/Build/BB.wasm.gz',
                streamingAssetsUrl: 'StreamingAssets',
                companyName: 'CollabSpace',
                productName: 'CollabSpace3D',
                productVersion: '1.0',
            };

            if (typeof window.createUnityInstance === 'function') {
                window.createUnityInstance(canvasRef.current, config, (progress) => {
                    setUnityLoadingProgress(Math.round(progress * 100));
                })
                .then((instance) => {
                    window.unityInstance = instance;
                    setIsRealUnityLoaded(true);
                    setUnityLoadingProgress(100);
                    logEvent('System', 'Unity WebGL Instance initialized successfully!');
                    
                    const profileName = user?.name || user?.username || 'Guest';
                    setTimeout(() => {
                        callUnityExecute(profileName, spaceId);
                    }, 500);
                })
                .catch((err) => {
                    logEvent('System', `Initialization failed: ${err.message}`);
                    switchToSandboxMode();
                });
            } else {
                logEvent('System', 'createUnityInstance function not found on window object.');
                switchToSandboxMode();
            }
        };

        if (typeof window.createUnityInstance === 'function') {
            logEvent('System', 'Unity loader already present. Instantiating Unity WebGL...');
            instantiateUnity();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            logEvent('System', 'Loader script loaded successfully. Instantiating Unity WebGL...');
            instantiateUnity();
        };
        script.onerror = () => {
            logEvent('System', 'Failed to load Unity loader script dynamically.');
            switchToSandboxMode();
        };
        document.head.appendChild(script);
        scriptRef.current = script;
    };

    // Transition to sandbox mock mode
    const switchToSandboxMode = () => {
        logEvent('System', 'Starting Unity Sandbox Mock Mode...');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUnityLoadingProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsSandbox(true);
                logEvent('System', 'WebGL Sandbox Mode fully initialized and ready.');
                const profileName = user?.name || user?.username || 'Guest';
                logEvent('React -> Unity (Mock)', `Simulated execute('${profileName}', '${spaceId}')`);
            }
        }, 80);
    };

    // Simulate incoming unity callbacks
    const triggerIncomingMute = () => {
        if (window.unityCallbacks) {
            window.unityCallbacks.setMicMuted(true);
        }
    };

    const triggerIncomingUnmute = () => {
        if (window.unityCallbacks) {
            window.unityCallbacks.setMicMuted(false);
        }
    };

    const triggerIncomingCamMute = () => {
        if (window.unityCallbacks) {
            window.unityCallbacks.setCameraMuted(true);
        }
    };

    const triggerIncomingCamUnmute = () => {
        if (window.unityCallbacks) {
            window.unityCallbacks.setCameraMuted(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-[#0f172a] text-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
            
            {/* Real Unity Canvas (Hidden if Sandbox is active) */}
            <div className={`w-full h-full relative ${isSandbox ? 'hidden' : 'block'}`}>
                <canvas id="unity-canvas" ref={canvasRef} className="w-full h-full bg-slate-950" />
            </div>

            {/* Sandbox Mock UI */}
            {isSandbox && (
                <div className="w-full h-full flex flex-col md:flex-row relative">
                    
                    {/* Left: 3D Simulation Panel */}
                    <div className="flex-1 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden select-none border-b-2 md:border-b-0 md:border-r-2 border-black">
                        
                        {/* CSS Cyber Grid Background */}
                        <div 
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                                backgroundImage: `
                                    linear-gradient(to right, #6366f1 1px, transparent 1px),
                                    linear-gradient(to bottom, #6366f1 1px, transparent 1px)
                                `,
                                backgroundSize: '40px 40px',
                                transform: 'perspective(500px) rotateX(60deg) translateY(-100px)',
                            }}
                        />

                        {/* Playable sandbox arena */}
                        <div className="relative z-10 w-[400px] h-[220px] bg-slate-950/80 border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            {/* Grid markers or background lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px]" />
                            
                            {/* Instruction message */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-indigo-400 font-bold bg-slate-950/90 px-2 py-0.5 rounded border border-indigo-900 pointer-events-none">
                                MOVE WITH WASD OR ARROW KEYS
                            </div>

                            {/* Static mock participant (Bot 1) */}
                            <div className="absolute w-10 h-10 bg-slate-850 border-2 border-slate-700 rounded-full flex items-center justify-center left-[80px] top-[100px] pointer-events-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                                <span className="text-[10px] font-black text-slate-500">BOT</span>
                            </div>

                            {/* Playable Player Avatar */}
                            <div 
                                className="absolute w-12 h-12 bg-white text-slate-900 border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(99,102,241,1)] transition-all duration-75"
                                style={{
                                    left: `${playerPosition.x}px`,
                                    top: `${playerPosition.y}px`
                                }}
                            >
                                <User size={24} className="text-indigo-600" />
                                
                                {/* Head status badges */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none scale-75">
                                    <div className={`p-1 rounded-full border border-black ${micEnabled ? 'bg-green-400' : 'bg-red-400'}`}>
                                        <Mic size={10} className="text-black" />
                                    </div>
                                    <div className={`p-1 rounded-full border border-black ${cameraEnabled ? 'bg-green-400' : 'bg-red-400'}`}>
                                        <Video size={10} className="text-black" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black mt-6 tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            3D PLAYGROUND SIMULATOR
                        </h3>
                        <p className="text-indigo-300 font-mono text-sm max-w-sm mt-2 text-center">
                            Interactive Sandbox active. Move your avatar in real time. Place your Unity WebGL build in <code className="bg-slate-950/80 px-1 py-0.5 rounded text-pink-400 font-bold border border-slate-800">public/unity/Build/</code> to load the real scene.
                        </p>

                        {/* Corner Decorative Tech Indicators */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 text-indigo-400 font-mono text-xs">
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                            <span>GRID_READY // SECURE_CONN</span>
                        </div>
                    </div>

                    {/* Right: Sandbox Developer Console */}
                    <div className="w-full md:w-96 bg-slate-900 border-t-2 md:border-t-0 border-black flex flex-col h-1/2 md:h-full">
                        
                        {/* Console Header */}
                        <div className="bg-slate-950 p-4 border-b-2 border-black flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal size={18} className="text-yellow-400" />
                                <h4 className="font-black text-sm tracking-wide">UNITY DEV PORTAL</h4>
                            </div>
                            <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full text-xs font-bold font-mono">
                                SANDBOX ACTIVE
                            </span>
                        </div>

                        {/* Interactive Inbound Controls */}
                        <div className="p-4 bg-slate-950/40 border-b-2 border-black space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <ArrowLeftRight size={14} className="text-indigo-400" />
                                <span>Simulate Unity Events</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={triggerIncomingMute}
                                    className="bg-red-950/60 hover:bg-red-950/80 border border-red-700/50 rounded-xl py-2 px-3 text-xs font-bold text-red-300 transition-colors"
                                >
                                    Mute Mic
                                </button>
                                <button 
                                    onClick={triggerIncomingUnmute}
                                    className="bg-green-950/60 hover:bg-green-950/80 border border-green-700/50 rounded-xl py-2 px-3 text-xs font-bold text-green-300 transition-colors"
                                >
                                    Unmute Mic
                                </button>
                                <button 
                                    onClick={triggerIncomingCamMute}
                                    className="bg-red-950/60 hover:bg-red-950/80 border border-red-700/50 rounded-xl py-2 px-3 text-xs font-bold text-red-300 transition-colors"
                                >
                                    Disable Cam
                                </button>
                                <button 
                                    onClick={triggerIncomingCamUnmute}
                                    className="bg-green-950/60 hover:bg-green-950/80 border border-green-700/50 rounded-xl py-2 px-3 text-xs font-bold text-green-300 transition-colors"
                                >
                                    Enable Cam
                                </button>
                                <button 
                                    onClick={() => {
                                        if (window.unityCallbacks?.openFilePicker) {
                                            window.unityCallbacks.openFilePicker('ReactBridge', 'OnFileSelected', '');
                                        }
                                    }}
                                    className="col-span-2 bg-purple-900/60 hover:bg-purple-900/80 border border-purple-500/50 rounded-xl py-2.5 px-3 text-xs font-black text-purple-200 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Folder size={14} className="text-purple-400" />
                                    Simulate Unity Interaction (Open File Picker)
                                </button>
                            </div>
                        </div>

                        {/* Console Log Area */}
                        <div 
                            ref={logContainerRef}
                            className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2.5 bg-slate-950"
                        >
                            {sandboxLogs.map((log, i) => (
                                <div key={i} className="leading-relaxed border-b border-slate-900 pb-1.5 last:border-0">
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                                        <span>[{log.timestamp}]</span>
                                        <span className={`font-bold ${
                                            log.source.includes('System') ? 'text-indigo-400' :
                                            log.source.includes('React -> Unity') ? 'text-yellow-400' :
                                            'text-emerald-400'
                                        }`}>{log.source}</span>
                                    </div>
                                    <p className="text-slate-300 select-text break-words">{log.message}</p>
                                </div>
                            ))}
                        </div>

                        {/* Sandbox Info Footer */}
                        <div className="bg-slate-950 p-4 border-t-2 border-black flex gap-2 text-xs text-slate-400 leading-normal">
                            <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                            <p>
                                This simulator captures Bidirectional API messages in real time. Use bottom tools bar for outgoing calls.
                            </p>
                        </div>
                    </div>

                </div>
            )}

            {/* File Picker Modal Overlay */}
            {filePickerOpen && (
                <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl h-[500px] flex flex-col overflow-hidden text-black animate-scaleIn">
                        {/* Header */}
                        <div className="bg-purple-100 border-b-4 border-black p-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <Folder className="text-purple-600" size={24} />
                                <h3 className="text-xl font-black tracking-wide">Select File for Space</h3>
                            </div>
                            <button 
                                onClick={() => setFilePickerOpen(false)}
                                className="w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-red-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Navigation breadcrumbs */}
                        <div className="bg-amber-50 border-b-2 border-black px-6 py-3 flex items-center gap-2 text-sm font-bold shrink-0 overflow-x-auto whitespace-nowrap scrollbar-thin">
                            <button 
                                onClick={() => {
                                    setFilePickerCurrentFolderId(null);
                                    setFilePickerBreadcrumbs([]);
                                }}
                                className="hover:underline text-indigo-600"
                            >
                                Root
                            </button>
                            {filePickerBreadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={crumb.id}>
                                    <span className="text-gray-400">/</span>
                                    <button 
                                        onClick={() => {
                                            setFilePickerCurrentFolderId(crumb.id);
                                            setFilePickerBreadcrumbs(filePickerBreadcrumbs.slice(0, idx + 1));
                                        }}
                                        className="hover:underline text-indigo-600 max-w-[120px] truncate"
                                    >
                                        {crumb.name}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Main Files/Folders Grid */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]">
                            {filePickerLoading ? (
                                <div className="flex flex-col items-center justify-center h-full py-12">
                                    <Loader className="animate-spin text-purple-600 mb-2" size={32} />
                                    <p className="font-bold text-gray-500 text-sm">Loading storage...</p>
                                </div>
                            ) : (filePickerFolders.length === 0 && filePickerFiles.length === 0) ? (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-400">
                                    <Folder size={48} className="stroke-1 mb-2" />
                                    <p className="font-bold text-sm">This folder is empty</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {/* Folders */}
                                    {filePickerFolders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => {
                                                setFilePickerCurrentFolderId(folder.id);
                                                setFilePickerBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
                                            }}
                                            className="flex flex-col items-start p-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-left group"
                                        >
                                            <Folder className="text-yellow-600 group-hover:scale-110 transition-transform mb-2" size={28} />
                                            <span className="font-black text-sm text-gray-900 truncate w-full">{folder.name}</span>
                                            <span className="text-[10px] text-gray-500 font-bold mt-1">Folder</span>
                                        </button>
                                    ))}

                                    {/* Files / Links */}
                                    {filePickerFiles
                                        .filter(file => {
                                            if (!filePickerAllowedTypes) return true;
                                            const extension = file.name?.split('.').pop()?.toLowerCase();
                                            const typesList = filePickerAllowedTypes.toLowerCase().split(',').map(t => t.trim());
                                            return typesList.includes(extension) || typesList.includes(file.type);
                                        })
                                        .map(file => (
                                            <button
                                                key={file.id}
                                                onClick={() => handleSelectFile(file)}
                                                className="flex flex-col items-start p-4 bg-purple-50 hover:bg-purple-100 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-left group"
                                            >
                                                <div className="mb-2 group-hover:scale-110 transition-transform">
                                                    {file.type === 'link' ? <Link2 className="text-blue-500" size={28} /> : getFileIcon(file.type)}
                                                </div>
                                                <span className="font-black text-sm text-gray-900 truncate w-full" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-bold mt-1 uppercase">
                                                    {file.type} {file.size ? `• ${file.size}` : ''}
                                                </span>
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Footer / Selected Info */}
                        <div className="bg-gray-50 border-t-2 border-black p-4 flex items-center justify-between shrink-0 text-xs font-bold text-gray-500">
                            <span>Target: {filePickerTarget.gameObject}.{filePickerTarget.methodName}</span>
                            {filePickerAllowedTypes && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                                    Filters: {filePickerAllowedTypes}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
