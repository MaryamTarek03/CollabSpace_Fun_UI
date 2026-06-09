import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function UnityWorldCanvas() {
    return (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-indigo-900 flex items-center justify-center">
            <div className="text-center">
                <Gamepad2 size={100} className="mx-auto mb-4 text-white/20" />
                <h1 className="text-5xl font-black text-white/30">GAME WORLD CANVAS</h1>
                <p className="text-white/30 font-mono mt-4">Interactive Unity WebGL Build running here...</p>
            </div>
        </div>
    );
}
