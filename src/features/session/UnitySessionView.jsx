import React from 'react';
import UnityLoadingScreen from './components/UnityLoadingScreen';
import UnityWorldCanvas from './components/UnityWorldCanvas';
import SessionControlBar from './components/SessionControlBar';

export default function UnitySessionView({
    loadingProgress,
    onLeave
}) {
    const isLoading = loadingProgress < 100;

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center text-white">
            {isLoading ? (
                <UnityLoadingScreen progress={loadingProgress} />
            ) : (
                <div className="w-full h-full relative">
                    {/* 3D World Canvas Placeholder */}
                    <UnityWorldCanvas />

                    {/* Game UI Overlay - Top */}


                    {/* Game UI Overlay - Bottom Control Bar */}
                    <SessionControlBar />
                </div>
            )}
        </div>
    );
}
