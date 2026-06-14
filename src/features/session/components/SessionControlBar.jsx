import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, MessageSquare, Smile, Monitor, LogOut, Folder } from 'lucide-react';
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
    const [emotesOpen, setEmotesOpen] = useState(false);
    const [ephemeralMessage, setEphemeralMessage] = useState('');

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
        if (window.unityInstance) {
            try {
                window.unityInstance.SendMessage('ReactBridge', 'LeaveSession', '');
            } catch (err) {
                console.warn('Failed to send LeaveSession to Unity:', err);
            }
        }
        if (window.unityCallbacks?.onOutboundMessage) {
            window.unityCallbacks.onOutboundMessage('LeaveSession', '');
        }
        navigate(`/dashboard/spaces/${spaceId}`);
    };

    const handleSendEphemeralMessage = (e) => {
        if (e.key === 'Enter' && ephemeralMessage.trim()) {
            const messageText = ephemeralMessage.trim();
            if (window.unityInstance) {
                try {
                    window.unityInstance.SendMessage('ReactBridge', 'SendEphemeralChat', messageText);
                } catch (err) {
                    console.warn('Failed to send SendEphemeralChat to Unity:', err);
                }
            }
            if (window.unityCallbacks?.onOutboundMessage) {
                window.unityCallbacks.onOutboundMessage('SendEphemeralChat', messageText);
            }
            setEphemeralMessage('');
        }
    };

    const handleTriggerEmote = (emoteName) => {
        if (window.unityInstance) {
            try {
                window.unityInstance.SendMessage('ReactBridge', 'TriggerEmote', emoteName);
            } catch (err) {
                console.warn('Failed to send TriggerEmote to Unity:', err);
            }
        }
        if (window.unityCallbacks?.onOutboundMessage) {
            window.unityCallbacks.onOutboundMessage('TriggerEmote', emoteName);
        }
        setEmotesOpen(false);
    };

    const ControlButton = ({ active, onClick, activeColor = 'bg-white', inactiveColor = 'bg-red-400', children }) => (
        <button
            onClick={onClick}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none shrink-0 ${active ? activeColor + ' hover:bg-gray-50 text-black' : inactiveColor + ' text-black hover:bg-red-500'
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
                                    value={ephemeralMessage}
                                    onChange={(e) => setEphemeralMessage(e.target.value)}
                                    onKeyDown={handleSendEphemeralMessage}
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

            {/* Reactions Popover */}
            {emotesOpen && (
                <>
                    {/* Click Outside Overlay */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setEmotesOpen(false)}
                    ></div>
                    <div className="absolute bottom-28 left-1/2 translate-x-[40px] bg-white border-2 border-black rounded-2xl p-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-2.5 items-center z-20 animate-in slide-in-from-bottom-5 fade-in duration-200">
                        {[
                            { emoji: '👋', name: 'wave' },
                            { emoji: '👍', name: 'thumbsup' },
                            { emoji: '👏', name: 'clap' },
                            { emoji: '❤️', name: 'heart' },
                            { emoji: '🔥', name: 'fire' }
                        ].map((emote) => (
                            <button
                                key={emote.name}
                                onClick={() => handleTriggerEmote(emote.name)}
                                className="text-2xl hover:scale-125 transition-transform duration-100 p-1 rounded-lg hover:bg-purple-50"
                                title={emote.name}
                            >
                                {emote.emoji}
                            </button>
                        ))}
                    </div>
                </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-3 py-2 md:px-6 md:py-4 rounded-2xl border-2 border-black flex gap-2 md:gap-4 items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-[95%] sm:w-auto justify-center overflow-x-auto no-scrollbar z-40">
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
                <ControlButton active={!emotesOpen} onClick={() => setEmotesOpen(!emotesOpen)} activeColor="bg-purple-100">
                    <Smile size={22} />
                </ControlButton>

                {/* Share Screen */}
                <ControlButton active={true} onClick={() => { }} activeColor="bg-blue-100">
                    <Monitor size={22} />
                </ControlButton>

                {/* Mock File Picker Trigger */}
                <ControlButton 
                    active={true} 
                    onClick={() => {
                        if (window.openFilePicker) {
                            window.openFilePicker('ReactBridge', 'OnFileSelected', '');
                        } else if (window.unityCallbacks?.openFilePicker) {
                            window.unityCallbacks.openFilePicker('ReactBridge', 'OnFileSelected', '');
                        } else {
                            console.warn('File picker callback not registered');
                        }
                    }} 
                    activeColor="bg-green-100"
                >
                    <Folder size={22} />
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
