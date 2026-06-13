import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Terminal, ArrowLeftRight, Mic, Video, Info, Sparkles, User, RefreshCw } from 'lucide-react';
import useUIStore from '../../../store/useUIStore';
import useAuthStore from '../../../store/useAuthStore';

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
            // Mark Unity loaded from Unity side
            onUnityLoaded: () => {
                logEvent('Unity -> React', 'onUnityLoaded()');
                setUnityLoadingProgress(100);
                setIsRealUnityLoaded(true);
                const profileName = user?.name || user?.username || 'Guest';
                callUnityExecute(profileName, spaceId);
            }
        };

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
        </div>
    );
}
