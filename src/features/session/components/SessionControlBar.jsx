import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, MessageSquare, Smile, Monitor, LogOut } from 'lucide-react';
import { useUIStore } from '../../../store';

export default function SessionControlBar({ spaceId: propSpaceId }) {
    const { spaceId: paramSpaceId } = useParams();
    const spaceId = propSpaceId || paramSpaceId;
    const navigate = useNavigate();

    const {
        setCurrentView,
        sessionMicEnabled,
        setSessionMicEnabled,
        sessionCameraEnabled,
        setSessionCameraEnabled
    } = useUIStore();
    const [chatOpen, setChatOpen] = useState(false);

    // Use shared state
    const micEnabled = sessionMicEnabled;
    const cameraEnabled = sessionCameraEnabled;
    const setMicEnabled = setSessionMicEnabled;
    const setCameraEnabled = setSessionCameraEnabled;

    // Sync state with Unity WebGL / Sandbox
    useEffect(() => {
        const value = micEnabled ? 1 : 0;
        if (window.unityInstance) {
            try {
                window.unityInstance.SendMessage('ReactBridge', 'ToggleMic', value);
            } catch (err) {
                console.warn('Failed to send ToggleMic to Unity instance', err);
            }
        }
        // Log for Sandbox visualization
        if (window.unityCallbacks?.onOutboundMessage) {
            window.unityCallbacks.onOutboundMessage('ToggleMic', value);
        }
    }, [micEnabled]);

    useEffect(() => {
        const value = cameraEnabled ? 1 : 0;
        if (window.unityInstance) {
            try {
                window.unityInstance.SendMessage('ReactBridge', 'ToggleCamera', value);
            } catch (err) {
                console.warn('Failed to send ToggleCamera to Unity instance', err);
            }
        }
        // Log for Sandbox visualization
        if (window.unityCallbacks?.onOutboundMessage) {
            window.unityCallbacks.onOutboundMessage('ToggleCamera', value);
        }
    }, [cameraEnabled]);

    const handleLeaveSession = () => {
        navigate(`/dashboard/spaces/${spaceId}`);
    };

    const ControlButton = ({ active, onClick, activeColor = 'bg-white', inactiveColor = 'bg-red-400', children }) => (
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${active ? activeColor + ' hover:bg-gray-50 text-black' : inactiveColor + ' text-black hover:bg-red-500'
                }`}
        >
            {children}
        </button>
    );

    return (
        <>
            {/* Nearby Chat Popup */}
            {/* Nearby Chat Popup */}
            {chatOpen && (
                <>
                    {/* Click Outside Overlay */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setChatOpen(false)}
                    ></div>

                    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-80 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 z-20">
                        <div className="p-3">
                            <div className="bg-gray-100 border-2 border-black rounded-xl p-2 flex items-center gap-2">
                                <MessageSquare size={16} className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Message..."
                                    className="bg-transparent w-full outline-none text-sm font-medium placeholder-gray-500 text-black"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-bold mt-2 ml-1">
                                Messages here are ephemeral
                            </p>
                        </div>
                    </div>
                </>
            )}

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-2xl border-2 border-black flex gap-4 items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {/* Mic Toggle */}
                <ControlButton active={micEnabled} onClick={() => setMicEnabled(!micEnabled)}>
                    {micEnabled ? <Mic size={22} /> : <MicOff size={22} />}
                </ControlButton>

                {/* Camera Toggle */}
                <ControlButton active={cameraEnabled} onClick={() => setCameraEnabled(!cameraEnabled)}>
                    {cameraEnabled ? <Video size={22} /> : <VideoOff size={22} />}
                </ControlButton>

                {/* Divider */}
                <div className="w-0.5 h-8 bg-black/10"></div>

                {/* Chat */}
                <ControlButton active={!chatOpen} onClick={() => setChatOpen(!chatOpen)} activeColor="bg-yellow-100">
                    <MessageSquare size={22} />
                </ControlButton>

                {/* Emoji/Reactions */}
                <ControlButton active={true} onClick={() => { }} activeColor="bg-purple-100">
                    <Smile size={22} />
                </ControlButton>

                {/* Share Screen */}
                <ControlButton active={true} onClick={() => { }} activeColor="bg-blue-100">
                    <Monitor size={22} />
                </ControlButton>

                {/* Divider */}
                <div className="w-0.5 h-8 bg-black/10"></div>

                {/* Leave Session */}
                <ControlButton active={false} inactiveColor="bg-red-500 text-white" onClick={handleLeaveSession}>
                    <LogOut size={22} className="text-white" />
                </ControlButton>
            </div>
        </>
    );
}
