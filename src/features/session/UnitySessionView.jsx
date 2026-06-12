import React from 'react';
import { useParams } from 'react-router-dom';
import useUIStore from '../../store/useUIStore';
import UnityLoadingScreen from './components/UnityLoadingScreen';
import UnityWorldCanvas from './components/UnityWorldCanvas';
import SessionControlBar from './components/SessionControlBar';

export default function UnitySessionView() {
    const { spaceId } = useParams();
    const loadingProgress = useUIStore((state) => state.unityLoadingProgress);
    const isLoading = loadingProgress < 100;

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center text-white">
            {/* Always mount UnityWorldCanvas so the loading loader script/sandbox initializes */}
            <UnityWorldCanvas spaceId={spaceId} />

            {/* Display Loading Screen as an overlay */}
            {isLoading ? (
                <UnityLoadingScreen progress={loadingProgress} />
            ) : (
                /* Overlay UI Controls when loaded */
                <SessionControlBar spaceId={spaceId} />
            )}
        </div>
    );
}
