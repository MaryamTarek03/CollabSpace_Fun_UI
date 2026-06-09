import React from 'react';
import { Loader2 } from 'lucide-react';

export default function UnityLoadingScreen({ progress }) {
    return (
        <div className="text-center w-full max-w-md p-8">
            <Loader2 size={64} className="animate-spin text-yellow-300 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-4">Entering 3D World...</h2>
            <div className="w-full h-4 bg-gray-700 rounded-full border-2 border-black overflow-hidden relative">
                <div
                    className="h-full bg-accent transition-all duration-100"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="mt-4 font-mono text-gray-400">Loading assets... {progress}%</p>
        </div>
    );
}
