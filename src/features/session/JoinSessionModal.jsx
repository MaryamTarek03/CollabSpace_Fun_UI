import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Volume2, User } from 'lucide-react';
import { useUIStore, useSpacesStore, useChatStore } from '../../store';

export default function JoinSessionModal() {
    const {
        isJoinSessionModalOpen,
        closeJoinSessionModal,
        setCurrentView,
        sessionMicEnabled,
        setSessionMicEnabled,
        sessionCameraEnabled,
        setSessionCameraEnabled
    } = useUIStore();
    const { activeSpace } = useSpacesStore();
    const { setActiveChatSpace } = useChatStore();

    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    // Device states - now using store
    const micEnabled = sessionMicEnabled;
    const cameraEnabled = sessionCameraEnabled;
    const setMicEnabled = setSessionMicEnabled;
    const setCameraEnabled = setSessionCameraEnabled;

    // Available devices
    const [microphones, setMicrophones] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [cameras, setCameras] = useState([]);

    // Selected devices
    const [selectedMic, setSelectedMic] = useState('');
    const [selectedSpeaker, setSelectedSpeaker] = useState('');
    const [selectedCamera, setSelectedCamera] = useState('');

    // Audio test
    const [testingAudio, setTestingAudio] = useState(false);
    const [micLevel, setMicLevel] = useState(0);

    // Get available devices
    useEffect(() => {
        if (!isJoinSessionModalOpen) return;

        const getDevices = async () => {
            try {
                // Request permissions first
                await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

                const devices = await navigator.mediaDevices.enumerateDevices();

                const mics = devices.filter(d => d.kind === 'audioinput');
                const spkrs = devices.filter(d => d.kind === 'audiooutput');
                const cams = devices.filter(d => d.kind === 'videoinput');

                setMicrophones(mics);
                setSpeakers(spkrs);
                setCameras(cams);

                if (mics.length > 0 && !selectedMic) setSelectedMic(mics[0].deviceId);
                if (spkrs.length > 0 && !selectedSpeaker) setSelectedSpeaker(spkrs[0].deviceId);
                if (cams.length > 0 && !selectedCamera) setSelectedCamera(cams[0].deviceId);
            } catch (err) {
                console.error('Error getting devices:', err);
            }
        };

        getDevices();
    }, [isJoinSessionModalOpen]);

    // Setup camera preview
    useEffect(() => {
        if (!isJoinSessionModalOpen || !cameraEnabled) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            return;
        }

        const setupCamera = async () => {
            try {
                const constraints = {
                    video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
                    audio: false
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
            }
        };

        setupCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isJoinSessionModalOpen, cameraEnabled, selectedCamera]);

    // Mic level monitoring
    useEffect(() => {
        if (!isJoinSessionModalOpen || !micEnabled) {
            setMicLevel(0);
            return;
        }

        let audioContext;
        let analyser;
        let microphone;
        let animationId;

        const setupMicLevel = async () => {
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
                });

                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(audioStream);
                microphone.connect(analyser);

                analyser.fftSize = 256;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const updateLevel = () => {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setMicLevel(average / 255 * 100);
                    animationId = requestAnimationFrame(updateLevel);
                };

                updateLevel();
            } catch (err) {
                console.error('Error setting up mic level:', err);
            }
        };

        setupMicLevel();

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            if (audioContext) audioContext.close();
        };
    }, [isJoinSessionModalOpen, micEnabled, selectedMic]);

    const handleTestAudio = () => {
        setTestingAudio(true);
        // Play a test sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdGmeli0nNWB+q4taMi4lO1eIrp14UjQnJTtXiK6deFA0JyU7V4iunXhQNCclO1eIrp14UDQnJTtXiK6deFAz');
        audio.play().catch(() => { });
        setTimeout(() => setTestingAudio(false), 1000);
    };

    const handleJoinSession = () => {
        // Clean up streams
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Launch Unity session with loading progress
        useUIStore.getState().setUnityLoadingProgress(0);
        setCurrentView('unity-view');
        closeJoinSessionModal();

        // Simulate progress loading
        const interval = setInterval(() => {
            const current = useUIStore.getState().unityLoadingProgress;
            if (current >= 100) {
                clearInterval(interval);
                return;
            }
            useUIStore.getState().setUnityLoadingProgress(current + 5);
        }, 100);
    };

    const handleClose = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        closeJoinSessionModal();
    };

    if (!isJoinSessionModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b-2 border-black bg-gradient-to-r from-pink-100 to-purple-100 flex justify-between items-center">
                    <h2 className="text-xl font-black">🎥 Join Session</h2>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-red-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Landscape Layout - Camera Left, Controls Right */}
                <div className="flex flex-col lg:flex-row">
                    {/* Left Side - Camera Preview */}
                    <div className="lg:w-1/2 flex flex-col">
                        {/* Camera Preview */}
                        <div className="bg-gray-800 h-64 lg:h-80 flex items-center justify-center relative">
                            {cameraEnabled && stream ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-600">
                                        <User size={48} className="text-gray-500" />
                                    </div>
                                    <p className="font-medium text-lg">Camera Preview</p>
                                </div>
                            )}
                        </div>

                        {/* Toggle Buttons */}
                        <div className="flex justify-center gap-4 py-4 bg-gray-100 border-t-2 lg:border-r-2 border-black">
                            <button
                                onClick={() => setMicEnabled(!micEnabled)}
                                className={`w-14 h-14 rounded-full border-2 border-black flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${micEnabled ? 'bg-white hover:bg-gray-100' : 'bg-red-400 text-white hover:bg-red-500'
                                    }`}
                            >
                                {micEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                            </button>
                            <button
                                onClick={() => setCameraEnabled(!cameraEnabled)}
                                className={`w-14 h-14 rounded-full border-2 border-black flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${cameraEnabled ? 'bg-white hover:bg-gray-100' : 'bg-red-400 text-white hover:bg-red-500'
                                    }`}
                            >
                                {cameraEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Device Selection */}
                    <div className="lg:w-1/2 p-4 space-y-3 border-t-2 lg:border-t-0 lg:border-l-2 border-black flex flex-col justify-center">
                        {/* Microphone */}
                        <div>
                            <label className="flex items-center gap-2 font-bold mb-1 text-sm">
                                <Mic size={16} /> Microphone
                            </label>
                            <select
                                value={selectedMic}
                                onChange={(e) => setSelectedMic(e.target.value)}
                                className="w-full border-2 border-black rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer text-sm"
                            >
                                {microphones.map(mic => (
                                    <option key={mic.deviceId} value={mic.deviceId}>
                                        {mic.label || `Microphone ${microphones.indexOf(mic) + 1}`}
                                    </option>
                                ))}
                            </select>
                            {/* Mic Level Bar */}
                            <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-75"
                                    style={{ width: `${micLevel}%` }}
                                />
                            </div>
                        </div>

                        {/* Speaker */}
                        <div>
                            <label className="flex items-center gap-2 font-bold mb-1 text-sm">
                                <Volume2 size={16} /> Speaker
                            </label>
                            <select
                                value={selectedSpeaker}
                                onChange={(e) => setSelectedSpeaker(e.target.value)}
                                className="w-full border-2 border-black rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer text-sm"
                            >
                                {speakers.map(spk => (
                                    <option key={spk.deviceId} value={spk.deviceId}>
                                        {spk.label || `Speaker ${speakers.indexOf(spk) + 1}`}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleTestAudio}
                                disabled={testingAudio}
                                className="mt-1.5 px-3 py-1.5 bg-gray-100 border-2 border-black rounded-xl font-bold text-xs hover:bg-gray-200 disabled:opacity-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                            >
                                {testingAudio ? 'Playing...' : 'Test Audio'}
                            </button>
                        </div>

                        {/* Camera */}
                        <div>
                            <label className="flex items-center gap-2 font-bold mb-1 text-sm">
                                <Video size={16} /> Camera
                            </label>
                            <select
                                value={selectedCamera}
                                onChange={(e) => setSelectedCamera(e.target.value)}
                                className="w-full border-2 border-black rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer text-sm"
                            >
                                {cameras.map(cam => (
                                    <option key={cam.deviceId} value={cam.deviceId}>
                                        {cam.label || `Camera ${cameras.indexOf(cam) + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Join Button */}
                        <button
                            onClick={handleJoinSession}
                            className="w-full bg-green-400 text-black py-3 rounded-xl border-2 border-black font-black text-base hover:bg-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all mt-2"
                        >
                            Join Session 🚀
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
